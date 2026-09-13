// routes/face.routes.js
const express = require('express');
const router  = express.Router();
const { registerFace, verifyFace } = require('../controllers/face.controller');
const { authenticateAdmin } = require('../middleware/auth.middleware');

router.post('/register', authenticateAdmin, registerFace);
router.post('/verify',   verifyFace);   // called from attendance page

module.exports = router;
