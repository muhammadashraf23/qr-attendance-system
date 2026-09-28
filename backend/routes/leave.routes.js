const express = require('express');
const router  = express.Router();
const { applyLeave, getMyLeaveApplications, reviewLeaveApplication } = require('../controllers/leave.controller');
const { authenticateMember, authenticateStaff, requireRole } = require('../middleware/auth.middleware');

// Member applies / views their own leaves
router.post('/apply', authenticateMember, applyLeave);
router.get('/my',     authenticateMember, getMyLeaveApplications);

// Staff reviews leaves (also wired in dean.routes.js)
router.patch('/:id/review', authenticateStaff, requireRole('dean','registrar','hod','it_admin'), reviewLeaveApplication);

module.exports = router;
