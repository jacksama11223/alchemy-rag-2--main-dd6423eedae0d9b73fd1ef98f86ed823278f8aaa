const express = require('express');
const { generateAiFile } = require('../controllers/driveAuthoringController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/generate-ai', protect, generateAiFile);

module.exports = router;
