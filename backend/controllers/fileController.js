
const File = require('../models/File');

// @desc    Get files
// @route   GET /api/files
const getFiles = async (req, res) => {
  const files = await File.find({ user: req.user._id });
  const mapped = files.map(f => {
      const obj = f.toObject();
      obj.id = obj._id;
      delete obj._id;
      return obj;
  });
  res.json(mapped);
};

// @desc    Create file
// @route   POST /api/files
const createFile = async (req, res) => {
  const fileData = req.body;
  delete fileData.id;

  const file = new File({
    ...fileData,
    user: req.user._id
  });

  const createdFile = await file.save();
  const obj = createdFile.toObject();
  obj.id = obj._id;
  delete obj._id;
  res.status(201).json(obj);
};

// @desc    Update file (rename, move, star, trash)
// @route   PUT /api/files/:id
const updateFile = async (req, res) => {
  const file = await File.findById(req.params.id);

  if (file) {
    if (file.user.toString() !== req.user._id.toString()) {
        res.status(401).json({ message: 'Not authorized' });
        return;
    }
    
    Object.assign(file, req.body);
    
    const updatedFile = await file.save();
    const obj = updatedFile.toObject();
    obj.id = obj._id;
    delete obj._id;
    res.json(obj);
  } else {
    res.status(404).json({ message: 'File not found' });
  }
};

// @desc    Delete file
// @route   DELETE /api/files/:id
const deleteFile = async (req, res) => {
  const file = await File.findById(req.params.id);

  if (file) {
    if (file.user.toString() !== req.user._id.toString()) {
        res.status(401).json({ message: 'Not authorized' });
        return;
    }
    await file.deleteOne();
    res.json({ message: 'File removed' });
  } else {
    res.status(404).json({ message: 'File not found' });
  }
};

module.exports = { getFiles, createFile, updateFile, deleteFile };
