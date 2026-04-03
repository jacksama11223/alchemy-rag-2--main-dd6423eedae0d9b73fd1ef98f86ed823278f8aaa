const asyncHandler = require('express-async-handler');
const SavedLearningPath = require('../models/SavedLearningPath');

const getLearningPaths = asyncHandler(async (req, res) => {
  const paths = await SavedLearningPath.find({ user: req.user._id });
  res.json(paths);
});

const createLearningPath = asyncHandler(async (req, res) => {
  const path = new SavedLearningPath({ ...req.body, user: req.user._id });
  const createdPath = await path.save();
  res.status(201).json(createdPath);
});

const updateLearningPath = asyncHandler(async (req, res) => {
  const path = await SavedLearningPath.findById(req.params.id);
  if (path && path.user.toString() === req.user._id.toString()) {
    Object.assign(path, req.body);
    const updatedPath = await path.save();
    res.json(updatedPath);
  } else {
    res.status(404);
    throw new Error('Learning Path not found or unauthorized');
  }
});

const deleteLearningPath = asyncHandler(async (req, res) => {
  const path = await SavedLearningPath.findById(req.params.id);
  if (path && path.user.toString() === req.user._id.toString()) {
    await path.deleteOne();
    res.json({ message: 'Learning Path removed' });
  } else {
    res.status(404);
    throw new Error('Learning Path not found or unauthorized');
  }
});

module.exports = {
  getLearningPaths, createLearningPath, updateLearningPath, deleteLearningPath
};
