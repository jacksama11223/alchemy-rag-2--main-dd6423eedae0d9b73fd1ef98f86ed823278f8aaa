
const User = require('../models/User');
const OTP = require('../models/OTP');
const PasswordResetToken = require('../models/PasswordResetToken');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // Needed for password update
const { OAuth2Client } = require('google-auth-library');
const appleSignin = require('apple-signin-auth');
const axios = require('axios');
const otpGenerator = require('otp-generator');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const admin = require('firebase-admin');
const { sendPushNotification } = require('../utils/pushNotifications');

// Initialize Firebase Admin for token verification
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'the-delight-473201-h0',
  });
}

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Auth user with social provider
// @route   POST /api/users/social
const socialLogin = async (req, res) => {
  try {
    const { provider, token, idToken } = req.body;
    const actualToken = token || idToken;
    console.log('socialLogin received:', { provider, type: typeof actualToken, isString: typeof actualToken === 'string' });
    let email, name, avatar;

    if (!actualToken) {
      return res.status(400).json({ message: 'No authentication token provided' });
    }

    if (provider === 'google') {
      try {
        // First try verifying as a Firebase ID token
        const decodedToken = await admin.auth().verifyIdToken(actualToken);
        email = decodedToken.email || `${decodedToken.uid}@google.com`;
        name = decodedToken.name || email.split('@')[0];
        avatar = decodedToken.picture;
      } catch (firebaseError) {
        // Fallback to Google OAuth2Client if it's a direct Google token
        console.log('Firebase token verification failed, trying Google OAuth2Client', firebaseError.message);
        const ticket = await googleClient.verifyIdToken({
          idToken: actualToken,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        email = payload.email || `${payload.sub}@google.com`;
        name = payload.name;
        avatar = payload.picture;
      }
    } else if (provider === 'apple') {
      const appleIdTokenClaims = await appleSignin.verifyIdToken(actualToken, {
        audience: process.env.APPLE_CLIENT_ID,
        ignoreExpiration: true, // handle expiration yourself if needed
      });
      email = appleIdTokenClaims.email || `${appleIdTokenClaims.sub}@apple.com`;
      // Apple only provides name on the first login, so it might be missing here.
      // We'll generate a placeholder if not provided in the request body.
      name = req.body.name || email.split('@')[0]; 
      avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`;
    } else if (provider === 'facebook') {
      const { data } = await axios.get(`https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${token}`);
      email = data.email || `${data.id}@facebook.com`;
      name = data.name;
      avatar = data.picture?.data?.url;
    } else {
      return res.status(400).json({ message: 'Invalid provider' });
    }

    if (!email) {
      return res.status(400).json({ message: 'Email not provided by social platform' });
    }

    let user = await User.findOne({ email });

    if (!user) {
      const isAdmin = email.endsWith('@admin');
      user = await User.create({
        name,
        email,
        password: Math.random().toString(36).slice(-8), // Generate random password for social users
        isAdmin,
        avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
        friendCode: Math.random().toString(36).substring(2, 8).toUpperCase()
      });
    }

    if (user.isBanned) {
      return res.status(403).json({ message: 'User is banned' });
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      friendCode: user.friendCode,
      avatar: user.avatar,
      token: generateToken(user._id),
      xp: user.xp,
      level: user.level,
      streak: user.streak,
      lastCheckIn: user.lastCheckIn,
      lp: user.lp,
      rankTier: user.rankTier,
      notifications: user.notifications
    });

  } catch (error) {
    console.error('Error in socialLogin:', error);
    res.status(500).json({ message: 'Server error during social login' });
  }
};

// @desc    Auth user & get token
// @route   POST /api/users/login
const authUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      if (user.isBanned) {
          res.status(403).json({ message: 'User is banned' });
          return;
      }
      res.json({
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        friendCode: user.friendCode,
        avatar: user.avatar,
        token: generateToken(user._id),
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        lastCheckIn: user.lastCheckIn,
        lp: user.lp,
        rankTier: user.rankTier,
        notifications: user.notifications
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Error in authUser:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Send OTP for registration
// @route   POST /api/users/send-otp
const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
    
    // Save OTP to DB
    await OTP.create({ email, otp });

    // Send email
    const message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #333; text-align: center;">Chào mừng bạn đến với LearnAI!</h2>
        <p style="color: #555; font-size: 16px;">Mã xác thực (OTP) để đăng ký tài khoản của bạn là:</p>
        <div style="background-color: #f4f4f4; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
          <h1 style="color: #0056b3; letter-spacing: 5px; margin: 0; font-size: 32px;">${otp}</h1>
        </div>
        <p style="color: #555; font-size: 16px;">Mã này sẽ hết hạn sau 5 phút. Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px; text-align: center;">Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
      </div>
    `;
    await sendEmail({
      email,
      subject: 'Mã xác thực để đăng ký tài khoản LearnAI',
      html: message,
    });

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error in sendOTP:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Verify OTP and register user
// @route   POST /api/users/register
const verifyOTPAndRegister = async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;
    
    const otpRecord = await OTP.findOne({ email }).sort({ createdAt: -1 });
    
    if (!otpRecord || otpRecord.otp !== otp) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const isAdmin = email.endsWith('@admin');

    const user = await User.create({
      name,
      email,
      password,
      isAdmin,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      friendCode: Math.random().toString(36).substring(2, 8).toUpperCase()
    });

    // Delete OTP after successful registration
    await OTP.deleteMany({ email });

    if (user) {
      res.status(201).json({
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
        xp: user.xp,
        level: user.level,
        streak: user.streak
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Error in verifyOTPAndRegister:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        lastCheckIn: user.lastCheckIn,
        friends: user.friends,
        lp: user.lp,
        rankTier: user.rankTier,
        notifications: user.notifications
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      if (req.body.password) {
        // Logic inside User model pre-save will hash this
        user.password = req.body.password; 
      }

      const updatedUser = await user.save();

      res.json({
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        token: generateToken(updatedUser._id),
        success: true
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all users (Admin)
// @route   GET /api/users
const getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    console.error('Error in getUsers:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get Leaderboard
// @route   GET /api/users/leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const users = await User.find({})
        .sort({ lp: -1 })
        .limit(100)
        .select('name avatar rankTier lp friends'); // Include friends to check status
    
    const leaderboard = users.map((u, index) => ({
        id: u._id,
        name: u.name,
        avatar: u.avatar,
        tier: u.rankTier || 'Iron',
        lp: u.lp || 0,
        rank: index + 1,
        friends: u.friends
    }));
    
    res.json(leaderboard);
  } catch (error) {
    console.error('Error in getLeaderboard:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Perform Daily Check-in
// @route   POST /api/users/checkin
const dailyCheckIn = async (req, res) => {
  try {
    // ... (Keep existing implementation)
    const user = await User.findById(req.user._id);
    if (!user) { res.status(404).json({ message: 'User not found' }); return; }
    const now = new Date();
    const today = new Date(now).setHours(0,0,0,0);
    const lastCheckIn = user.lastCheckIn ? new Date(user.lastCheckIn).setHours(0,0,0,0) : 0;
    const oneDay = 1000 * 60 * 60 * 24;
    const diffTime = today - lastCheckIn;
    const diffDays = Math.floor(diffTime / oneDay);
    let message = "Checked in!";
    let points = 50;

    if (diffDays === 0) {
        return res.status(200).json({ message: "Already checked in today", streak: user.streak, xp: user.xp, checkedIn: true });
    } else if (diffDays === 1) { user.streak += 1; message = `Streak increased to ${user.streak}!`; } 
    else { user.streak = 1; message = "Streak reset/started."; }

    user.lastCheckIn = now;
    user.xp += points;
    await user.save();
    res.json({ streak: user.streak, xp: user.xp, level: user.level, lastCheckIn: user.lastCheckIn, message });
  } catch (error) {
    console.error('Error in dailyCheckIn:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Send Friend Request
// @route   POST /api/users/friend-request
const sendFriendRequest = async (req, res) => {
  try {
    const { targetUserId } = req.body;
    const sender = req.user;

    // Support both ID and FriendCode
    let targetUser;
    if (targetUserId.length === 6) { // Assuming Friend Code length
         targetUser = await User.findOne({ friendCode: targetUserId });
    } else {
         try { targetUser = await User.findById(targetUserId); } catch(e) {}
    }

    if (!targetUser) {
        res.status(404).json({ message: "User not found" });
        return;
    }
    
    if (targetUser._id.toString() === sender._id.toString()) {
        res.status(400).json({ message: "Cannot add yourself" });
        return;
    }

    // Check if already sent or friends
    const alreadyFriend = sender.friends.includes(targetUser._id);
    if (alreadyFriend) {
        res.status(400).json({ message: "Already friends" });
        return;
    }

    // Add notification to target
    targetUser.notifications.push({
        type: 'friend_request',
        from: sender._id,
        message: `${sender.name} muốn kết bạn với bạn!`,
    });

    await targetUser.save();

    // Send Push Notification
    await sendPushNotification(targetUser, {
        title: 'Lời mời kết bạn mới',
        body: `${sender.name} muốn kết bạn với bạn!`,
        data: { type: 'friend_request', from: sender._id.toString() }
    });

    res.json({ message: `Đã gửi lời mời đến ${targetUser.name}` });
  } catch (error) {
    console.error('Error in sendFriendRequest:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Respond to Friend Request
// @route   POST /api/users/friend-response
const respondFriendRequest = async (req, res) => {
  try {
    const { notificationId, action } = req.body; // action: 'accept' | 'decline'
    const user = await User.findById(req.user._id);

    const notificationIndex = user.notifications.findIndex(n => n._id.toString() === notificationId);
    if (notificationIndex === -1) {
        res.status(404).json({ message: "Notification not found" });
        return;
    }

    const notification = user.notifications[notificationIndex];

    if (action === 'accept' && notification.type === 'friend_request') {
        const sender = await User.findById(notification.from);
        if (sender) {
            // Add to both friends lists
            if (!user.friends.includes(sender._id)) user.friends.push(sender._id);
            if (!sender.friends.includes(user._id)) sender.friends.push(user._id);
            await sender.save();
            
            // Add notification to sender
            sender.notifications.push({
                type: 'info',
                message: `${user.name} đã chấp nhận lời mời kết bạn!`,
                from: user._id
            });
            await sender.save();
            
            // Send Push Notification to sender
            await sendPushNotification(sender, {
                title: 'Lời mời kết bạn đã được chấp nhận',
                body: `${user.name} đã chấp nhận lời mời kết bạn của bạn!`,
                data: { type: 'friend_accept', from: user._id.toString() }
            });
        }
    }

    // Remove notification
    user.notifications.splice(notificationIndex, 1);
    await user.save();

    res.json({ message: `Request ${action}ed`, friends: user.friends, notifications: user.notifications });
  } catch (error) {
    console.error('Error in respondFriendRequest:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get Notifications
// @route   GET /api/users/notifications
const getNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('notifications.from', 'name avatar');
    res.json(user.notifications);
  } catch (error) {
    console.error('Error in getNotifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark Notification as Read
// @route   PUT /api/users/notifications/:id/read
const markNotificationRead = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const notification = user.notifications.id(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.read = true;
    await user.save();

    res.json(notification);
  } catch (error) {
    console.error('Error in markNotificationRead:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get Friends List (Populated)
// @route   GET /api/users/friends
const getUserFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('friends', 'name avatar rankTier lp lastCheckIn');
    // Map _id to id for frontend consistency
    const friends = user.friends.map(f => {
        const obj = f.toObject();
        obj.id = obj._id;
        delete obj._id;
        return obj;
    });
    res.json(friends);
  } catch (error) {
    console.error('Error in getUserFriends:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update User Status (Ban/Unban)
// @route   PUT /api/users/:id/status
// @access  Private/Admin
const updateUserStatus = async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    const user = await User.findById(req.params.id);

    if (user) {
        user.isBanned = req.body.isBanned !== undefined ? req.body.isBanned : user.isBanned;
        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
            isBanned: updatedUser.isBanned,
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error in updateUserStatus:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update User Persona
// @route   PUT /api/users/persona
const updateUserPersona = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
        if (typeof req.body.persona === 'string') {
            // If it's a string, maybe they just want to set a suggestion or it's a legacy format
            user.persona = { ...user.persona, suggestion: req.body.persona };
        } else {
            user.persona = { ...user.persona, ...req.body.persona };
        }
        const updatedUser = await user.save();
        res.json(updatedUser.persona);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error in updateUserPersona:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Request Password Reset
// @route   POST /api/users/request-reset-password
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hash = await bcrypt.hash(resetToken, 10);

    await PasswordResetToken.create({
      email,
      token: hash,
    });

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}&email=${email}`;
    const message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #333; text-align: center;">Yêu cầu đặt lại mật khẩu</h2>
        <p style="color: #555; font-size: 16px;">Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản LearnAI của mình. Vui lòng nhấp vào nút bên dưới để đặt lại mật khẩu:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #0056b3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Đặt lại mật khẩu</a>
        </div>
        <p style="color: #555; font-size: 16px;">Hoặc bạn có thể sao chép và dán liên kết sau vào trình duyệt:</p>
        <p style="color: #0056b3; font-size: 14px; word-break: break-all;">${resetUrl}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px; text-align: center;">Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
      </div>
    `;

    await sendEmail({
      email,
      subject: 'LearnAI - Đặt lại mật khẩu',
      html: message,
    });

    res.status(200).json({ message: 'Password reset link sent to email' });
  } catch (error) {
    console.error('Error in requestPasswordReset:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reset Password
// @route   POST /api/users/reset-password
const resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    const resetTokenRecord = await PasswordResetToken.findOne({ email }).sort({ createdAt: -1 });

    if (!resetTokenRecord) {
      return res.status(400).json({ message: 'Invalid or expired password reset token' });
    }

    const isValid = await bcrypt.compare(token, resetTokenRecord.token);

    if (!isValid) {
      return res.status(400).json({ message: 'Invalid or expired password reset token' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = newPassword;
    await user.save();

    await PasswordResetToken.deleteMany({ email });

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Error in resetPassword:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Save push token
// @route   POST /api/users/push-token
const savePushToken = async (req, res) => {
  try {
    const { token, platform } = req.body;
    if (!token || !platform) {
      return res.status(400).json({ message: 'Token and platform are required' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if token already exists
    const tokenExists = user.pushTokens.find(t => t.token === token);
    if (!tokenExists) {
      user.pushTokens.push({ token, platform });
      await user.save();
    }

    res.status(200).json({ message: 'Push token saved successfully' });
  } catch (error) {
    console.error('Error in savePushToken:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { 
    authUser, sendOTP, verifyOTPAndRegister, getUserProfile, updateUserProfile, getUsers, getLeaderboard, dailyCheckIn,
    sendFriendRequest, respondFriendRequest, getNotifications, markNotificationRead, getUserFriends, updateUserStatus,
    updateUserPersona, socialLogin, requestPasswordReset, resetPassword, savePushToken
};
