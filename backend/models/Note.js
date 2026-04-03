
const mongoose = require('mongoose');

const noteSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  parentId: { type: String, default: null }, // Null for root items
  type: { type: String, required: true }, // 'note', 'folder', 'project'
  title: { type: String, default: 'Untitled' },
  icon: { type: String, default: '📄' },
  coverImage: { type: String },
  blocks: { type: Array, default: [] }, // Content blocks
  isExpanded: { type: Boolean, default: false },
  projectMetadata: { 
      status: { type: String },
      progress: { type: Number }
  }
}, {
  timestamps: true,
});

const Note = mongoose.model('Note', noteSchema);
module.exports = Note;
