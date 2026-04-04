const express = require('express');
const router = express.Router();
const { getNodes, createNode, updateNode, deleteNode, syncNodes, reviewNodeItem, getDueNodes } = require('../controllers/nodeController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getNodes).post(protect, createNode);
router.route('/due').get(protect, getDueNodes);
router.route('/sync').post(protect, syncNodes);
router.route('/:id').put(protect, updateNode).delete(protect, deleteNode);
router.route('/:id/review').post(protect, reviewNodeItem);

module.exports = router;