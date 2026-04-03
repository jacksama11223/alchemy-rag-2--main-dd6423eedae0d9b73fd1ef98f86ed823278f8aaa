const mongoose = require('mongoose');

const behaviorLogSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['view_feature', 'click_element', 'create_content', 'complete_task', 'use_ai', 'search', 'login', 'logout'], 
    required: true 
  },
  context: { type: String, required: true },
  detail: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('BehaviorLog', behaviorLogSchema);
