const bcrypt = require('bcrypt');
const { Member, Attendance, LeaveApplication, Department, SystemSetting } = require('../models');
const { AppError } = require('../utils/AppError');

/* ─── GET /api/dean/dashboard ───────────────────────────── */
const getDashboard = async (req, res, next) => {
  try {
    const today        = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400_000).toISOString().split('T')[0];

    const [totalCount, activeMembers, todayAttendance, pendingCount, trendRaw] =
      await Promise.all([
        Member.countDocuments({ is_active: true }),
        Member.find({ is_active: true }).lean(),
        Attendance.find({ date: today }).lean(),
        LeaveApplication.countDocuments({ status: 'pending' }),
        Attendance.aggregate([
          { $match: { date: { $gte: thirtyDaysAgo } } },
          {
            $group: {
              _id: '$date',
              present:  { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
              absent:   { $sum: { $cond: [{ $eq: ['$status', 'absent']  }, 1, 0] } },
              on_leave: { $sum: { $cond: [{ $eq: ['$status', 'leave']   }, 1, 0] } },
            },
          },
          { $sort: { _id: 1 } },
          { $project: { date: '$_id', present: 1, absent: 1, on_leave: 1, _id: 0 } },
        ]),
      ]);

    const attMap = new Map();
    todayAttendance.forEach((a) => attMap.set(a.member_id, a));

    const todayRecords = activeMembers.map((m) => {
      const a = attMap.get(m.member_id);
      return {
        member_id:      m.member_id,
        full_name:      m.full_name,
        role:           m.role,
        department:     m.department_name || '',
        clock_in_time:  a?.clock_in_time  || null,
        clock_out_time: a?.clock_out_time || null,
        status:         a?.status || 'absent',
        is_late:        a?.is_late || false,
        method:         a?.method  || null,
        working_minutes: a?.working_minutes || 0,
      };
    });

    todayRecords.sort((a, b) => {
      if (!a.clock_in_time && !b.clock_in_time) return 0;
      if (!a.clock_in_time) return 1;
      if (!b.clock_in_time) return -1;
      return new Date(a.clock_in_time) - new Date(b.clock_in_time);
    });

    // Department stats
    const deptMap = new Map();
    activeMembers.forEach((m) => {
      const dept = m.department_name || 'General';
      if (!deptMap.has(dept)) deptMap.set(dept, { name: dept, total: 0, present: 0 });
      const item = deptMap.get(dept);
      item.total++;
      const a = attMap.get(m.member_id);
      if (a && a.status === 'present') item.present++;
    });
    const departmentStats = Array.from(deptMap.values());

    const present = todayRecords.filter((r) => r.clock_in_time && r.status !== 'leave').length;
    const onLeave = todayRecords.filter((r) => r.status === 'leave').length;
    const absent  = Math.max(0, totalCount - present - onLeave);
    const late    = todayRecords.filter((r) => r.is_late).length;

    return res.json({
      success: true,
      data: {
        summary: { total: totalCount, present, absent, on_leave: onLeave, late, pending_leaves: pendingCount },
        today_records:    todayRecords,
        department_stats: departmentStats,
        attendance_trend: trendRaw,
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ─── GET /api/dean/reports ─────────────────────────────── */
const getReports = async (req, res, next) => {
  try {
    const { from, to, department, member_id } = req.query;
    if (!from || !to) throw new AppError('VALIDATION_ERROR', 'from and to required.', 400);

    const memberFilter = { is_active: true };
    if (department) memberFilter.department_name = department;
    if (member_id)  memberFilter.member_id = member_id;

    const members = await Member.find(memberFilter).lean();
    const ids     = members.map((m) => m.member_id);

    const attendanceRecords = await Attendance.find({
      member_id: { $in: ids },
      date: { $gte: from, $lte: to },
    }).lean();

    const memberMap = new Map();
    members.forEach((m) => memberMap.set(m.member_id, m));

    const rows = attendanceRecords.map((a) => {
      const m = memberMap.get(a.member_id) || {};
      return {
        member_id:      a.member_id,
        full_name:      m.full_name || '',
        role:           m.role || '',
        department:     m.department_name || '',
        date:           a.date,
        clock_in_time:  a.clock_in_time,
        clock_out_time: a.clock_out_time,
        working_minutes: a.working_minutes,
        status:         a.status,
        is_late:        a.is_late,
        method:         a.method,
      };
    });

    rows.sort((a, b) => a.member_id.localeCompare(b.member_id) || a.date.localeCompare(b.date));

    return res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

/* ─── POST /api/dean/members ────────────────────────────── */
const addMember = async (req, res, next) => {
  try {
    const {
      member_id,
      full_name,
      email,
      phone,
      department_name,
      role_title,
      role = 'student',
      enrolled_at,
      monthly_stipend,
      semester,
      batch_year,
      password,
    } = req.body;

    if (!member_id || !full_name || !email)
      throw new AppError('VALIDATION_ERROR', 'member_id, full_name, and email are required.', 400);

    const rawPassword = password || member_id || 'Password123!';
    const hash = await bcrypt.hash(rawPassword, 12);

    const member = await Member.create({
      member_id,
      full_name,
      email: email.toLowerCase(),
      phone: phone || '',
      department_name: department_name || 'General',
      role_title: role_title || (role === 'teacher' ? 'Faculty' : 'Student'),
      role,
      enrolled_at: enrolled_at ? new Date(enrolled_at) : new Date(),
      monthly_stipend: monthly_stipend || 0,
      semester: semester || '',
      batch_year: batch_year || null,
      password_hash: hash,
    });

    const memberObj = member.toObject();
    delete memberObj.password_hash;

    return res.status(201).json({ success: true, member: memberObj });
  } catch (err) {
    if (err.code === 11000)
      return next(new AppError('DUPLICATE', 'Member ID or email already exists.', 409));
    next(err);
  }
};

/* ─── POST /api/dean/members/import ────────────────────── */
const importRoster = async (req, res, next) => {
  try {
    const rosterList = req.body.members || req.body.rows || [];
    let count = 0;

    for (const m of rosterList) {
      const id = m.member_id || m.roll_number || m.staff_id;
      if (!id) continue;

      const rawPass = m.password || id || 'Password123!';
      const hash = await bcrypt.hash(rawPass, 10);
      const role = m.role || (m.role_title?.toLowerCase().includes('faculty') ? 'teacher' : 'student');

      await Member.findOneAndUpdate(
        { member_id: id },
        {
          member_id:       id,
          full_name:       m.full_name || m.name || 'Member',
          email:           (m.email || `${id.toLowerCase()}@university.edu`).toLowerCase(),
          phone:           m.phone || '',
          department_name: m.department_name || m.department || 'General',
          role_title:      m.role_title || (role === 'teacher' ? 'Faculty' : 'Student'),
          role,
          semester:        m.semester || '',
          batch_year:      m.batch_year || null,
          password_hash:   hash,
          is_active:       true,
        },
        { upsert: true, new: true }
      );
      count++;
    }

    return res.json({
      success: true,
      count,
      message: `Roster import complete. ${count} members processed. Default password is their Member ID or 'Password123!'.`,
    });
  } catch (err) {
    next(err);
  }
};

/* ─── GET /api/dean/members ─────────────────────────────── */
const getMembers = async (req, res, next) => {
  try {
    const { search, department, role, active = 'true', page = 1, limit = 50 } = req.query;
    const filter = {};

    if (active !== 'all') filter.is_active = active === 'true';
    if (department) filter.department_name = department;
    if (role)       filter.role = role;
    if (search) {
      const reg = new RegExp(search, 'i');
      filter.$or = [{ full_name: reg }, { member_id: reg }, { email: reg }];
    }

    const pageNum  = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip     = (pageNum - 1) * limitNum;

    const rows = await Member.find(filter)
      .select('-password_hash')
      .sort({ full_name: 1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    return res.json({ success: true, data: rows, total: rows.length });
  } catch (err) {
    next(err);
  }
};

/* ─── PATCH /api/dean/member/:id/deactivate ─────────────── */
const deactivateMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Member.updateOne({ member_id: id }, { is_active: false });
    return res.json({ success: true, message: 'Member deactivated.' });
  } catch (err) {
    next(err);
  }
};

/* ─── GET /api/dean/leave ───────────────────────────────── */
const getAllLeaveApplications = async (req, res, next) => {
  try {
    const { status = 'pending' } = req.query;
    const leaves = await LeaveApplication.find({ status }).sort({ submitted_at: 1 }).lean();

    const ids     = [...new Set(leaves.map((l) => l.member_id))];
    const members = await Member.find({ member_id: { $in: ids } }).lean();
    const memberMap = new Map();
    members.forEach((m) => memberMap.set(m.member_id, m));

    const data = leaves.map((la) => {
      const m = memberMap.get(la.member_id) || {};
      return { ...la, full_name: m.full_name || '', department: m.department_name || '' };
    });

    return res.json({ success: true, data, total: data.length });
  } catch (err) {
    next(err);
  }
};

/* ─── GET /api/dean/settings ────────────────────────────── */
const getSettings = async (req, res, next) => {
  try {
    const settings = await SystemSetting.find().lean();
    const map = {};
    settings.forEach((s) => { map[s.key] = s.value; });
    return res.json({ success: true, data: map });
  } catch (err) {
    next(err);
  }
};

/* ─── PUT /api/dean/settings ────────────────────────────── */
const updateSettings = async (req, res, next) => {
  try {
    const { settings } = req.body;
    if (!settings || typeof settings !== 'object')
      throw new AppError('VALIDATION_ERROR', 'Settings object required.', 400);

    const updates = Object.entries(settings).map(([key, value]) =>
      SystemSetting.findOneAndUpdate(
        { key },
        { key, value: String(value) },
        { upsert: true, new: true }
      )
    );
    await Promise.all(updates);

    return res.json({ success: true, message: 'Settings updated.', data: settings });
  } catch (err) {
    next(err);
  }
};

/* ─── GET /api/dean/defaulters  (75% Rule) ──────────────── */
const getDefaultersReport = async (req, res, next) => {
  try {
    const { LectureSession, Subject } = require('../models');
    const { subject_code, department, threshold = 75 } = req.query;
    const thresh = parseFloat(threshold);

    const subjectFilter = { is_active: true, total_lectures: { $gt: 0 } };
    if (subject_code) subjectFilter.subject_code = subject_code.toUpperCase();
    if (department)   subjectFilter.department   = department;

    const subjects = await Subject.find(subjectFilter).lean();
    if (!subjects.length)
      return res.json({ success: true, data: [], message: 'No subjects with recorded lectures found.' });

    const subjectCodes = subjects.map((s) => s.subject_code);
    const allSessions  = await LectureSession.find({
      subject_code: { $in: subjectCodes },
      is_active: false,
    }).lean();

    const subjectStats = new Map();
    subjects.forEach((s) => {
      subjectStats.set(s.subject_code, {
        subject_code:      s.subject_code,
        subject_name:      s.subject_name,
        teacher_id:        s.teacher_id,
        department:        s.department,
        total_lectures:    s.total_lectures,
        enrolled_students: s.enrolled_students || [],
        attended:          new Map(),
      });
    });

    allSessions.forEach((sess) => {
      const stat = subjectStats.get(sess.subject_code);
      if (!stat) return;
      sess.attendees.forEach((a) => {
        stat.attended.set(a.student_id, (stat.attended.get(a.student_id) || 0) + 1);
      });
    });

    const allStudents = await Member.find({ role: 'student', is_active: true })
      .select('member_id full_name department_name')
      .lean();
    const studentMap = new Map();
    allStudents.forEach((s) => studentMap.set(s.member_id, s));

    const defaulters = [];
    for (const [, stat] of subjectStats) {
      const candidateIds = new Set([...stat.attended.keys(), ...stat.enrolled_students]);

      for (const studentId of candidateIds) {
        const attended   = stat.attended.get(studentId) || 0;
        const percentage = stat.total_lectures > 0 ? (attended / stat.total_lectures) * 100 : 0;

        if (percentage < thresh) {
          const studentInfo = studentMap.get(studentId);
          defaulters.push({
            member_id:            studentId,
            student_name:         studentInfo?.full_name || studentId,
            department:           studentInfo?.department_name || stat.department,
            subject_code:         stat.subject_code,
            subject_name:         stat.subject_name,
            teacher_id:           stat.teacher_id,
            total_lectures:       stat.total_lectures,
            attended_lectures:    attended,
            attendance_percentage: parseFloat(percentage.toFixed(2)),
            shortfall:            parseFloat((thresh - percentage).toFixed(2)),
          });
        }
      }
    }

    defaulters.sort((a, b) => a.attendance_percentage - b.attendance_percentage);

    return res.json({ success: true, threshold: thresh, total_defaulters: defaulters.length, data: defaulters });
  } catch (err) {
    next(err);
  }
};

/* ─── GET /api/dean/export-register  (Excel/CSV) ────────── */
const exportAttendanceRegister = async (req, res, next) => {
  try {
    const ExcelJS = require('exceljs');
    const { Parser } = require('json2csv');
    const { from, to, department, format: fmt = 'excel' } = req.query;
    if (!from || !to) throw new AppError('VALIDATION_ERROR', 'from and to query params required.', 400);

    const memberFilter = { is_active: true };
    if (department) memberFilter.department_name = department;

    const members = await Member.find(memberFilter).lean();
    const ids     = members.map((m) => m.member_id);
    const memberMap = new Map();
    members.forEach((m) => memberMap.set(m.member_id, m));

    const records = await Attendance.find({
      member_id: { $in: ids },
      date: { $gte: from, $lte: to },
    }).lean();

    const rows = records.map((a) => {
      const m = memberMap.get(a.member_id) || {};
      return {
        'Roll No / ID': a.member_id,
        Name:           m.full_name || '',
        Role:           m.role || '',
        Department:     m.department_name || '',
        Date:           a.date,
        Status:         a.status,
        'Clock-In':     a.clock_in_time  ? new Date(a.clock_in_time).toLocaleTimeString('en-PK',  { hour12: true }) : '-',
        'Clock-Out':    a.clock_out_time ? new Date(a.clock_out_time).toLocaleTimeString('en-PK', { hour12: true }) : '-',
        'Working Hours': a.working_minutes ? `${Math.floor(a.working_minutes / 60)}h ${a.working_minutes % 60}m` : '-',
        Late:           a.is_late ? 'Yes' : 'No',
        Method:         a.method || '-',
      };
    });

    rows.sort((a, b) => a['Roll No / ID'].localeCompare(b['Roll No / ID']) || a.Date.localeCompare(b.Date));

    const filename = `attendance-register-${from}-to-${to}`;

    if (fmt === 'csv') {
      const parser = new Parser();
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      return res.send(parser.parse(rows));
    }

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Attendance Register');
    const colKeys = ['Roll No / ID','Name','Role','Department','Date','Status','Clock-In','Clock-Out','Working Hours','Late','Method'];
    ws.columns = colKeys.map((key) => ({ header: key, key, width: 18 }));
    ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1565C0' } };
    rows.forEach((row) => ws.addRow(row));

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);
    await wb.xlsx.write(res);
    res.end();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboard,
  getReports,
  addMember,
  importRoster,
  getMembers,
  deactivateMember,
  getAllLeaveApplications,
  getSettings,
  updateSettings,
  getDefaultersReport,
  exportAttendanceRegister,
};
