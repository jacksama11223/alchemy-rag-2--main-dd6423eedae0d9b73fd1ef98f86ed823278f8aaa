const asyncHandler = require('express-async-handler');
const ReportItem = require('../models/ReportItem');
const FeedbackItem = require('../models/FeedbackItem');
const AuditLogItem = require('../models/AuditLogItem');
const FeatureFlag = require('../models/FeatureFlag');
const AdminUserFlow = require('../models/AdminUserFlow');

// --- ReportItem ---
const getReports = asyncHandler(async (req, res) => {
  const reports = await ReportItem.find({}).populate('reporter', 'name email');
  res.json(reports);
});

const createReport = asyncHandler(async (req, res) => {
  const report = new ReportItem({ ...req.body, reporter: req.user._id });
  const createdReport = await report.save();
  res.status(201).json(createdReport);
});

const updateReport = asyncHandler(async (req, res) => {
  const report = await ReportItem.findById(req.params.id);
  if (report) {
    report.status = req.body.status || report.status;
    const updatedReport = await report.save();
    res.json(updatedReport);
  } else {
    res.status(404);
    throw new Error('Report not found');
  }
});

// --- FeedbackItem ---
const getFeedbacks = asyncHandler(async (req, res) => {
  const feedbacks = await FeedbackItem.find({}).populate('user', 'name email');
  res.json(feedbacks);
});

const getMyFeedbacks = asyncHandler(async (req, res) => {
  const feedbacks = await FeedbackItem.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(feedbacks);
});

const createFeedback = asyncHandler(async (req, res) => {
  const feedback = new FeedbackItem({ ...req.body, user: req.user._id });
  const createdFeedback = await feedback.save();
  res.status(201).json(createdFeedback);
});

const updateFeedback = asyncHandler(async (req, res) => {
  const feedback = await FeedbackItem.findById(req.params.id);
  if (feedback) {
    feedback.status = req.body.status || feedback.status;
    if (req.body.reply !== undefined) {
      feedback.reply = req.body.reply;
    }
    const updatedFeedback = await feedback.save();
    
    if (req.io && feedback.user) {
        req.io.to(feedback.user.toString()).emit('feedback_updated', updatedFeedback);
    }

    res.json(updatedFeedback);
  } else {
    res.status(404);
    throw new Error('Feedback not found');
  }
});

const sendBroadcast = asyncHandler(async (req, res) => {
    const { title, message, type } = req.body;
    if (req.io) {
        req.io.emit('system_broadcast', { title, message, type, timestamp: new Date() });
        res.json({ success: true, message: 'Broadcast sent' });
    } else {
        res.status(500);
        throw new Error('Socket.io not initialized');
    }
});

// --- AuditLogItem ---
const getAuditLogs = asyncHandler(async (req, res) => {
  const logs = await AuditLogItem.find({}).populate('actor', 'name email').sort({ createdAt: -1 });
  res.json(logs);
});

const createAuditLog = asyncHandler(async (req, res) => {
  const log = new AuditLogItem({ ...req.body, actor: req.user._id });
  const createdLog = await log.save();
  res.status(201).json(createdLog);
});

// --- FeatureFlag ---
const getFeatureFlags = asyncHandler(async (req, res) => {
  const flags = await FeatureFlag.find({});
  res.json(flags);
});

const createFeatureFlag = asyncHandler(async (req, res) => {
  const flag = new FeatureFlag(req.body);
  const createdFlag = await flag.save();
  res.status(201).json(createdFlag);
});

const updateFeatureFlag = asyncHandler(async (req, res) => {
  const flag = await FeatureFlag.findById(req.params.id);
  if (flag) {
    Object.assign(flag, req.body);
    const updatedFlag = await flag.save();
    res.json(updatedFlag);
  } else {
    res.status(404);
    throw new Error('Feature Flag not found');
  }
});

const deleteFeatureFlag = asyncHandler(async (req, res) => {
  const flag = await FeatureFlag.findById(req.params.id);
  if (flag) {
    await flag.deleteOne();
    res.json({ message: 'Feature Flag removed' });
  } else {
    res.status(404);
    throw new Error('Feature Flag not found');
  }
});

// --- AdminUserFlow ---
const getAdminUserFlows = asyncHandler(async (req, res) => {
  const flows = await AdminUserFlow.find({}).populate('createdBy', 'name email');
  res.json(flows);
});

const createAdminUserFlow = asyncHandler(async (req, res) => {
  const flow = new AdminUserFlow({ ...req.body, createdBy: req.user._id });
  const createdFlow = await flow.save();
  res.status(201).json(createdFlow);
});

const updateAdminUserFlow = asyncHandler(async (req, res) => {
  const flow = await AdminUserFlow.findById(req.params.id);
  if (flow) {
    Object.assign(flow, req.body);
    const updatedFlow = await flow.save();
    res.json(updatedFlow);
  } else {
    res.status(404);
    throw new Error('Admin User Flow not found');
  }
});

const deleteAdminUserFlow = asyncHandler(async (req, res) => {
  const flow = await AdminUserFlow.findById(req.params.id);
  if (flow) {
    await flow.deleteOne();
    res.json({ message: 'Admin User Flow removed' });
  } else {
    res.status(404);
    throw new Error('Admin User Flow not found');
  }
});

module.exports = {
  getReports, createReport, updateReport,
  getFeedbacks, getMyFeedbacks, createFeedback, updateFeedback,
  sendBroadcast,
  getAuditLogs, createAuditLog,
  getFeatureFlags, createFeatureFlag, updateFeatureFlag, deleteFeatureFlag,
  getAdminUserFlows, createAdminUserFlow, updateAdminUserFlow, deleteAdminUserFlow
};
