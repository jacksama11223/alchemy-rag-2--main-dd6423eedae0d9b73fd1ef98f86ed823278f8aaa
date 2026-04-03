const asyncHandler = require('express-async-handler');
const SavedUrl = require('../models/SavedUrl');
const BackgroundWorker = require('../services/backgroundWorker');

// @desc    Get all saved URLs for a user
// @route   GET /api/savedurls
// @access  Private
const getSavedUrls = asyncHandler(async (req, res) => {
  const savedUrls = await SavedUrl.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(savedUrls);
});

// @desc    Save a new URL
// @route   POST /api/savedurls
// @access  Private
const saveUrl = asyncHandler(async (req, res) => {
  const { url, title, htmlContent, textContent, tags } = req.body;
  const apiKey = req.headers['x-gemini-api-key'] || process.env.GEMINI_API_KEY;

  if (!url || !htmlContent) {
    res.status(400);
    throw new Error('Please provide url and htmlContent');
  }

  const savedUrl = await SavedUrl.create({
    user: req.user._id,
    url,
    title: title || url,
    htmlContent,
    textContent,
    tags
  });
  
  // Trigger background embedding
  const contentToEmbed = `${savedUrl.title || ''}\n\n${textContent || htmlContent || ''}`.trim();
  if (contentToEmbed) {
    try {
      const worker = new BackgroundWorker();
      await worker.embedAndStoreDocument(contentToEmbed, req.user._id, 'web', savedUrl._id, savedUrl.title);
      console.log(`[VectorService] ✅ Successfully embedded and stored web url ${savedUrl._id}`);
    } catch (e) {
      console.error(`[VectorService] ❌ Error embedding web url ${savedUrl._id}:`, e.message);
      console.error(e.stack);
    }
  } else {
    console.warn(`[VectorService] ⚠️ Warning: Web URL ${savedUrl._id} has no text content to embed.`);
  }

  res.status(201).json(savedUrl);
});

// @desc    Update a saved URL (e.g., editing HTML)
// @route   PUT /api/savedurls/:id
// @access  Private
const updateSavedUrl = asyncHandler(async (req, res) => {
  const savedUrl = await SavedUrl.findById(req.params.id);
  const apiKey = req.headers['x-gemini-api-key'] || process.env.GEMINI_API_KEY;

  if (!savedUrl) {
    res.status(404);
    throw new Error('Saved URL not found');
  }

  // Check for user
  if (savedUrl.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('User not authorized');
  }

  const updatedUrl = await SavedUrl.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  
  // Trigger background embedding
  const contentToEmbed = `${updatedUrl.title || ''}\n\n${updatedUrl.textContent || updatedUrl.htmlContent || ''}`.trim();
  if (contentToEmbed) {
    try {
      const worker = new BackgroundWorker();
      await worker.embedAndStoreDocument(contentToEmbed, req.user._id, 'web', updatedUrl._id, updatedUrl.title);
      console.log(`[VectorService] ✅ Successfully embedded and stored web url ${updatedUrl._id}`);
    } catch (e) {
      console.error(`[VectorService] ❌ Error embedding web url ${updatedUrl._id}:`, e.message);
      console.error(e.stack);
    }
  } else {
    console.warn(`[VectorService] ⚠️ Warning: Web URL ${updatedUrl._id} has no text content to embed.`);
  }

  res.json(updatedUrl);
});

// @desc    Delete a saved URL
// @route   DELETE /api/savedurls/:id
// @access  Private
const deleteSavedUrl = asyncHandler(async (req, res) => {
  const savedUrl = await SavedUrl.findById(req.params.id);

  if (!savedUrl) {
    res.status(404);
    throw new Error('Saved URL not found');
  }

  // Check for user
  if (savedUrl.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('User not authorized');
  }

  await savedUrl.deleteOne();
  
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
  getSavedUrls,
  saveUrl,
  updateSavedUrl,
  deleteSavedUrl
};
