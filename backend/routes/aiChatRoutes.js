const express = require('express');
const router = express.Router();
const { handleAIChat } = require('../controllers/chat.controller');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, handleAIChat);

module.exports = router;
