const mongoose = require('mongoose');

const reportItemSchema = new mongoose.Schema({
  type: { type: String, required: true },
  content: { type: String, required: true },
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'resolved', 'dismissed'], default: 'pending' },
  targetType: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('ReportItem', reportItemSchema);
