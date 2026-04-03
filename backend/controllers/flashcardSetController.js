const FlashcardSet = require('../models/FlashcardSet');

// @desc    Get user flashcard sets
// @route   GET /api/flashcardsets
const getFlashcardSets = async (req, res) => {
  try {
    const sets = await FlashcardSet.find({ user: req.user._id });
    res.json(sets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a flashcard set
// @route   POST /api/flashcardsets
const createFlashcardSet = async (req, res) => {
  const { title, description, cards, tags, sourceNoteId } = req.body;

  try {
    const set = new FlashcardSet({
      user: req.user._id,
      title,
      description,
      cards,
      tags,
      sourceNoteId
    });

    const createdSet = await set.save();
    res.status(201).json(createdSet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a flashcard set
// @route   PUT /api/flashcardsets/:id
const updateFlashcardSet = async (req, res) => {
  try {
    const set = await FlashcardSet.findById(req.params.id);

    if (set) {
      if (set.user.toString() !== req.user._id.toString()) {
        res.status(401).json({ message: 'Not authorized' });
        return;
      }

      set.title = req.body.title || set.title;
      set.description = req.body.description || set.description;
      set.cards = req.body.cards || set.cards;
      set.tags = req.body.tags || set.tags;

      const updatedSet = await set.save();
      res.json(updatedSet);
    } else {
      res.status(404).json({ message: 'Flashcard set not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a flashcard set
// @route   DELETE /api/flashcardsets/:id
const deleteFlashcardSet = async (req, res) => {
  try {
    const set = await FlashcardSet.findById(req.params.id);

    if (set) {
      if (set.user.toString() !== req.user._id.toString()) {
        res.status(401).json({ message: 'Not authorized' });
        return;
      }

      await set.deleteOne();
      res.json({ message: 'Flashcard set removed' });
    } else {
      res.status(404).json({ message: 'Flashcard set not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getFlashcardSets,
  createFlashcardSet,
  updateFlashcardSet,
  deleteFlashcardSet
};
