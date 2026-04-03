const express = require('express');
const router = express.Router();
const {
  getRecordings,
  saveRecording,
  deleteRecording
} = require('../controllers/savedRecordingController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getRecordings).post(protect, saveRecording);
router.route('/:id').delete(protect, deleteRecording);

module.exports = router;
