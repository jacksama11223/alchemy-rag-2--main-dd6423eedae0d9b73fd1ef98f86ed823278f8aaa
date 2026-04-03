const mongoose = require('mongoose');

const auditLogItemSchema = new mongoose.Schema({
  category: { type: String, enum: ['Security', 'Action', 'System'], required: true },
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  target: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('AuditLogItem', auditLogItemSchema);
