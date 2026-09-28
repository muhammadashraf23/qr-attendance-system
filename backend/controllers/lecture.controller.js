/**
 * Lecture Session Controller
 *
 * Handles the per-subject QR attendance flow:
 *  - Teacher opens /teacher/lecture-qr → calls POST /api/lecture/start
 *  - Frontend renders QR from the returned session_token
 *  - Student scans QR → frontend calls POST /api/lecture/attend
 *  - Teacher can close the session with POST /api/lecture/:id/close
 *  - Dean hits GET /api/lecture/defaulters for the 75% report
 */

const { v4: uuidv4 } = require('uuid');
const { LectureSession, Subject, Member } = require('../models');
const { AppError } = require('../utils/AppError');

/* ─── POST /api/lecture/start  (Teacher) ─────────────────── */
const startLecture = async (req, res, next) => {
  try {
    const {
      subject_code,
      subject_name,
      duration_minutes = 90,
    } = req.body;

    if (!subject_code || !subject_name)
      throw new AppError('VALIDATION_ERROR', 'subject_code and subject_name are required.', 400);

    const teacher_id   = req.user?.member_id;
    const teacher_name = req.user?.name || '';

    const teacher   = await Member.findOne({ member_id: teacher_id }).lean();
    const department = teacher?.department_name || '';

    const session_token = uuidv4();
    const expires_at    = new Date(Date.now() + duration_minutes * 60_000);

    const session = await LectureSession.create({
      session_token,
      subject_code: subject_code.toUpperCase(),
      subject_name,
      teacher_id,
      teacher_name,
      department,
      expires_at,
    });

    return res.status(201).json({
      success: true,
      message: `Lecture session started. QR valid for ${duration_minutes} minutes.`,
      data: {
        session_id:       session._id,
        session_token,
        subject_code:     session.subject_code,
        subject_name:     session.subject_name,
        expires_at,
        duration_minutes,
        qr_payload: JSON.stringify({ type: 'lecture', token: session_token }),
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ─── POST /api/lecture/attend  (Student — scan QR) ─────── */
const attendLecture = async (req, res, next) => {
  try {
    const { session_token, student_id, method = 'qr' } = req.body;

    if (!session_token || !student_id)
      throw new AppError('VALIDATION_ERROR', 'session_token and student_id are required.', 400);

    const session = await LectureSession.findOne({ session_token });
    if (!session) throw new AppError('NOT_FOUND', 'Invalid QR code. Session not found.', 404);
    if (!session.is_active)
      throw new AppError('SESSION_CLOSED', 'This lecture session has been closed.', 410);
    if (new Date() > session.expires_at)
      throw new AppError('SESSION_EXPIRED', 'QR code has expired. Contact your teacher.', 410);

    // Verify student exists (student_id = member_id)
    const student = await Member.findOne({ member_id: student_id, is_active: true }).lean();
    if (!student) throw new AppError('NOT_FOUND', 'Student not found or inactive.', 404);

    // Prevent duplicate attendance for same session
    const alreadyIn = session.attendees.some((a) => a.student_id === student_id);
    if (alreadyIn)
      throw new AppError(
        'DUPLICATE_CHECKIN',
        `${student.full_name} already marked present for this lecture.`,
        409
      );

    session.attendees.push({
      student_id,
      student_name: student.full_name,
      roll_number:  student.member_id,
      scanned_at:   new Date(),
      method,
    });
    await session.save();

    return res.json({
      success: true,
      message: `Attendance recorded for ${student.full_name} — ${session.subject_name}.`,
      data: {
        student_id,
        student_name: student.full_name,
        subject_code: session.subject_code,
        subject_name: session.subject_name,
        scanned_at:   new Date(),
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ─── POST /api/lecture/:id/close  (Teacher) ────────────── */
const closeLecture = async (req, res, next) => {
  try {
    const { id }     = req.params;
    const teacher_id = req.user?.member_id;

    const session = await LectureSession.findById(id);
    if (!session) throw new AppError('NOT_FOUND', 'Session not found.', 404);
    if (session.teacher_id !== teacher_id)
      throw new AppError('FORBIDDEN', 'You can only close your own sessions.', 403);

    session.is_active = false;
    await session.save();

    // Increment total_lectures on Subject
    await Subject.findOneAndUpdate(
      { subject_code: session.subject_code },
      {
        $inc: { total_lectures: 1 },
        $set: {
          subject_name: session.subject_name,
          teacher_id:   session.teacher_id,
          department:   session.department,
        },
      },
      { upsert: true }
    );

    return res.json({
      success: true,
      message: 'Lecture session closed.',
      data: {
        session_id:       id,
        subject_code:     session.subject_code,
        total_attendees:  session.attendees.length,
        closed_at:        new Date(),
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ─── GET /api/lecture/my  (Teacher — own sessions) ─────── */
const getMySessions = async (req, res, next) => {
  try {
    const teacher_id = req.user?.member_id;
    const { limit = 20 } = req.query;

    const sessions = await LectureSession.find({ teacher_id })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10))
      .lean();

    const data = sessions.map((s) => ({
      session_id:     s._id,
      session_token:  s.session_token,
      subject_code:   s.subject_code,
      subject_name:   s.subject_name,
      is_active:      s.is_active,
      expires_at:     s.expires_at,
      attendee_count: s.attendees.length,
      attendees:      s.attendees,
      createdAt:      s.createdAt,
    }));

    return res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/* ─── GET /api/lecture/:id/attendees  (Teacher) ─────────── */
const getSessionAttendees = async (req, res, next) => {
  try {
    const { id } = req.params;
    const session = await LectureSession.findById(id).lean();
    if (!session) throw new AppError('NOT_FOUND', 'Session not found.', 404);

    return res.json({
      success: true,
      data: {
        session_id:   id,
        subject_code: session.subject_code,
        subject_name: session.subject_name,
        is_active:    session.is_active,
        expires_at:   session.expires_at,
        attendees:    session.attendees,
        total:        session.attendees.length,
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ─── GET /api/lecture/defaulters  (Dean) ───────────────── */
const getDefaulters = async (req, res, next) => {
  try {
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
      const candidateIds = new Set([
        ...stat.attended.keys(),
        ...(subjects.find((s) => s.subject_code === stat.subject_code)?.enrolled_students || []),
      ]);

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
            is_defaulter:         true,
          });
        }
      }
    }

    defaulters.sort((a, b) => a.attendance_percentage - b.attendance_percentage);

    return res.json({
      success: true, threshold: thresh, total_defaulters: defaulters.length, data: defaulters,
    });
  } catch (err) {
    next(err);
  }
};

/* ─── GET /api/lecture/subject-report ─────────────────────── */
const getSubjectReport = async (req, res, next) => {
  try {
    const { subject_code } = req.query;
    if (!subject_code)
      throw new AppError('VALIDATION_ERROR', 'subject_code is required.', 400);

    const subject = await Subject.findOne({ subject_code: subject_code.toUpperCase() }).lean();
    if (!subject) throw new AppError('NOT_FOUND', 'Subject not found.', 404);

    const sessions = await LectureSession.find({
      subject_code: subject.subject_code,
      is_active: false,
    }).lean();

    const attended = new Map();
    sessions.forEach((s) => {
      s.attendees.forEach((a) => {
        attended.set(a.student_id, {
          student_id:   a.student_id,
          student_name: a.student_name,
          count: (attended.get(a.student_id)?.count || 0) + 1,
        });
      });
    });

    const studentList = Array.from(attended.values()).map((item) => ({
      ...item,
      attendance_percentage: parseFloat(
        ((item.count / Math.max(subject.total_lectures, 1)) * 100).toFixed(2)
      ),
    }));

    studentList.sort((a, b) => b.attendance_percentage - a.attendance_percentage);

    return res.json({
      success: true,
      data: {
        subject_code:   subject.subject_code,
        subject_name:   subject.subject_name,
        teacher_id:     subject.teacher_id,
        department:     subject.department,
        total_lectures: subject.total_lectures,
        total_students: studentList.length,
        students:       studentList,
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ─── POST /api/lecture/subjects  (Dean — create/enroll) ─── */
const createOrUpdateSubject = async (req, res, next) => {
  try {
    const {
      subject_code,
      subject_name,
      teacher_id,
      department,
      semester,
      enrolled_students = [],
    } = req.body;

    if (!subject_code || !subject_name || !teacher_id)
      throw new AppError('VALIDATION_ERROR', 'subject_code, subject_name, teacher_id required.', 400);

    const subject = await Subject.findOneAndUpdate(
      { subject_code: subject_code.toUpperCase() },
      {
        subject_name,
        teacher_id,
        department:        department || '',
        semester:          semester || '',
        enrolled_students,
        is_active:         true,
      },
      { upsert: true, new: true }
    );

    return res.status(201).json({ success: true, data: subject });
  } catch (err) {
    next(err);
  }
};

/* ─── GET /api/lecture/subjects ────────────────────────────── */
const listSubjects = async (req, res, next) => {
  try {
    const { teacher_id, department } = req.query;
    const filter = { is_active: true };
    if (teacher_id) filter.teacher_id = teacher_id;
    if (department) filter.department = department;

    const subjects = await Subject.find(filter).sort({ subject_code: 1 }).lean();
    return res.json({ success: true, data: subjects });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  startLecture,
  attendLecture,
  closeLecture,
  getMySessions,
  getSessionAttendees,
  getDefaulters,
  getSubjectReport,
  createOrUpdateSubject,
  listSubjects,
};
