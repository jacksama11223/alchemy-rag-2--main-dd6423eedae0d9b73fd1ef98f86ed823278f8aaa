const mongoose = require('mongoose');

const alchemyLogItemSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  type: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('AlchemyLogItem', alchemyLogItemSchema);
