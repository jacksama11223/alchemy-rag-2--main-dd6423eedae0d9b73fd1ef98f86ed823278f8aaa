const express = require('express');
const router = express.Router();
const adaptiveLearningController = require('../controllers/adaptiveLearningController');
const { protect } = require('../middleware/authMiddleware');

// All adaptive learning routes require authentication
router.use(protect);

// POST generate a new test based on topic
router.post('/generate-test', adaptiveLearningController.generateTest);

// POST submit test answers and generate roadmap
router.post('/submit-test', adaptiveLearningController.submitTest);

// GET all completed roadmaps
router.get('/all-roadmaps', adaptiveLearningController.getAllRoadmaps);

// GET the latest completed roadmap
router.get('/roadmap', adaptiveLearningController.getLatestRoadmap);

module.exports = router;
