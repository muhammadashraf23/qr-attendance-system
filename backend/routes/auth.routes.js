// routes/auth.routes.js
const express = require('express');
const router  = express.Router();
const {
  memberLogin, staffLogin, registerMember, registerInstitution, registerUser, getMe,
} = require('../controllers/auth.controller');
const { authenticateMember, authenticateStaff, requireRole } = require('../middleware/auth.middleware');

router.post('/login',                memberLogin);
router.post('/staff/login',          staffLogin);
// Staff creates a member (admin-side enrollment)
router.post('/register-member',      authenticateStaff, requireRole('dean', 'registrar', 'hod', 'it_admin'), registerMember);
router.post('/register-institution', registerInstitution);
// Self-registration: student or teacher registers themselves
router.post('/register-user',        registerUser);
// Get own profile
router.get('/me',                    authenticateMember, getMe);

module.exports = router;
