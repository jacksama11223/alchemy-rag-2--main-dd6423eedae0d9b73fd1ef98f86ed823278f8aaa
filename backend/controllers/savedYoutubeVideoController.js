const asyncHandler = require('express-async-handler');
const SavedYoutubeVideo = require('../models/SavedYoutubeVideo');
const BackgroundWorker = require('../services/backgroundWorker');

// @desc    Get all saved YouTube videos for a user
// @route   GET /api/savedyoutubevideos
// @access  Private
const getSavedVideos = asyncHandler(async (req, res) => {
  const savedVideos = await SavedYoutubeVideo.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(savedVideos);
});

const { fetchYoutubeData } = require('../services/youtubeExtractService');

// @desc    Save a new YouTube video
// @route   POST /api/savedyoutubevideos
// @access  Private
const saveVideo = asyncHandler(async (req, res) => {
  const { url, videoId, tags } = req.body;
  let { title, subtitles } = req.body;

  if (!url || !videoId) {
    res.status(400);
    throw new Error('Please provide url and videoId');
  }

  // 1. Logic cào dữ liệu gốc: Nếu người dùng không đưa lên subtitle, backend tự cào.
  if (!subtitles || subtitles.includes('giả lập')) {
      const extractedData = await fetchYoutubeData(videoId);
      title = extractedData.title;
      subtitles = extractedData.subtitles;
  }

  const savedVideo = await SavedYoutubeVideo.create({
    user: req.user._id,
    url,
    videoId,
    title: title || `YouTube Video: ${videoId}`,
    subtitles,
    tags
  });
  
  // Trigger background embedding
  const textContent = `${savedVideo.title || ''}\n\n${subtitles || ''}`.trim();
  if (textContent) {
    try {
      const worker = new BackgroundWorker();
      await worker.embedAndStoreDocument(textContent, req.user._id, 'youtube', savedVideo._id, savedVideo.title);
      console.log(`[VectorService] ✅ Successfully embedded and stored youtube video ${savedVideo._id}`);
    } catch (e) {
      console.error(`[VectorService] ❌ Error embedding youtube video ${savedVideo._id}:`, e.message);
      console.error(e.stack);
    }
  } else {
    console.warn(`[VectorService] ⚠️ Warning: YouTube video ${savedVideo._id} has no text content to embed.`);
  }

  res.status(201).json(savedVideo);
});

// @desc    Delete a saved YouTube video
// @route   DELETE /api/savedyoutubevideos/:id
// @access  Private
const deleteVideo = asyncHandler(async (req, res) => {
  const savedVideo = await SavedYoutubeVideo.findById(req.params.id);

  if (!savedVideo) {
    res.status(404);
    throw new Error('Saved video not found');
  }

  // Check for user
  if (savedVideo.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('User not authorized');
  }

  await savedVideo.deleteOne();
  
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
  getSavedVideos,
  saveVideo,
  deleteVideo
};
