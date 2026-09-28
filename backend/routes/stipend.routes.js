const express = require('express');
const router  = express.Router();
const { generateStipend, getStipendReport, exportStipend } = require('../controllers/stipend.controller');
const { authenticateStaff, requireRole } = require('../middleware/auth.middleware');

router.use(authenticateStaff);

router.post('/generate', requireRole('dean', 'registrar', 'it_admin'), generateStipend);
router.get('/report',    getStipendReport);
router.get('/export',    exportStipend);

module.exports = router;
