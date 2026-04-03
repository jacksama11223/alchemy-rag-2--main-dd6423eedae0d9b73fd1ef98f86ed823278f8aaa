const express = require('express');
const router = express.Router();
const { getPastedTexts, savePastedText, deletePastedText } = require('../controllers/pastedTextController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getPastedTexts)
    .post(protect, savePastedText);

router.route('/:id')
    .delete(protect, deletePastedText);

module.exports = router;
