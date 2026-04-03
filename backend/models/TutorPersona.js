const mongoose = require('mongoose');

const tutorPersonaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  systemInstruction: { type: String, required: true },
  color: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Optional, if users can create custom personas
}, { timestamps: true });

module.exports = mongoose.model('TutorPersona', tutorPersonaSchema);
