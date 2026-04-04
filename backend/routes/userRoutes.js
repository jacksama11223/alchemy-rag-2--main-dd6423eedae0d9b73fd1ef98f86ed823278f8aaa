
const express = require('express');
const router = express.Router();
const { 
    authUser, sendOTP, verifyOTPAndRegister, getUserProfile, updateUserProfile, getUsers, getLeaderboard, dailyCheckIn,
    sendFriendRequest, respondFriendRequest, getNotifications, markNotificationRead, getUserFriends, updateUserStatus,
    updateUserPersona, socialLogin, requestPasswordReset, resetPassword, savePushToken
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/send-otp', sendOTP);
router.post('/register', verifyOTPAndRegister);
router.post('/login', authUser);
router.post('/social', socialLogin);
router.post('/request-reset-password', requestPasswordReset);
router.post('/reset-password', resetPassword);
router.post('/push-token', protect, savePushToken);
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile); // Update profile

router.put('/persona', protect, updateUserPersona);

router.post('/checkin', protect, dailyCheckIn);
router.get('/leaderboard', getLeaderboard); 

// Friend & Notification Routes
router.post('/friend-request', protect, sendFriendRequest);
router.post('/friend-response', protect, respondFriendRequest);
router.get('/notifications', protect, getNotifications);
router.put('/notifications/:id/read', protect, markNotificationRead);
router.get('/friends', protect, getUserFriends); // NEW

router.get('/', protect, admin, getUsers);
router.put('/:id/status', protect, admin, updateUserStatus);

module.exports = router;
