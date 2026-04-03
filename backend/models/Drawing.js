
const mongoose = require('mongoose');

const drawingSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  elements: { type: Array, default: [] }, // Stores the Excalidraw-like elements
  template: { type: String, default: 'grid' },
  mode: { type: String, default: 'infinite' },
  pageCount: { type: Number, default: 1 }
}, {
  timestamps: true,
});

const Drawing = mongoose.model('Drawing', drawingSchema);
module.exports = Drawing;
