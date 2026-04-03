const express = require('express');
const router = express.Router();
const {
  getSavedVideos,
  saveVideo,
  deleteVideo
} = require('../controllers/savedYoutubeVideoController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getSavedVideos).post(protect, saveVideo);
router.route('/:id').delete(protect, deleteVideo);

module.exports = router;
