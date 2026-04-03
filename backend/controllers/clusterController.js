
const Cluster = require('../models/Cluster');

// @desc    Get user clusters
// @route   GET /api/clusters
const getClusters = async (req, res) => {
  const clusters = await Cluster.find({ user: req.user._id });
  const mapped = clusters.map(c => {
      const obj = c.toObject();
      obj.id = obj._id;
      delete obj._id;
      return obj;
  });
  res.json(mapped);
};

// @desc    Create a cluster
// @route   POST /api/clusters
const createCluster = async (req, res) => {
  const { label, color, nodeIds } = req.body;

  const cluster = new Cluster({
    user: req.user._id,
    label,
    color,
    nodeIds
  });

  const createdCluster = await cluster.save();
  const obj = createdCluster.toObject();
  obj.id = obj._id;
  delete obj._id;
  res.status(201).json(obj);
};

// @desc    Update a cluster
// @route   PUT /api/clusters/:id
const updateCluster = async (req, res) => {
  const cluster = await Cluster.findById(req.params.id);

  if (cluster) {
    if (cluster.user.toString() !== req.user._id.toString()) {
        res.status(401).json({ message: 'Not authorized' });
        return;
    }

    cluster.label = req.body.label || cluster.label;
    cluster.color = req.body.color || cluster.color;
    cluster.nodeIds = req.body.nodeIds || cluster.nodeIds;

    const updated = await cluster.save();
    const obj = updated.toObject();
    obj.id = obj._id;
    delete obj._id;
    res.json(obj);
  } else {
    res.status(404).json({ message: 'Cluster not found' });
  }
};

// @desc    Delete a cluster
// @route   DELETE /api/clusters/:id
const deleteCluster = async (req, res) => {
  const cluster = await Cluster.findById(req.params.id);

  if (cluster) {
    if (cluster.user.toString() !== req.user._id.toString()) {
        res.status(401).json({ message: 'Not authorized' });
        return;
    }
    await cluster.deleteOne();
    res.json({ message: 'Cluster removed' });
  } else {
    res.status(404).json({ message: 'Cluster not found' });
  }
};

module.exports = { getClusters, createCluster, updateCluster, deleteCluster };
