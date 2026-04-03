const asyncHandler = require('express-async-handler');
const BehaviorLog = require('../models/BehaviorLog');
const AnalyticsData = require('../models/AnalyticsData');

// --- BehaviorLog ---
const getBehaviorLogs = asyncHandler(async (req, res) => {
  const logs = await BehaviorLog.find({}).populate('user', 'name email').sort({ createdAt: -1 }).limit(100);
  res.json(logs);
});

const getMyBehaviorLogs = asyncHandler(async (req, res) => {
  const logs = await BehaviorLog.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(100);
  res.json(logs);
});

const createBehaviorLog = asyncHandler(async (req, res) => {
  const log = new BehaviorLog({ ...req.body, user: req.user._id });
  const createdLog = await log.save();
  res.status(201).json(createdLog);
});

// --- AnalyticsData ---
const getAnalyticsData = asyncHandler(async (req, res) => {
  const data = await AnalyticsData.find({}).sort({ date: -1 }).limit(30);
  res.json(data);
});

const createAnalyticsData = asyncHandler(async (req, res) => {
  const data = new AnalyticsData(req.body);
  const createdData = await data.save();
  res.status(201).json(createdData);
});

const updateAnalyticsData = asyncHandler(async (req, res) => {
  const data = await AnalyticsData.findById(req.params.id);
  if (data) {
    Object.assign(data, req.body);
    const updatedData = await data.save();
    res.json(updatedData);
  } else {
    res.status(404);
    throw new Error('Analytics Data not found');
  }
});

module.exports = {
  getBehaviorLogs, getMyBehaviorLogs, createBehaviorLog,
  getAnalyticsData, createAnalyticsData, updateAnalyticsData
};
