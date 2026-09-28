const express = require('express');
const router  = express.Router();
const { activateFace, verifyFace } = require('../controllers/face.controller');
const { authenticateMember } = require('../middleware/auth.middleware');

// Member activates their own face (student at /activate-face page)
router.post('/activate', authenticateMember, activateFace);

// Public face verification (kiosk compares embedding)
router.post('/verify', verifyFace);

module.exports = router;
