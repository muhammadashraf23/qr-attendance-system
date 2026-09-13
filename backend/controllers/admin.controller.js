const bcrypt = require('bcrypt');
const { Employee, Attendance, LeaveRequest, Department, SystemSetting } = require('../models');
const { AppError } = require('../utils/AppError');

/* ─── GET /api/admin/dashboard ──────────────────────────── */
const getDashboard = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400_000).toISOString().split('T')[0];

    const [totalCount, activeEmployees, todayAttendance, pendingCount, trendRaw] =
      await Promise.all([
        Employee.countDocuments({ is_active: true }),
        Employee.find({ is_active: true }).lean(),
        Attendance.find({ date: today }).lean(),
        LeaveRequest.countDocuments({ status: 'pending' }),
        Attendance.aggregate([
          { $match: { date: { $gte: thirtyDaysAgo } } },
          {
            $group: {
              _id: '$date',
              present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
              absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
              on_leave: { $sum: { $cond: [{ $eq: ['$status', 'leave'] }, 1, 0] } },
            },
          },
          { $sort: { _id: 1 } },
          { $project: { date: '$_id', present: 1, absent: 1, on_leave: 1, _id: 0 } },
        ]),
      ]);

    const attMap = new Map();
    todayAttendance.forEach((a) => attMap.set(a.employee_id, a));

    const todayRecords = activeEmployees.map((e) => {
      const a = attMap.get(e.employee_id);
      return {
        employee_id: e.employee_id,
        full_name: e.full_name,
        department: e.department_name || '',
        check_in_time: a?.check_in_time || null,
        check_out_time: a?.check_out_time || null,
        status: a?.status || 'absent',
        is_late: a?.is_late || false,
        method: a?.method || null,
        working_minutes: a?.working_minutes || 0,
      };
    });

    // Sort by check_in_time ASC nulls last
    todayRecords.sort((a, b) => {
      if (!a.check_in_time && !b.check_out_time) return 0;
      if (!a.check_in_time) return 1;
      if (!b.check_in_time) return -1;
      return new Date(a.check_in_time) - new Date(b.check_in_time);
    });

    // Department stats
    const deptMap = new Map();
    activeEmployees.forEach((e) => {
      const dept = e.department_name || 'General';
      if (!deptMap.has(dept)) {
        deptMap.set(dept, { name: dept, total: 0, present: 0 });
      }
      const item = deptMap.get(dept);
      item.total++;
      const a = attMap.get(e.employee_id);
      if (a && a.status === 'present') item.present++;
    });
    const departmentStats = Array.from(deptMap.values());

    const present = todayRecords.filter((r) => r.check_in_time && r.status !== 'leave').length;
    const onLeave = todayRecords.filter((r) => r.status === 'leave').length;
    const absent = Math.max(0, totalCount - present - onLeave);
    const late = todayRecords.filter((r) => r.is_late).length;

    return res.json({
      success: true,
      data: {
        summary: {
          total: totalCount,
          present,
          absent,
          on_leave: onLeave,
          late,
          pending_leaves: pendingCount,
        },
        today_records: todayRecords,
        department_stats: departmentStats,
        attendance_trend: trendRaw,
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ─── GET /api/admin/reports ─────────────────────────────── */
const getReports = async (req, res, next) => {
  try {
    const { from, to, department, employee_id } = req.query;
    if (!from || !to) throw new AppError('VALIDATION_ERROR', 'from and to required.', 400);

    const empFilter = { is_active: true };
    if (department) empFilter.department_name = department;
    if (employee_id) empFilter.employee_id = employee_id;

    const employees = await Employee.find(empFilter).lean();
    const empIds = employees.map((e) => e.employee_id);

    const attendanceRecords = await Attendance.find({
      employee_id: { $in: empIds },
      date: { $gte: from, $lte: to },
    }).lean();

    const empMap = new Map();
    employees.forEach((e) => empMap.set(e.employee_id, e));

    const rows = attendanceRecords.map((a) => {
      const emp = empMap.get(a.employee_id) || {};
      return {
        employee_id: a.employee_id,
        full_name: emp.full_name || '',
        department: emp.department_name || '',
        date: a.date,
        check_in_time: a.check_in_time,
        check_out_time: a.check_out_time,
        working_minutes: a.working_minutes,
        status: a.status,
        is_late: a.is_late,
        method: a.method,
      };
    });

    rows.sort((a, b) => a.employee_id.localeCompare(b.employee_id) || a.date.localeCompare(b.date));

    return res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

/* ─── POST /api/admin/employee/add ──────────────────────── */
const addEmployee = async (req, res, next) => {
  try {
    const {
      employee_id,
      full_name,
      email,
      phone,
      department_name,
      designation,
      date_of_joining,
      base_salary,
      password,
    } = req.body;

    const required = [employee_id, full_name, email, phone, date_of_joining, password];
    if (required.some((v) => !v))
      throw new AppError('VALIDATION_ERROR', 'Missing required fields.', 400);

    const hash = await bcrypt.hash(password, 12);
    const employee = await Employee.create({
      employee_id,
      full_name,
      email: email.toLowerCase(),
      phone,
      department_name: department_name || '',
      designation: designation || '',
      date_of_joining: new Date(date_of_joining),
      base_salary: base_salary || 0,
      password_hash: hash,
    });

    const empObj = employee.toObject();
    delete empObj.password_hash;

    return res.status(201).json({ success: true, employee: empObj });
  } catch (err) {
    if (err.code === 11000)
      return next(new AppError('DUPLICATE', 'Employee ID, email, or phone already exists.', 409));
    next(err);
  }
};

/* ─── GET /api/admin/employees ───────────────────────────── */
const getEmployees = async (req, res, next) => {
  try {
    const { search, department, active = 'true', page = 1, limit = 50 } = req.query;
    const filter = {};

    if (active !== 'all') {
      filter.is_active = active === 'true';
    }
    if (department) {
      filter.department_name = department;
    }
    if (search) {
      const reg = new RegExp(search, 'i');
      filter.$or = [{ full_name: reg }, { employee_id: reg }, { email: reg }];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const rows = await Employee.find(filter)
      .select('-password_hash')
      .sort({ full_name: 1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const formatted = rows.map((e) => ({
      ...e,
      department: e.department_name || '',
    }));

    return res.json({ success: true, data: formatted });
  } catch (err) {
    next(err);
  }
};

/* ─── PATCH /api/admin/employee/:id/deactivate ───────────── */
const deactivateEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Employee.updateOne({ employee_id: id }, { is_active: false });
    return res.json({ success: true, message: 'Employee deactivated.' });
  } catch (err) {
    next(err);
  }
};

/* ─── GET /api/admin/leave ───────────────────────────────── */
const getAllLeaves = async (req, res, next) => {
  try {
    const { status = 'pending' } = req.query;
    const leaves = await LeaveRequest.find({ status }).sort({ submitted_at: 1 }).lean();

    const empIds = [...new Set(leaves.map((l) => l.employee_id))];
    const emps = await Employee.find({ employee_id: { $in: empIds } }).lean();
    const empMap = new Map();
    emps.forEach((e) => empMap.set(e.employee_id, e));

    const data = leaves.map((lr) => {
      const emp = empMap.get(lr.employee_id) || {};
      return {
        ...lr,
        full_name: emp.full_name || '',
        department: emp.department_name || '',
      };
    });

    return res.json({ success: true, data, total: data.length });
  } catch (err) {
    next(err);
  }
};

/* ─── GET /api/admin/settings ────────────────────────────── */
const getSettings = async (req, res, next) => {
  try {
    const settings = await SystemSetting.find().lean();
    const settingsMap = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });
    return res.json({ success: true, data: settingsMap });
  } catch (err) {
    next(err);
  }
};

/* ─── PUT /api/admin/settings ────────────────────────────── */
const updateSettings = async (req, res, next) => {
  try {
    const { settings } = req.body;
    if (!settings || typeof settings !== 'object') {
      throw new AppError('VALIDATION_ERROR', 'Settings object required.', 400);
    }

    const updates = Object.entries(settings).map(([key, value]) =>
      SystemSetting.findOneAndUpdate(
        { key },
        { key, value: String(value) },
        { upsert: true, new: true }
      )
    );

    await Promise.all(updates);

    return res.json({
      success: true,
      message: 'Settings updated successfully.',
      data: settings,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboard,
  getReports,
  addEmployee,
  getEmployees,
  deactivateEmployee,
  getAllLeaves,
  getSettings,
  updateSettings,
};
