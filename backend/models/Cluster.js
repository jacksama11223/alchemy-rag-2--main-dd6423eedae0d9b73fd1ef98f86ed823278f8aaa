
const mongoose = require('mongoose');

const clusterSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  label: { type: String, required: true },
  color: { type: String, default: '#3b82f6' },
  nodeIds: [String], // Array of Node IDs (strings from frontend/backend)
  centroid: {
    x: { type: Number },
    y: { type: Number }
  },
  createdID: { type: String }
}, {
  timestamps: true,
});

const Cluster = mongoose.model('Cluster', clusterSchema);
module.exports = Cluster;
