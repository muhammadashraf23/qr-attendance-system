const express = require('express');
const router  = express.Router();
const { generatePayroll, getPayrollReport, exportPayroll } = require('../controllers/payroll.controller');
const { authenticateAdmin, requireRole } = require('../middleware/auth.middleware');

router.use(authenticateAdmin);

router.post('/generate', requireRole('super_admin','hr_admin'), generatePayroll);
router.get('/report',    getPayrollReport);
router.get('/export',    getPayrollReport && exportPayroll);

module.exports = router;
