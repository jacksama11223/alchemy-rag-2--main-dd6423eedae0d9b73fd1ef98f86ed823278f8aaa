const PastedText = require('../models/PastedText');
const BackgroundWorker = require('../services/backgroundWorker');

// @desc    Get all pasted texts for a user
// @route   GET /api/pasted-texts
// @access  Private
const getPastedTexts = async (req, res) => {
    try {
        const texts = await PastedText.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(texts);
    } catch (error) {
        console.error("Error fetching pasted texts:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Save a new pasted text
// @route   POST /api/pasted-texts
// @access  Private
const savePastedText = async (req, res) => {
    try {
        const { title, content, source } = req.body;

        if (!title || !content) {
            return res.status(400).json({ message: 'Title and content are required' });
        }

        const newText = new PastedText({
            user: req.user._id,
            title,
            content,
            source: source || 'manual'
        });

        const savedText = await newText.save();
        
        // Trigger background embedding
        const textContent = `${title || ''}\n\n${content || ''}`.trim();
        if (textContent) {
          try {
            const worker = new BackgroundWorker();
            await worker.embedAndStoreDocument(textContent, req.user._id, 'pasted_text', savedText._id, title);
            console.log(`[VectorService] ✅ Successfully embedded and stored pasted text ${savedText._id}`);
          } catch (e) {
            console.error(`[VectorService] ❌ Error embedding pasted text ${savedText._id}:`, e.message);
            console.error(e.stack);
          }
        } else {
          console.warn(`[VectorService] ⚠️ Warning: Pasted text ${savedText._id} has no text content to embed.`);
        }

        res.status(201).json(savedText);
    } catch (error) {
        console.error("Error saving pasted text:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete a pasted text
// @route   DELETE /api/pasted-texts/:id
// @access  Private
const deletePastedText = async (req, res) => {
    try {
        const text = await PastedText.findById(req.params.id);

        if (!text) {
            return res.status(404).json({ message: 'Text not found' });
        }

        if (text.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await text.deleteOne();
        
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

        res.json({ message: 'Text removed' });
    } catch (error) {
        console.error("Error deleting pasted text:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getPastedTexts,
    savePastedText,
    deletePastedText
};
