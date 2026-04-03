
const express = require('express');
const router = express.Router();
const { getMessages, sendMessage, getChannelMessages, sendChannelMessage } = require('../controllers/socialController');
const { protect } = require('../middleware/authMiddleware');

// Direct Messages
router.get('/messages/:targetId', protect, getMessages);
router.post('/messages', protect, sendMessage);

// Channel Messages (Discord-like)
router.get('/channels/:channelId', protect, getChannelMessages);
router.post('/channels', protect, sendChannelMessage);

module.exports = router;
