
const Drawing = require('../models/Drawing');

// @desc    Get user drawings
// @route   GET /api/drawings
const getDrawings = async (req, res) => {
  const drawings = await Drawing.find({ user: req.user._id }).sort({ updatedAt: -1 });
  const mapped = drawings.map(d => {
      const obj = d.toObject();
      obj.id = obj._id;
      delete obj._id;
      return obj;
  });
  res.json(mapped);
};

// @desc    Save drawing (Create or Update)
// @route   POST /api/drawings
const saveDrawing = async (req, res) => {
  const { id, name, elements, template, mode, pageCount } = req.body;

  // Check if ID is a valid ObjectId (MongoDB ID)
  // If it's a temp ID from frontend (random string), we create new.
  // Or we check if we can find it.
  
  let drawing;
  
  try {
      if (id && id.match(/^[0-9a-fA-F]{24}$/)) {
          drawing = await Drawing.findById(id);
      }
  } catch (e) {}

  if (drawing && drawing.user.toString() === req.user._id.toString()) {
      // Update
      drawing.name = name;
      drawing.elements = elements;
      drawing.template = template;
      drawing.mode = mode;
      drawing.pageCount = pageCount;
      const updated = await drawing.save();
      const obj = updated.toObject();
      obj.id = obj._id;
      delete obj._id;
      res.json(obj);
  } else {
      // Create new
      const newDrawing = new Drawing({
          user: req.user._id,
          name,
          elements,
          template,
          mode,
          pageCount
      });
      const created = await newDrawing.save();
      const obj = created.toObject();
      obj.id = obj._id;
      delete obj._id;
      res.status(201).json(obj);
  }
};

// @desc    Delete drawing
// @route   DELETE /api/drawings/:id
const deleteDrawing = async (req, res) => {
  const drawing = await Drawing.findById(req.params.id);

  if (drawing) {
    if (drawing.user.toString() !== req.user._id.toString()) {
        res.status(401).json({ message: 'Not authorized' });
        return;
    }
    await drawing.deleteOne();
    res.json({ message: 'Drawing removed' });
  } else {
    res.status(404).json({ message: 'Drawing not found' });
  }
};

module.exports = { getDrawings, saveDrawing, deleteDrawing };
