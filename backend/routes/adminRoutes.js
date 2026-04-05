const express = require('express');
const router = express.Router();
const { protect, admin, optionalProtect } = require('../middleware/authMiddleware');
const {
  getReports, createReport, updateReport,
  getFeedbacks, getMyFeedbacks, createFeedback, updateFeedback,
  sendBroadcast,
  getAuditLogs, createAuditLog,
  getFeatureFlags, createFeatureFlag, updateFeatureFlag, deleteFeatureFlag,
  getAdminUserFlows, createAdminUserFlow, updateAdminUserFlow, deleteAdminUserFlow,
  testEmail
} = require('../controllers/adminController');

router.route('/reports').get(protect, getReports).post(protect, createReport);
router.route('/reports/:id').put(protect, updateReport);

router.route('/feedbacks').get(protect, getFeedbacks).post(optionalProtect, createFeedback);
router.get('/test-email', testEmail);
router.route('/my-feedbacks').get(protect, getMyFeedbacks);
router.route('/feedbacks/:id').put(protect, updateFeedback);

router.route('/broadcast').post(protect, admin, sendBroadcast);

router.route('/audit-logs').get(protect, getAuditLogs).post(protect, createAuditLog);

router.route('/feature-flags').get(protect, getFeatureFlags).post(protect, createFeatureFlag);
router.route('/feature-flags/:id').put(protect, updateFeatureFlag).delete(protect, deleteFeatureFlag);

router.route('/user-flows').get(protect, getAdminUserFlows).post(protect, createAdminUserFlow);
router.route('/user-flows/:id').put(protect, updateAdminUserFlow).delete(protect, deleteAdminUserFlow);

module.exports = router;
