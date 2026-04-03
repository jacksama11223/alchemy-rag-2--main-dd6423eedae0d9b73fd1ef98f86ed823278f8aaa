
const Note = require('../models/Note');
const BackgroundWorker = require('../services/backgroundWorker');
const { syncToRag } = require('../utils/ragSync');
const User = require('../models/User'); // Need to check for API keys if needed

// Helper to get text content from blocks
const extractTextFromBlocks = (blocks) => {
  if (!blocks || !Array.isArray(blocks)) return '';
  return blocks.map(b => {
    if (b && typeof b.content === 'string') {
      return b.content.trim();
    }
    return '';
  }).filter(text => text.length > 0).join('\n');
};

// @desc    Get user notes
// @route   GET /api/notes
const getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user._id }).sort({ updatedAt: -1 });
    const mapped = notes.map(n => {
        const obj = n.toObject();
        obj.id = obj._id;
        delete obj._id;
        return obj;
    });
    res.json(mapped);
  } catch (error) {
    console.error('Error in getNotes:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Save note (Create or Update)
// @route   POST /api/notes
const saveNote = async (req, res) => {
  try {
    const { id, parentId, type, title, icon, coverImage, blocks, isExpanded, projectMetadata } = req.body;

    if (id && id.match(/^[0-9a-fA-F]{24}$/)) {
        // Try to update using findOneAndUpdate to avoid VersionError
        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (icon !== undefined) updateData.icon = icon;
        if (coverImage !== undefined) updateData.coverImage = coverImage;
        if (blocks !== undefined) updateData.blocks = blocks;
        if (isExpanded !== undefined) updateData.isExpanded = isExpanded;
        if (projectMetadata !== undefined) updateData.projectMetadata = projectMetadata;
        if (parentId !== undefined) updateData.parentId = parentId;

        const updated = await Note.findOneAndUpdate(
            { _id: id, user: req.user._id },
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (updated) {
            const obj = updated.toObject();
            obj.id = obj._id;
            delete obj._id;
            
            // Trigger background embedding
            let textContent = obj.title ? `${obj.title}\n\n` : '';
            if (obj.blocks) {
              textContent += extractTextFromBlocks(obj.blocks);
            }
            if (textContent.trim()) {
              try {
                // 1. Sync to Hybrid RAG (Vector + Keyword)
                await syncToRag({
                  userId: req.user._id,
                  text: textContent.trim(),
                  title: obj.title,
                  sourceType: 'note',
                  originalDocId: obj.id
                });

                // 2. Extract User Memory Facts
                const user = await User.findById(req.user._id);
                const worker = new BackgroundWorker(user?.geminiApiKey);
                await worker.extractUserMemoryFromText(textContent.trim(), req.user._id);
                
                console.log(`[NoteSync] ✅ Successfully synced note ${obj.id} and extracted memory`);
              } catch (e) {
                console.error(`[NoteSync] ❌ Error syncing note ${obj.id}:`, e.message);
              }
            }

            return res.json(obj);
        }
    }

    // Create
    const newNote = new Note({
        user: req.user._id,
        parentId,
        type,
        title,
        icon,
        coverImage,
        blocks,
        isExpanded,
        projectMetadata
    });
    const created = await newNote.save();
    const obj = created.toObject();
    obj.id = obj._id;
    delete obj._id;
    // Trigger background embedding
    let textContent = title ? `${title}\n\n` : '';
    if (blocks) {
      textContent += extractTextFromBlocks(blocks);
    }
    if (textContent.trim()) {
      try {
        // 1. Sync to Hybrid RAG (Vector + Keyword)
        await syncToRag({
          userId: req.user._id,
          text: textContent.trim(),
          title: title,
          sourceType: 'note',
          originalDocId: obj.id
        });

        // 2. Extract User Memory Facts
        const user = await User.findById(req.user._id);
        const worker = new BackgroundWorker(user?.geminiApiKey);
        await worker.extractUserMemoryFromText(textContent.trim(), req.user._id);

        console.log(`[NoteSync] ✅ Successfully synced new note ${obj.id} and extracted memory`);
      } catch (e) {
        console.error(`[NoteSync] ❌ Error syncing new note ${obj.id}:`, e.message);
      }
    }

    res.status(201).json(obj);
  } catch (error) {
    console.error('Error in saveNote:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete note (and children)
// @route   DELETE /api/notes/:id
const deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (note) {
      if (note.user.toString() !== req.user._id.toString()) {
          res.status(401).json({ message: 'Not authorized' });
          return;
      }
      
      const idsToDelete = [note._id];
      
      const findChildren = async (parentId) => {
          const children = await Note.find({ parentId: parentId.toString() });
          for (const child of children) {
              idsToDelete.push(child._id);
              await findChildren(child._id);
          }
      }
      
      await findChildren(note._id);
      await Note.deleteMany({ _id: { $in: idsToDelete } });
      
      // Delete associated vector store documents
      await require('../models/VectorStore').deleteMany({
        userId: req.user._id,
        'metadata.originalDocId': { $in: idsToDelete.map(id => id.toString()) }
      });
      
      res.json({ message: 'Note and children removed', ids: idsToDelete });
    } else {
      res.status(404).json({ message: 'Note not found' });
    }
  } catch (error) {
    console.error('Error in deleteNote:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Attach a file to a note
// @route   POST /api/notes/:id/attach
const attachFileToNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { fileId, fileName, fileType, source } = req.body;

    const note = await Note.findOne({ _id: id, user: req.user._id });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const newBlock = {
      id: Date.now().toString(),
      type: 'drive_file',
      content: '',
      properties: { fileId, fileName, fileType, source }
    };

    note.blocks.push(newBlock);
    const updatedNote = await note.save();

    const obj = updatedNote.toObject();
    obj.id = obj._id;
    delete obj._id;

    // Broadcast the update
    if (req.io) {
      req.io.emit('data-updated', {
        type: 'file_updated',
        item: {
          ...obj,
          sourceType: 'note'
        }
      });
    }

    res.json(obj);
  } catch (error) {
    console.error('Error in attachFileToNote:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getNotes, saveNote, deleteNote, attachFileToNote };
