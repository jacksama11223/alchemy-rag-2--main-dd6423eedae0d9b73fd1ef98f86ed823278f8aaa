const express = require('express');
const router = express.Router();
const { getItems, publishItem, getPendingItems, approveItem, rejectItem, deleteItem } = require('../controllers/marketController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(getItems).post(protect, publishItem);
router.route('/pending').get(protect, admin, getPendingItems);
router.route('/:id/approve').put(protect, admin, approveItem);
router.route('/:id/reject').put(protect, admin, rejectItem);
router.route('/:id').delete(protect, admin, deleteItem);

module.exports = router;