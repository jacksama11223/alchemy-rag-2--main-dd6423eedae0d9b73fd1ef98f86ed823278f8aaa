const asyncHandler = require('express-async-handler');
const Project = require('../models/Project');

const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({ user: req.user._id });
  res.json(projects);
});

const createProject = asyncHandler(async (req, res) => {
  const project = new Project({ ...req.body, user: req.user._id });
  const createdProject = await project.save();
  res.status(201).json(createdProject);
});

const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (project && project.user.toString() === req.user._id.toString()) {
    Object.assign(project, req.body);
    const updatedProject = await project.save();
    res.json(updatedProject);
  } else {
    res.status(404);
    throw new Error('Project not found or unauthorized');
  }
});

const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (project && project.user.toString() === req.user._id.toString()) {
    await project.deleteOne();
    res.json({ message: 'Project removed' });
  } else {
    res.status(404);
    throw new Error('Project not found or unauthorized');
  }
});

module.exports = {
  getProjects, createProject, updateProject, deleteProject
};
