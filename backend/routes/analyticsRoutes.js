const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
  getBehaviorLogs, getMyBehaviorLogs, createBehaviorLog,
  getAnalyticsData, createAnalyticsData, updateAnalyticsData
} = require('../controllers/analyticsController');

router.route('/behavior-logs').get(protect, admin, getBehaviorLogs).post(protect, createBehaviorLog);
router.route('/my-behavior-logs').get(protect, getMyBehaviorLogs);

router.route('/data').get(protect, getAnalyticsData).post(protect, createAnalyticsData);
router.route('/data/:id').put(protect, updateAnalyticsData);

module.exports = router;
