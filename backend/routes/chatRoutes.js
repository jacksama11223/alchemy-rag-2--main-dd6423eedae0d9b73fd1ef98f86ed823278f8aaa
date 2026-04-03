
const express = require('express');
const router = express.Router();
const { saveChatSession, getChatSessions, deleteChatSession } = require('../controllers/chatController');
const { handleAIChat } = require('../controllers/chat.controller');
const { protect } = require('../middleware/authMiddleware');

router.post('/ai', protect, handleAIChat);
router.route('/').post(protect, saveChatSession).get(protect, getChatSessions);
router.route('/:id').delete(protect, deleteChatSession);

module.exports = router;
