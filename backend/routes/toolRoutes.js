
const express = require('express');
const router = express.Router();
const { scrapeUrl, visionOcr } = require('../controllers/toolController');
// We don't necessarily need auth to scrape for this feature, but good to have if needed.
// For now, open access or use protect if you want only logged in users to scrape.
const { protect } = require('../middleware/authMiddleware');

router.post('/scrape', protect, scrapeUrl);
router.post('/vision-ocr', protect, visionOcr);

module.exports = router;
