
const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
  role: { type: String, required: true }, // 'user' | 'model'
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const chatSessionSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  personaId: { type: String, required: true },
  messages: [messageSchema],
}, {
  timestamps: true,
});

const ChatSession = mongoose.model('ChatSession', chatSessionSchema);
module.exports = ChatSession;
