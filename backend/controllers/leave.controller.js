const { LeaveApplication, Member, Attendance, Staff } = require('../models');
const { AppError } = require('../utils/AppError');

/* ─── POST /api/leave/apply ─────────────────────────────── */
const applyLeave = async (req, res, next) => {
  try {
    const { member_id } = req.user;
    const { leave_type, from_date, to_date, reason } = req.body;

    if (!leave_type || !from_date || !to_date || !reason)
      throw new AppError('VALIDATION_ERROR', 'leave_type, from_date, to_date, reason required.', 400);

    const from = new Date(from_date);
    const to   = new Date(to_date);
    if (to < from) throw new AppError('VALIDATION_ERROR', 'to_date must be ≥ from_date.', 400);

    const days = Math.floor((to - from) / 86_400_000) + 1;

    // Check leave balance
    const balCol = {
      casual:   'casual_leave_balance',
      medical:  'medical_leave_balance',
      official: 'official_leave_balance',
    }[leave_type];

    if (balCol) {
      const member = await Member.findOne({ member_id });
      if (!member || member[balCol] < days) {
        const bal = member ? member[balCol] : 0;
        throw new AppError(
          'INSUFFICIENT_BALANCE',
          `Insufficient ${leave_type} leave balance (${bal} days left, ${days} requested).`,
          400
        );
      }
    }

    // Overlap check
    const overlap = await LeaveApplication.findOne({
      member_id,
      status: { $in: ['pending', 'approved'] },
      from_date: { $lte: to_date },
      to_date:   { $gte: from_date },
    });

    if (overlap)
      throw new AppError('DATE_CONFLICT', 'A leave application already exists for those dates.', 409);

    const leave = await LeaveApplication.create({
      member_id,
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
const getMyLeaveApplications = async (req, res, next) => {
  try {
    const { member_id } = req.user;
    const { status, year } = req.query;
    const y = year ? String(year) : String(new Date().getFullYear());

    const filter = { member_id, from_date: { $regex: `^${y}` } };
    if (status) filter.status = status;

    const [rows, member] = await Promise.all([
      LeaveApplication.find(filter)
        .populate('reviewed_by', 'full_name email')
        .sort({ submitted_at: -1 })
        .lean(),
      Member.findOne({ member_id }).select(
        'casual_leave_balance medical_leave_balance official_leave_balance'
      ),
    ]);

    const formattedRows = rows.map((r) => ({
      ...r,
      reviewed_by_name: r.reviewed_by?.full_name || null,
    }));

    return res.json({
      success: true,
      data: formattedRows,
      balance: member
        ? {
            casual_leave_balance:   member.casual_leave_balance,
            medical_leave_balance:  member.medical_leave_balance,
            official_leave_balance: member.official_leave_balance,
          }
        : null,
    });
  } catch (err) {
    next(err);
  }
};

/* ─── PATCH /api/dean/leave/:id/review  (staff) ─────────── */
const reviewLeaveApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, comment } = req.body;
    const staffId = req.staff.id;

    if (!['approve', 'reject'].includes(action))
      throw new AppError('VALIDATION_ERROR', 'action must be approve or reject.', 400);
    if (action === 'reject' && !comment)
      throw new AppError('VALIDATION_ERROR', 'Comment required for rejection.', 400);

    const existing = await LeaveApplication.findById(id);
    if (!existing) throw new AppError('NOT_FOUND', 'Leave application not found.', 404);
    if (existing.status !== 'pending')
      throw new AppError('CONFLICT', 'This application has already been reviewed.', 409);

    existing.status           = action === 'approve' ? 'approved' : 'rejected';
    existing.reviewer_comment = comment || null;
    existing.reviewed_by      = staffId;
    existing.reviewed_at      = new Date();

    await existing.save();

    // Deduct leave balance on approval & mark attendance
    if (action === 'approve') {
      const colMap = {
        casual:   'casual_leave_balance',
        medical:  'medical_leave_balance',
        official: 'official_leave_balance',
      };
      const col = colMap[existing.leave_type];
      if (col) {
        await Member.updateOne(
          { member_id: existing.member_id },
          { $inc: { [col]: -existing.days_requested } }
        );

        // Mark attendance as leave for each day in range
        const cur = new Date(existing.from_date);
        const end = new Date(existing.to_date);
        while (cur <= end) {
          const dStr = cur.toISOString().split('T')[0];
          await Attendance.updateOne(
            { member_id: existing.member_id, date: dStr },
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

module.exports = { applyLeave, getMyLeaveApplications, reviewLeaveApplication };
