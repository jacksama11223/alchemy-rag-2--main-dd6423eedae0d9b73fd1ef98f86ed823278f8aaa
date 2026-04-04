const express = require('express');
const router = express.Router();
const { generateRoadmapFromRag } = require('../controllers/roadmapController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @desc    Generate a learning roadmap by querying RAG and using AI
 * @route   POST /api/roadmap/generate
 * @access  Private
 */
router.post('/generate', protect, generateRoadmapFromRag);

module.exports = router;
