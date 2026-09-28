const express = require('express');
const router  = express.Router();
const {
  startLecture,
  attendLecture,
  closeLecture,
  getMySessions,
  getSessionAttendees,
  getDefaulters,
  getSubjectReport,
  createOrUpdateSubject,
  listSubjects,
} = require('../controllers/lecture.controller');
const { authenticateMember, authenticateStaff } = require('../middleware/auth.middleware');

// ── Public (student scans QR — no login token needed) ─────
router.post('/attend', attendLecture);

// ── Member/Teacher-protected ───────────────────────────────
router.post('/start',           authenticateMember, startLecture);
router.post('/:id/close',       authenticateMember, closeLecture);
router.get('/my',               authenticateMember, getMySessions);
router.get('/:id/attendees',    authenticateMember, getSessionAttendees);

// ── Staff/Dean-protected ───────────────────────────────────
router.get('/defaulters',       authenticateStaff, getDefaulters);
router.get('/subject-report',   authenticateStaff, getSubjectReport);
router.post('/subjects',        authenticateStaff, createOrUpdateSubject);
router.get('/subjects',         authenticateStaff, listSubjects);

module.exports = router;
