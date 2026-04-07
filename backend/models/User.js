
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const notificationSchema = mongoose.Schema({
  type: { type: String, required: true }, // 'friend_request', 'system', 'info'
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  message: { type: String },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  friendCode: { type: String, unique: true },
  avatar: { type: String },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  notifications: [notificationSchema], // Added notifications
  isAdmin: { type: Boolean, default: false, required: true },
  isBanned: { type: Boolean, default: false },
  // Gamification Stats
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  streak: { type: Number, default: 0 },
  lastCheckIn: { type: Date, default: null },
  lp: { type: Number, default: 0 }, // League Points
  rankTier: { type: String, default: 'Iron' },
  rankDivision: { type: String, default: 'IV' },
  totalWins: { type: Number, default: 0 },
  totalLosses: { type: Number, default: 0 },
  seasonPoints: {
    daily: { type: Number, default: 0 },
    weekly: { type: Number, default: 0 },
    monthly: { type: Number, default: 0 }
  },
  // Second Brain Stats
  brainPower: { type: Number, default: 0 },
  brainLevel: { type: String, default: 'Novice' }, // Novice, Intermediate, Advanced, Expert, Master, Legend
  topSkills: [{ type: String }],
  matchHistory: [{
    result: { type: String, enum: ['Victory', 'Defeat'] },
    lpChange: { type: Number },
    timestamp: { type: Date, default: Date.now }
  }],
  // CRM
  ltv: { type: Number, default: 0 },
  riskScore: { type: Number, default: 0 },
  lastDevice: { type: String },
  segments: [{ type: String }],
  engagementScore: { type: Number, default: 0 },
  lastActive: { type: Date },
  // UI Preferences
  widgetOrder: [{ type: String }],
  theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
  // AI Persona
  persona: {
    learningStyle: { type: String, enum: ['Visual', 'Auditory', 'Kinesthetic', 'Reading', 'Mixed'] },
    focusTime: { type: String, enum: ['Morning', 'Afternoon', 'Night', 'Erratic'] },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    suggestion: { type: String }
  },
  pushTokens: [{
    token: { type: String, required: true },
    platform: { type: String, enum: ['web', 'ios', 'android', 'expo'], required: true },
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true,
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  // Generate friend code if not exists
  if (!this.friendCode) {
     this.friendCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);
module.exports = User;
