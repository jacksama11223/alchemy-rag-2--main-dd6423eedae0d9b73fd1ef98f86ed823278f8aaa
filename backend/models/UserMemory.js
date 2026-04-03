const mongoose = require('mongoose');

/**
 * @typedef {Object} IUserMemory
 * @property {mongoose.Types.ObjectId} userId
 * @property {string} category
 * @property {string} key
 * @property {string} value
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

const userMemorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  category: {
    type: String,
    required: true,
    default: 'general'
  },
  key: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: true
  }
}, { timestamps: true });

// Composite index on userId and key for efficient updates
userMemorySchema.index({ userId: 1, key: 1 }, { unique: true });

module.exports = mongoose.model('UserMemory', userMemorySchema);
