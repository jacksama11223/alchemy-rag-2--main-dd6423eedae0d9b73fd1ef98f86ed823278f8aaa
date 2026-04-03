const mongoose = require('mongoose');

const flowStepSchema = new mongoose.Schema({
  label: { type: String, required: true },
  icon: { type: String, required: true },
  description: { type: String, required: true },
  color: { type: String },
  bgColor: { type: String },
  targetView: { type: String }
});

const adminUserFlowSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, enum: ['START', 'CREATE', 'VISUALIZE', 'LEARN', 'MANAGE', 'SOCIAL'], required: true },
  summary: { type: String },
  complexity: { type: String, enum: ['Easy', 'Medium', 'Hard'] },
  timeEstimate: { type: String },
  description: { type: String },
  steps: [flowStepSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('AdminUserFlow', adminUserFlowSchema);
