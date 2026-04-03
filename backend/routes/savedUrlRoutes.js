const express = require('express');
const router = express.Router();
const {
  getSavedUrls,
  saveUrl,
  updateSavedUrl,
  deleteSavedUrl
} = require('../controllers/savedUrlController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getSavedUrls).post(protect, saveUrl);
router.route('/:id').put(protect, updateSavedUrl).delete(protect, deleteSavedUrl);

module.exports = router;
