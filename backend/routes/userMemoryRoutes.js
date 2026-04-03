const express = require('express');
const router = express.Router();
const userMemoryController = require('../controllers/userMemoryController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', userMemoryController.addMemory);
router.get('/', userMemoryController.getMemories);
router.post('/search', userMemoryController.searchMemories);

module.exports = router;
