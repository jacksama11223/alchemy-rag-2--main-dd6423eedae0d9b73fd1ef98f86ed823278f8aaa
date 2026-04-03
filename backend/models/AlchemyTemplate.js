const mongoose = require('mongoose');

const alchemyTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Optional
}, { timestamps: true });

module.exports = mongoose.model('AlchemyTemplate', alchemyTemplateSchema);
