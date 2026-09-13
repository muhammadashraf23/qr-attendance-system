// routes/auth.routes.js
const express = require('express');
const router  = express.Router();
const { employeeLogin, adminLogin, registerEmployee, registerInstitution } = require('../controllers/auth.controller');
const { authenticateAdmin, requireRole } = require('../middleware/auth.middleware');

router.post('/login',                employeeLogin);
router.post('/admin/login',          adminLogin);
router.post('/register',             authenticateAdmin, requireRole('dean', 'admin', 'super_admin', 'hr_admin'), registerEmployee);
router.post('/register-institution', registerInstitution);

module.exports = router;
