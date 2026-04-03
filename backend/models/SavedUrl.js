const mongoose = require('mongoose');

const savedUrlSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  url: { type: String, required: true },
  title: { type: String, required: true },
  htmlContent: { type: String, required: true },
  textContent: { type: String },
  tags: [String]
}, {
  timestamps: true,
});

const SavedUrl = mongoose.model('SavedUrl', savedUrlSchema);
module.exports = SavedUrl;
