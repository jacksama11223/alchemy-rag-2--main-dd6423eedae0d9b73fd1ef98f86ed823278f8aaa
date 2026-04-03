
const ChatSession = require('../models/ChatSession');

// @desc    Save a new chat session
// @route   POST /api/chat
const saveChatSession = async (req, res) => {
  try {
    const { title, personaId, messages } = req.body;

    if (!messages || messages.length === 0) {
      res.status(400).json({ message: 'No messages to save' });
      return;
    }

    const session = new ChatSession({
      user: req.user._id,
      title,
      personaId,
      messages
    });

    const createdSession = await session.save();
    res.status(201).json(createdSession);
  } catch (error) {
    console.error('Error in saveChatSession:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user chat sessions
// @route   GET /api/chat
const getChatSessions = async (req, res) => {
  try {
    const sessions = await ChatSession.find({ user: req.user._id }).sort({ updatedAt: -1 });
    res.json(sessions);
  } catch (error) {
    console.error('Error in getChatSessions:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a chat session
// @route   DELETE /api/chat/:id
const deleteChatSession = async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    const session = await ChatSession.findById(req.params.id);

    if (session) {
      // Check ownership
      if (session.user.toString() !== req.user._id.toString()) {
          res.status(401).json({ message: 'Not authorized' });
          return;
      }
      
      await session.deleteOne();
      res.json({ message: 'Session removed' });
    } else {
      res.status(404).json({ message: 'Session not found' });
    }
  } catch (error) {
    console.error('Error in deleteChatSession:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { saveChatSession, getChatSessions, deleteChatSession };
