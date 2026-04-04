const Node = require('../models/Node');
const { syncToRag } = require('../utils/ragSync');
const { calculateSM2 } = require('../utils/sm2');

// @desc    Get user nodes
// @route   GET /api/nodes
const getNodes = async (req, res) => {
  try {
    const nodes = await Node.find({ user: req.user._id });
    // Map _id to id for frontend compatibility
    const mappedNodes = nodes.map(n => {
        const obj = n.toObject();
        obj.id = obj._id;
        delete obj._id;
        return obj;
    });
    res.json(mappedNodes);
  } catch (error) {
    console.error('Error in getNodes:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a node
// @route   POST /api/nodes
const createNode = async (req, res) => {
  try {
    const { title, type, data, x, y, tags, imageUrl } = req.body;

    const node = new Node({
      user: req.user._id,
      title,
      type,
      data,
      x,
      y,
      tags,
      imageUrl
    });

    const createdNode = await node.save();
    const obj = createdNode.toObject();
    obj.id = obj._id;
    delete obj._id;

    // Background RAG Sync
    syncToRag({
      userId: req.user._id,
      text: node.data?.summary || node.data?.extractedText || node.data?.originalContent || node.title,
      title: node.title,
      sourceType: 'node',
      metadata: { nodeId: createdNode._id, nodeType: node.type }
    }).catch(e => console.error("Async RAG sync failed for node", e));

    res.status(201).json(obj);
  } catch (error) {
    console.error('Error in createNode:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a node
// @route   PUT /api/nodes/:id
const updateNode = async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    const node = await Node.findById(req.params.id);

    if (node) {
      if (node.user.toString() !== req.user._id.toString()) {
          res.status(401).json({ message: 'Not authorized' });
          return;
      }
      
      node.title = req.body.title || node.title;
      if (req.body.data !== undefined) {
          node.data = req.body.data;
          node.markModified('data');
      }
      node.x = req.body.x !== undefined ? req.body.x : node.x;
      node.y = req.body.y !== undefined ? req.body.y : node.y;
      node.tags = req.body.tags || node.tags;
      node.mastery = req.body.mastery !== undefined ? req.body.mastery : node.mastery;

      const updatedNode = await node.save();
      const obj = updatedNode.toObject();
      obj.id = obj._id;
      delete obj._id;

      // Background RAG Sync
      syncToRag({
        userId: req.user._id,
        text: node.data?.summary || node.data?.extractedText || node.data?.originalContent || node.title,
        title: node.title,
        sourceType: 'node',
        metadata: { nodeId: updatedNode._id, nodeType: node.type }
      }).catch(e => console.error("Async RAG sync failed for node update", e));

      res.json(obj);
    } else {
      res.status(404).json({ message: 'Node not found' });
    }
  } catch (error) {
    console.error('Error in updateNode:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a node
// @route   DELETE /api/nodes/:id
const deleteNode = async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    const node = await Node.findById(req.params.id);

    if (node) {
      if (node.user.toString() !== req.user._id.toString()) {
          res.status(401).json({ message: 'Not authorized' });
          return;
      }
      
      await Node.findByIdAndDelete(req.params.id);
      res.json({ message: 'Node removed' });
    } else {
      res.status(404).json({ message: 'Node not found' });
    }
  } catch (error) {
    console.error('Error in deleteNode:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Sync/Overwrite all nodes (for bulk updates)
// @route   POST /api/nodes/sync
const syncNodes = async (req, res) => {
  try {
    const nodes = req.body.nodes;
    const userId = req.user._id;

    // Get all existing node IDs for this user
    const existingNodes = await Node.find({ user: userId });
    const existingIds = existingNodes.map(n => n._id.toString());

    // Find nodes to update, insert, and delete
    const incomingIds = nodes.filter(n => n.id && n.id.match(/^[0-9a-fA-F]{24}$/)).map(n => n.id);
    
    // Delete nodes that are not in the incoming list
    const idsToDelete = existingIds.filter(id => !incomingIds.includes(id));
    if (idsToDelete.length > 0) {
        await Node.deleteMany({ _id: { $in: idsToDelete }, user: userId });
    }

    // Upsert incoming nodes
    for (const n of nodes) {
        if (n.id && n.id.match(/^[0-9a-fA-F]{24}$/)) {
            // Update existing
            await Node.findByIdAndUpdate(n.id, {
                title: n.title,
                type: n.type,
                data: n.data,
                x: n.x,
                y: n.y,
                tags: n.tags,
                imageUrl: n.imageUrl,
                mastery: n.mastery
            });
            // Background RAG Sync
            syncToRag({
                userId,
                text: n.data?.summary || n.data?.extractedText || n.data?.originalContent || n.title,
                title: n.title,
                sourceType: 'node',
                metadata: { nodeId: n.id, nodeType: n.type }
            }).catch(e => console.error("SyncNode background sync error", e));
        } else {
            // Insert new
            const newNode = new Node({
                user: userId,
                title: n.title,
                type: n.type,
                data: n.data,
                x: n.x,
                y: n.y,
                tags: n.tags,
                imageUrl: n.imageUrl
            });
            const saved = await newNode.save();
            // Background RAG Sync
            syncToRag({
                userId,
                text: n.data?.summary || n.data?.extractedText || n.data?.originalContent || n.title,
                title: n.title,
                sourceType: 'node',
                metadata: { nodeId: saved._id, nodeType: n.type }
            }).catch(e => console.error("SyncNode background sync error", e));
        }
    }

    const newNodes = await Node.find({ user: userId });
    // Map _id to id
    const mappedNodes = newNodes.map(n => {
        const obj = n.toObject();
        obj.id = obj._id;
        delete obj._id;
        return obj;
    });
    res.json(mappedNodes);
  } catch (error) {
    console.error('Error in syncNodes:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Review a specific item in a node (SR update)
// @route   POST /api/nodes/:id/review
const reviewNodeItem = async (req, res) => {
  try {
    const { itemType, itemIndex, quality } = req.body;
    const node = await Node.findById(req.params.id);

    if (!node) return res.status(404).json({ message: 'Node not found' });
    if (node.user.toString() !== req.user._id.toString()) return res.status(401).json({ message: 'Not authorized' });

    if (!node.data || !node.data[itemType] || !node.data[itemType][itemIndex]) {
        return res.status(400).json({ message: 'Invalid item type or index' });
    }

    const item = node.data[itemType][itemIndex];
    const newSM2 = calculateSM2(item.sm2, quality);
    
    // Update the item safely
    node.data[itemType][itemIndex].sm2 = newSM2;
    node.markModified('data');

    // Calculate aggregated mastery if needed
    // node.mastery = ... 

    await node.save();
    res.json({ success: true, sm2: newSM2 });
  } catch (error) {
    console.error('Error in reviewNodeItem:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get nodes with due items
// @route   GET /api/nodes/due
const getDueNodes = async (req, res) => {
  try {
    const nodes = await Node.find({ user: req.user._id });
    const now = new Date();
    const todayStart = new Date(now.setHours(0,0,0,0)).getTime();

    const dueNodes = nodes.filter(node => {
        if (!node.data) return false;
        const allItems = [
            ...(node.data.flashcards || []),
            ...(node.data.quiz || []),
            ...(node.data.fillInBlanks || []),
            ...(node.data.spotErrors || []),
            ...(node.data.caseStudies || [])
        ];
        
        return allItems.some(item => {
            if (!item || !item.sm2 || !item.sm2.nextReviewDate) return false;
            return new Date(item.sm2.nextReviewDate).getTime() <= todayStart;
        });
    }).map(n => {
        const obj = n.toObject();
        obj.id = obj._id;
        delete obj._id;
        return obj;
    });

    res.json(dueNodes);
  } catch (error) {
    console.error('Error in getDueNodes:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getNodes, createNode, updateNode, deleteNode, syncNodes, reviewNodeItem, getDueNodes };