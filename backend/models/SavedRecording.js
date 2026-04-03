const mongoose = require('mongoose');

const savedRecordingSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  audioData: { type: String, required: true }, // Base64 encoded audio
  transcript: { type: String, required: true },
  duration: { type: Number, default: 0 }
}, {
  timestamps: true,
});

const SavedRecording = mongoose.model('SavedRecording', savedRecordingSchema);
module.exports = SavedRecording;
