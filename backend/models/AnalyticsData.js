const mongoose = require('mongoose');

const analyticsDataSchema = new mongoose.Schema({
  date: { type: Date, required: true, unique: true },
  dailyActiveUsers: { type: Number, default: 0 },
  newSignups: { type: Number, default: 0 },
  aiTokensConsumed: { type: Number, default: 0 },
  featureUsage: [{ 
    name: { type: String }, 
    count: { type: Number } 
  }],
  retentionRate: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('AnalyticsData', analyticsDataSchema);
