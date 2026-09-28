const express = require('express');
const router  = express.Router();
const {
  getDashboard, getReports, addMember, importRoster, getMembers,
  deactivateMember, getAllLeaveApplications, getSettings, updateSettings,
  getDefaultersReport, exportAttendanceRegister,
} = require('../controllers/dean.controller');
const { reviewLeaveApplication } = require('../controllers/leave.controller');
const { authenticateStaff, requireRole } = require('../middleware/auth.middleware');

router.use(authenticateStaff);

router.get('/dashboard',                   getDashboard);
router.get('/reports',                     getReports);
router.get('/members',                     getMembers);
router.post('/members',                    addMember);
router.post('/members/import',             importRoster);
router.patch('/member/:id/deactivate',     requireRole('dean','registrar','hod','it_admin'), deactivateMember);
router.get('/leave',                       getAllLeaveApplications);
router.patch('/leave/:id/review',          requireRole('dean','registrar','hod','it_admin'), reviewLeaveApplication);
router.get('/settings',                    getSettings);
router.put('/settings',                    requireRole('dean','registrar'), updateSettings);

// ── Academic ────────────────────────────────────────────────
router.get('/defaulters',                  getDefaultersReport);
router.get('/export-register',             exportAttendanceRegister);

module.exports = router;
