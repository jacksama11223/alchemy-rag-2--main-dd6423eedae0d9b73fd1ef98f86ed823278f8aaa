const mongoose = require('mongoose');

const feedbackItemSchema = new mongoose.Schema({
  type: { type: String, required: true },
  priority: { type: String, required: true },
  content: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['New', 'In Progress', 'Resolved'], default: 'New' },
  reply: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('FeedbackItem', feedbackItemSchema);
