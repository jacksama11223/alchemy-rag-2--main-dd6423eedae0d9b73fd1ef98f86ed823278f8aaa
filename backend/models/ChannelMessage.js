
const mongoose = require('mongoose');

const channelMessageSchema = mongoose.Schema({
  channelId: { type: String, required: true }, // e.g., 'general', 'react', 'announcements'
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
}, {
  timestamps: true,
});

const ChannelMessage = mongoose.model('ChannelMessage', channelMessageSchema);
module.exports = ChannelMessage;
