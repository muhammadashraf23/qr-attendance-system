const { LeaveRequest, Employee, Attendance, Admin } = require('../models');
const { AppError } = require('../utils/AppError');

/* ─── POST /api/leave/apply ─────────────────────────────── */
const applyLeave = async (req, res, next) => {
  try {
    const { employee_id } = req.user;
    const { leave_type, from_date, to_date, reason } = req.body;

    if (!leave_type || !from_date || !to_date || !reason)
      throw new AppError('VALIDATION_ERROR', 'leave_type, from_date, to_date, reason required.', 400);

    const from = new Date(from_date);
    const to = new Date(to_date);
    if (to < from) throw new AppError('VALIDATION_ERROR', 'to_date must be ≥ from_date.', 400);

    const days = Math.floor((to - from) / 86_400_000) + 1;

    // Check leave balance
    const balCol = {
      casual: 'casual_leave_balance',
      sick: 'sick_leave_balance',
      paid: 'paid_leave_balance',
    }[leave_type];

    if (balCol) {
      const emp = await Employee.findOne({ employee_id });
      if (!emp || emp[balCol] < days) {
        const bal = emp ? emp[balCol] : 0;
        throw new AppError(
          'INSUFFICIENT_BALANCE',
          `Insufficient ${leave_type} leave balance (${bal} days left, ${days} requested).`,
          400
        );
      }
    }

    // Overlap check: range1 overlaps range2 if from_date <= req.to_date AND to_date >= req.from_date
    const overlap = await LeaveRequest.findOne({
      employee_id,
      status: { $in: ['pending', 'approved'] },
      from_date: { $lte: to_date },
      to_date: { $gte: from_date },
    });

    if (overlap)
      throw new AppError('DATE_CONFLICT', 'A leave request already exists for those dates.', 409);

    const leave = await LeaveRequest.create({
      employee_id,
      leave_type,
      from_date,
      to_date,
      days_requested: days,
      reason,
      status: 'pending',
    });

    return res.status(201).json({ success: true, data: leave });
  } catch (err) {
    next(err);
  }
};

/* ─── GET /api/leave/my ─────────────────────────────────── */
const getMyLeaves = async (req, res, next) => {
  try {
    const { employee_id } = req.user;
    const { status, year } = req.query;
    const y = year ? String(year) : String(new Date().getFullYear());

    const filter = {
      employee_id,
      from_date: { $regex: `^${y}` },
    };
    if (status) filter.status = status;

    const [rows, emp] = await Promise.all([
      LeaveRequest.find(filter)
        .populate('reviewed_by', 'name email')
        .sort({ submitted_at: -1 })
        .lean(),
      Employee.findOne({ employee_id }).select(
        'casual_leave_balance sick_leave_balance paid_leave_balance'
      ),
    ]);

    const formattedRows = rows.map((r) => ({
      ...r,
      reviewed_by_name: r.reviewed_by?.name || null,
    }));

    return res.json({
      success: true,
      data: formattedRows,
      balance: emp
        ? {
            casual_leave_balance: emp.casual_leave_balance,
            sick_leave_balance: emp.sick_leave_balance,
            paid_leave_balance: emp.paid_leave_balance,
          }
        : null,
    });
  } catch (err) {
    next(err);
  }
};

/* ─── PATCH /api/admin/leave/:id/review  (admin) ────────── */
const reviewLeave = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, comment } = req.body;
    const adminId = req.admin.id;

    if (!['approve', 'reject'].includes(action))
      throw new AppError('VALIDATION_ERROR', 'action must be approve or reject.', 400);
    if (action === 'reject' && !comment)
      throw new AppError('VALIDATION_ERROR', 'Comment required for rejection.', 400);

    const existing = await LeaveRequest.findById(id);
    if (!existing) throw new AppError('NOT_FOUND', 'Leave request not found.', 404);
    if (existing.status !== 'pending')
      throw new AppError('CONFLICT', 'This request has already been reviewed.', 409);

    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    existing.status = newStatus;
    existing.admin_comment = comment || null;
    existing.reviewed_by = adminId;
    existing.reviewed_at = new Date();

    await existing.save();

    // Deduct leave balance on approval & mark attendance
    if (action === 'approve') {
      const colMap = {
        casual: 'casual_leave_balance',
        sick: 'sick_leave_balance',
        paid: 'paid_leave_balance',
      };
      const col = colMap[existing.leave_type];
      if (col) {
        await Employee.updateOne(
          { employee_id: existing.employee_id },
          { $inc: { [col]: -existing.days_requested } }
        );

        // Mark attendance as leave for each day in date range
        const cur = new Date(existing.from_date);
        const end = new Date(existing.to_date);
        while (cur <= end) {
          const dStr = cur.toISOString().split('T')[0];
          await Attendance.updateOne(
            { employee_id: existing.employee_id, date: dStr },
            { $setOnInsert: { status: 'leave', method: 'manual' } },
            { upsert: true }
          );
          cur.setDate(cur.getDate() + 1);
        }
      }
    }

    return res.json({ success: true, data: existing });
  } catch (err) {
    next(err);
  }
};

module.exports = { applyLeave, getMyLeaves, reviewLeave };
