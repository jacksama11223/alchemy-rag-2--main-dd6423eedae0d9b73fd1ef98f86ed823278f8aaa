const express = require('express');
const router = express.Router();
const { getNodes, createNode, updateNode, deleteNode, syncNodes } = require('../controllers/nodeController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getNodes).post(protect, createNode);
router.route('/sync').post(protect, syncNodes);
router.route('/:id').put(protect, updateNode).delete(protect, deleteNode);

module.exports = router;