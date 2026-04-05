const asyncHandler = require('express-async-handler');
const ReportItem = require('../models/ReportItem');
const FeedbackItem = require('../models/FeedbackItem');
const AuditLogItem = require('../models/AuditLogItem');
const FeatureFlag = require('../models/FeatureFlag');
const AdminUserFlow = require('../models/AdminUserFlow');
const sendEmail = require('../utils/sendEmail');

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
  const { type, priority, content, name, email } = req.body;
  
  const feedbackData = { 
    type, 
    priority: priority || 'Medium', 
    content, 
  };

  // If user is logged in, link it. Otherwise, it's a guest feedback.
  if (req.user) {
    feedbackData.user = req.user._id;
    console.log(`API: Received feedback from logged-in user: ${req.user.email}`);
  }

  let createdFeedback;
  if (req.user) {
    const feedback = new FeedbackItem(feedbackData);
    createdFeedback = await feedback.save();
    console.log(`API: Feedback saved to database (ID: ${createdFeedback._id})`);
  }

  // Notification email to Admin
  try {
    const senderInfo = req.user ? `${req.user.name} (${req.user.email})` : `${name || 'Khách'} (${email || 'Không có email'})`;
    const senderName = req.user ? req.user.name : (name || 'Guest');
    const senderUserId = req.user ? req.user._id : 'Guest';

    await sendEmail({
      email: 'jacktayden@gmail.com',
      subject: `LearnAI: New Feedback from ${senderName}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; color: #333;">
          <h2 style="color: #00cfd5;">🚀 Phản hồi mới từ hệ thống LearnAI</h2>
          <hr style="border: none; border-top: 1px solid #eee;"/>
          <p><strong>Loại:</strong> ${type}</p>
          <p><strong>Mức độ:</strong> ${priority || 'Medium'}</p>
          <p><strong>Bởi:</strong> ${senderInfo}</p>
          <p><strong>ID Người dùng:</strong> ${senderUserId}</p>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 5px; margin-top: 10px; border-left: 4px solid #00cfd5;">
            <p><strong>Nội dung:</strong></p>
            <p>${content}</p>
          </div>
          <p style="color: #6b7280; font-size: 11px; margin-top: 20px; text-align: center;">Đây là thông báo tự động từ hệ thống hỗ trợ LearnAI.</p>
        </div>
      `,
    });
    console.log(`API: Admin notification email sent successfully to jacktayden@gmail.com`);
  } catch (error) {
    console.error('API: Email sending failed for Admin notification:', error.message);
  }

  res.status(201).json(createdFeedback || { message: 'Feedback sent to admin' });
});

const testEmail = asyncHandler(async (req, res) => {
  try {
    console.log('API: Running email service test...');
    await sendEmail({
      email: 'jacktayden@gmail.com',
      subject: 'LearnAI: Test Email Service ✅',
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #00cfd5;">✅ Email Service Test Successful</h2>
          <p>Hello! If you see this message, the LearnAI email notification system is working correctly with the current SMTP settings.</p>
          <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Config:</strong> ${process.env.EMAIL_USER}</p>
        </div>
      `
    });
    res.status(200).json({ success: true, message: 'Test email sent successfully to jacktayden@gmail.com' });
  } catch (error) {
    console.error('API: Email test failed:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

const updateFeedback = asyncHandler(async (req, res) => {
  const feedback = await FeedbackItem.findById(req.params.id).populate('user', 'name email');
  if (feedback) {
    const oldStatus = feedback.status;
    const oldReply = feedback.reply;

    feedback.status = req.body.status || feedback.status;
    if (req.body.reply !== undefined) {
      feedback.reply = req.body.reply;
    }
    const updatedFeedback = await feedback.save();
    
    if (req.io && feedback.user) {
        // Emit to the user's specific room
        req.io.to(feedback.user._id.toString()).emit('feedback_updated', updatedFeedback);
    }

    // Notify user if admin responded or resolved
    const isNewReply = req.body.reply && req.body.reply !== oldReply;
    const isResolved = feedback.status === 'Resolved' && oldStatus !== 'Resolved';

    if (isNewReply || isResolved) {
      try {
        await sendEmail({
          email: feedback.user.email,
          subject: 'LearnAI: Phản hồi về yêu cầu hỗ trợ của bạn',
          message: `
            <div style="font-family: sans-serif; padding: 20px; color: #333; line-height: 1.6;">
              <h2 style="color: #00cfd5;">Chào ${feedback.user.name},</h2>
              <p>Admin của <strong>LearnAI</strong> đã phản hồi về ý kiến đóng góp của bạn:</p>
              <div style="background: #f4f4f4; padding: 15px; border-left: 5px solid #00cfd5; border-radius: 4px; margin: 20px 0;">
                <em>"${feedback.reply || 'Yêu cầu của bạn đã được chúng tôi xem xét và xử lý.'}"</em>
              </div>
              <p><strong>Trang thái yêu cầu:</strong> <span style="color: #00cfd5; font-weight: bold;">${feedback.status}</span></p>
              <p>Cảm ơn bạn đã tin dùng LearnAI! Nếu có thắc mắc gì thêm, đừng ngần ngại phản hồi nhé.</p>
              <br/>
              <p style="font-size: 12px; color: #777;">Đây là email tự động từ hệ thống hỗ trợ LearnAI.</p>
            </div>
          `
        });
      } catch (error) {
        console.error('Failed to send user feedback update email:', error);
      }
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
  getAdminUserFlows, createAdminUserFlow, updateAdminUserFlow, deleteAdminUserFlow,
  testEmail
};
