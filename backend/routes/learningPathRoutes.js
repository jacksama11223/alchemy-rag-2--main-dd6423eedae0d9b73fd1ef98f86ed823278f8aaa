const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getLearningPaths, createLearningPath, updateLearningPath, deleteLearningPath
} = require('../controllers/learningPathController');

router.route('/').get(protect, getLearningPaths).post(protect, createLearningPath);
router.route('/:id').put(protect, updateLearningPath).delete(protect, deleteLearningPath);

module.exports = router;
