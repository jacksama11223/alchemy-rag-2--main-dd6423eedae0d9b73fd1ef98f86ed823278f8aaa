
const express = require('express');
const router = express.Router();
const { getDrawings, saveDrawing, deleteDrawing } = require('../controllers/drawingController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getDrawings).post(protect, saveDrawing);
router.route('/:id').delete(protect, deleteDrawing);

module.exports = router;
