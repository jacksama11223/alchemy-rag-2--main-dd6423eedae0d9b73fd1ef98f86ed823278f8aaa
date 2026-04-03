const mongoose = require('mongoose');

/**
 * @typedef {Object} IMessage
 * @property {string} sessionId
 * @property {string} role - 'user' | 'assistant' | 'system'
 * @property {string} content
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

const messageSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  role: {
    type: String,
    required: true,
    enum: ['user', 'assistant', 'system']
  },
  content: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
