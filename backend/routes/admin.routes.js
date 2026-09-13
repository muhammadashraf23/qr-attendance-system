const express = require('express');
const router  = express.Router();
const {
  getDashboard, getReports, addEmployee, getEmployees,
  deactivateEmployee, getAllLeaves, getSettings, updateSettings,
} = require('../controllers/admin.controller');
const { reviewLeave } = require('../controllers/leave.controller');
const { authenticateAdmin, requireRole } = require('../middleware/auth.middleware');

router.use(authenticateAdmin);

router.get('/dashboard',                    getDashboard);
router.get('/reports',                      getReports);
router.get('/employees',                    getEmployees);
router.post('/employee/add',               requireRole('super_admin','hr_admin'), addEmployee);
router.patch('/employee/:id/deactivate',   requireRole('super_admin','hr_admin'), deactivateEmployee);
router.get('/leave',                        getAllLeaves);
router.patch('/leave/:id/review',          requireRole('super_admin','hr_admin'), reviewLeave);
router.get('/settings',                     getSettings);
router.put('/settings',                     requireRole('super_admin'), updateSettings);

module.exports = router;
