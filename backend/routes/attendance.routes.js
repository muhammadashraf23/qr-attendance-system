const express = require('express');
const router  = express.Router();
const { clockIn, clockOut, getTodayStatus, getHistory, syncOffline } = require('../controllers/attendance.controller');
const { authenticateMember } = require('../middleware/auth.middleware');

// Public — QR scan kiosk sends member_id without a login token
router.post('/clock-in',  clockIn);
router.post('/clock-out', clockOut);

// Protected — member must be logged in
router.get('/today',    authenticateMember, getTodayStatus);
router.get('/history',  authenticateMember, getHistory);
router.post('/sync',    authenticateMember, syncOffline);

module.exports = router;
