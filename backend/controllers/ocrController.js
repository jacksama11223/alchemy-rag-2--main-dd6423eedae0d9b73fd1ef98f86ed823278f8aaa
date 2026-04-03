const OcrDocument = require('../models/OcrDocument');

// @desc    Get all OCR documents for user
// @route   GET /api/ocr
const getOcrDocuments = async (req, res) => {
  try {
    const docs = await OcrDocument.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(docs);
  } catch (error) {
    console.error('Error fetching OCR documents:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single OCR document
// @route   GET /api/ocr/:id
const getOcrDocumentById = async (req, res) => {
  try {
    const doc = await OcrDocument.findOne({ _id: req.params.id, user: req.user._id });
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }
    res.json(doc);
  } catch (error) {
    console.error('Error fetching OCR document:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create new OCR document
// @route   POST /api/ocr
const createOcrDocument = async (req, res) => {
  try {
    const { title, imageUrl, extractedText } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({ message: 'Image URL is required' });
    }

    const newDoc = new OcrDocument({
      user: req.user._id,
      title: title || 'Tài liệu quét mới',
      imageUrl,
      extractedText: extractedText || ''
    });

    const created = await newDoc.save();
    res.status(201).json(created);
  } catch (error) {
    console.error('Error creating OCR document:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update OCR document (text, highlights, flashcards)
// @route   PUT /api/ocr/:id
const updateOcrDocument = async (req, res) => {
  try {
    const { title, extractedText, highlights, flashcards } = req.body;
    
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (extractedText !== undefined) updateData.extractedText = extractedText;
    if (highlights !== undefined) updateData.highlights = highlights;
    if (flashcards !== undefined) updateData.flashcards = flashcards;

    const updated = await OcrDocument.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(updated);
  } catch (error) {
    console.error('Error updating OCR document:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete OCR document
// @route   DELETE /api/ocr/:id
const deleteOcrDocument = async (req, res) => {
  try {
    const deleted = await OcrDocument.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!deleted) {
      return res.status(404).json({ message: 'Document not found' });
    }
    res.json({ message: 'Document removed' });
  } catch (error) {
    console.error('Error deleting OCR document:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getOcrDocuments,
  getOcrDocumentById,
  createOcrDocument,
  updateOcrDocument,
  deleteOcrDocument
};
