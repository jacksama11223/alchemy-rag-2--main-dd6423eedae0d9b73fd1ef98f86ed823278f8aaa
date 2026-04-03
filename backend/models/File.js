
const mongoose = require('mongoose');

const fileSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  parentId: { type: String, default: null },
  name: { type: String, required: true },
  type: { type: String, required: true }, // folder, pdf, doc, txt, image
  size: { type: String },
  lastModified: { type: String },
  owner: { type: String, default: 'Me' },
  isStarred: { type: Boolean, default: false },
  isTrashed: { type: Boolean, default: false },
  content: { type: String } // Storing text content or base64 for images
}, {
  timestamps: true,
});

const File = mongoose.model('File', fileSchema);
module.exports = File;
