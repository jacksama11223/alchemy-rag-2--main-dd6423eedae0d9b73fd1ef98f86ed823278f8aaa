
const mongoose = require('mongoose');

const directMessageSchema = mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  read: { type: Boolean, default: false },
}, {
  timestamps: true,
});

const DirectMessage = mongoose.model('DirectMessage', directMessageSchema);
module.exports = DirectMessage;
