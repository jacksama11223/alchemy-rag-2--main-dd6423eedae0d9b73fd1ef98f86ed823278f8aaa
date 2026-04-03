const asyncHandler = require('express-async-handler');
const SavedRecording = require('../models/SavedRecording');
const BackgroundWorker = require('../services/backgroundWorker');

// @desc    Get all saved recordings for a user
// @route   GET /api/savedrecordings
// @access  Private
const getRecordings = asyncHandler(async (req, res) => {
  const recordings = await SavedRecording.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(recordings);
});

// @desc    Save a new recording
// @route   POST /api/savedrecordings
// @access  Private
const saveRecording = asyncHandler(async (req, res) => {
  const { title, audioData, transcript, duration } = req.body;

  if (!audioData || !transcript) {
    res.status(400);
    throw new Error('Please provide audioData and transcript');
  }

  const recording = await SavedRecording.create({
    user: req.user._id,
    title: title || 'Bản ghi âm mới',
    audioData,
    transcript,
    duration: duration || 0
  });
  
  // Trigger background embedding
  const textContent = `${recording.title || ''}\n\n${transcript || ''}`.trim();
  if (textContent) {
    try {
      const worker = new BackgroundWorker();
      await worker.embedAndStoreDocument(textContent, req.user._id, 'voice', recording._id, recording.title);
      console.log(`[VectorService] ✅ Successfully embedded and stored voice recording ${recording._id}`);
    } catch (e) {
      console.error(`[VectorService] ❌ Error embedding voice recording ${recording._id}:`, e.message);
      console.error(e.stack);
    }
  } else {
    console.warn(`[VectorService] ⚠️ Warning: Voice recording ${recording._id} has no text content to embed.`);
  }

  res.status(201).json(recording);
});

// @desc    Delete a saved recording
// @route   DELETE /api/savedrecordings/:id
// @access  Private
const deleteRecording = asyncHandler(async (req, res) => {
  const recording = await SavedRecording.findById(req.params.id);

  if (!recording) {
    res.status(404);
    throw new Error('Recording not found');
  }

  // Check for user
  if (recording.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('User not authorized');
  }

  await recording.deleteOne();
  
  // Delete associated vector store documents
  try {
    const VectorStore = require('../models/VectorStore');
    await VectorStore.deleteMany({
      userId: req.user._id,
      'metadata.originalDocId': req.params.id
    });
  } catch (e) {
    console.error('Error deleting vector store documents:', e);
  }

  res.json({ id: req.params.id });
});

module.exports = {
  getRecordings,
  saveRecording,
  deleteRecording
};
