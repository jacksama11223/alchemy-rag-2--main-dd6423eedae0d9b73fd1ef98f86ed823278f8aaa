
const DirectMessage = require('../models/DirectMessage');
const ChannelMessage = require('../models/ChannelMessage');
const User = require('../models/User');

// --- DIRECT MESSAGES ---

// @desc    Get conversation between current user and target user
// @route   GET /api/social/messages/:targetId
const getMessages = async (req, res) => {
  try {
    const myId = req.user._id.toString();
    const targetId = req.params.targetId;

    const messages = await DirectMessage.find({
      $or: [
        { sender: myId, recipient: targetId },
        { sender: targetId, recipient: myId }
      ]
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error("Get Messages Error:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Send a direct message
// @route   POST /api/social/messages
const sendMessage = async (req, res) => {
  try {
    const { targetId, content } = req.body;
    const myId = req.user._id.toString(); 

    if (!content || !targetId) {
      return res.status(400).json({ message: 'Invalid data' });
    }

    // 1. Create and Save to MongoDB
    const newMessage = new DirectMessage({
      sender: myId,
      recipient: targetId,
      content,
      read: false
    });

    const savedMessage = await newMessage.save();
    console.log(`💾 Saved Msg: ${savedMessage._id} | ${myId} -> ${targetId}`);

    // 2. Real-time Emission
    if (req.io) {
        // Emit to RECIPIENT (Target)
        req.io.to(targetId).emit('receive_message', savedMessage);
        
        // Emit to SENDER (Myself - to update other tabs or confirm sent)
        req.io.to(myId).emit('receive_message', savedMessage);
    }

    res.status(201).json(savedMessage);
  } catch (error) {
    console.error("Send Message DB Error:", error);
    res.status(500).json({ message: 'Failed to send message' });
  }
};

// --- CHANNEL MESSAGES (PUBLIC CHAT) ---

// @desc    Get messages for a specific channel
// @route   GET /api/social/channels/:channelId
const getChannelMessages = async (req, res) => {
    try {
        const { channelId } = req.params;
        // Populate sender info for display
        const messages = await ChannelMessage.find({ channelId })
            .sort({ createdAt: 1 })
            .populate('sender', 'name avatar isAdmin'); // Get name, avatar, role
        
        res.json(messages);
    } catch (error) {
        console.error("Get Channel Messages Error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Send a message to a public channel
// @route   POST /api/social/channels
const sendChannelMessage = async (req, res) => {
    try {
        const { channelId, content } = req.body;
        const myId = req.user._id;

        if (!content || !channelId) {
            return res.status(400).json({ message: 'Invalid data' });
        }

        const newMessage = new ChannelMessage({
            channelId,
            sender: myId,
            content
        });

        const savedMessage = await newMessage.save();
        
        // Populate sender immediately so frontend can display name/avatar
        await savedMessage.populate('sender', 'name avatar isAdmin');

        // Emit to everyone in the channel room
        if (req.io) {
            req.io.to(channelId).emit('receive_channel_message', savedMessage);
        }

        res.status(201).json(savedMessage);
    } catch (error) {
        console.error("Send Channel Message Error:", error);
        res.status(500).json({ message: 'Failed to send message' });
    }
};

module.exports = { getMessages, sendMessage, getChannelMessages, sendChannelMessage };
