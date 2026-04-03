const mongoose = require('mongoose');

const savedYoutubeVideoSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  url: { type: String, required: true },
  videoId: { type: String, required: true },
  title: { type: String, required: true },
  subtitles: { type: String, required: true }, // Can store as plain text or JSON string of timestamps
  tags: [String]
}, {
  timestamps: true,
});

const SavedYoutubeVideo = mongoose.model('SavedYoutubeVideo', savedYoutubeVideoSchema);
module.exports = SavedYoutubeVideo;
