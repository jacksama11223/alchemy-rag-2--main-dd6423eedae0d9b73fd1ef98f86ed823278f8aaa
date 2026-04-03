// backend/controllers/activityLink.controller.js
const NeuralBridgeService = require('../services/NeuralBridgeService');
const Node = require('../models/Node');

// Attach specific task/note to node
exports.attachLink = async (req, res) => {
  try {
    const { nodeId, targetId, moduleType } = req.body;
    const userId = req.user._id;

    if (!nodeId || !targetId || !moduleType) {
      return res.status(400).json({ error: 'Missing linkage parameters.' });
    }

    const updatedNode = await NeuralBridgeService.attachModuleToNode(nodeId, targetId, moduleType, userId);
    res.json({ success: true, node: updatedNode });
  } catch (error) {
    console.error('Error attaching link:', error);
    res.status(500).json({ error: 'Failed to create bridge connection.' });
  }
};

// Retrieve a full Node hub mapping
exports.getHubLinks = async (req, res) => {
  try {
    const { nodeId } = req.params;
    const userId = req.user._id;

    const node = await Node.findOne({ _id: nodeId, user: userId })
                           .populate('linkedTodos')
                           .populate('linkedNotes')
                           .populate('linkedAlchemy');
                           
    if (!node) return res.status(404).json({ error: 'Node not found.' });

    res.json({
        todos: node.linkedTodos,
        notes: node.linkedNotes,
        alchemy: node.linkedAlchemy
    });
  } catch (error) {
    console.error('Error getting hub links:', error);
    res.status(500).json({ error: 'Failed to fetch hub data.' });
  }
};
