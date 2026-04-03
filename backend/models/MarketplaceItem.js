const mongoose = require('mongoose');

const marketSchema = mongoose.Schema({
  title: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorName: { type: String }, // Cache name for easier display
  type: { type: String, required: true }, // Deck, Link, Video
  price: { type: mongoose.Schema.Types.Mixed, default: 'Free' }, // 'Free' or Number
  category: { type: String, default: 'General' },
  rating: { type: Number, default: 5 },
  students: { type: Number, default: 0 },
  url: { type: String },
  description: { type: String },
  payload: { type: Object }, // The actual content (e.g. array of nodes) being sold/shared
  status: { type: String, default: 'pending' } // pending, approved, rejected
}, {
  timestamps: true,
});

const MarketplaceItem = mongoose.model('MarketplaceItem', marketSchema);
module.exports = MarketplaceItem;