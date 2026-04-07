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

// PATCH rename a roadmap
router.patch('/rename-roadmap/:id', adaptiveLearningController.renameRoadmap);

// DELETE a roadmap
router.delete('/roadmap/:id', adaptiveLearningController.deleteRoadmap);

// NEW: Interactive content endpoints
router.post('/generate-interactive-content', adaptiveLearningController.generateInteractiveContent);
router.post('/submit-activity-score', adaptiveLearningController.submitActivityScore);
router.get('/existing-modules', adaptiveLearningController.getExistingModules);

module.exports = router;
