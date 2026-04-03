const MarketplaceItem = require('../models/MarketplaceItem');

// @desc    Get all market items
// @route   GET /api/market
const getItems = async (req, res) => {
  try {
    const items = await MarketplaceItem.find({ status: 'approved' }).sort({ createdAt: -1 });
    const mapped = items.map(i => {
        const obj = i.toObject();
        obj.id = obj._id;
        delete obj._id;
        return obj;
    });
    res.json(mapped);
  } catch (error) {
    console.error('Error in getItems:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Publish item
// @route   POST /api/market
const publishItem = async (req, res) => {
  try {
    const { title, type, price, category, url, description, payload } = req.body;

    const item = new MarketplaceItem({
      title,
      author: req.user._id,
      authorName: req.user.name,
      type,
      price,
      category,
      url,
      description,
      payload,
      status: 'pending' // Changed to pending for admin approval flow
    });

    const createdItem = await item.save();
    res.status(201).json(createdItem);
  } catch (error) {
    console.error('Error in publishItem:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get pending market items
// @route   GET /api/market/pending
// @access  Private/Admin
const getPendingItems = async (req, res) => {
  try {
    const items = await MarketplaceItem.find({ status: 'pending' }).sort({ createdAt: -1 });
    const mapped = items.map(i => {
        const obj = i.toObject();
        obj.id = obj._id;
        delete obj._id;
        return obj;
    });
    res.json(mapped);
  } catch (error) {
    console.error('Error in getPendingItems:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Approve market item
// @route   PUT /api/market/:id/approve
// @access  Private/Admin
const approveItem = async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    const item = await MarketplaceItem.findById(req.params.id);
    if (item) {
        item.status = 'approved';
        const updatedItem = await item.save();
        res.json(updatedItem);
    } else {
        res.status(404).json({ message: 'Item not found' });
    }
  } catch (error) {
    console.error('Error in approveItem:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reject market item
// @route   PUT /api/market/:id/reject
// @access  Private/Admin
const rejectItem = async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    const item = await MarketplaceItem.findById(req.params.id);
    if (item) {
        item.status = 'rejected';
        const updatedItem = await item.save();
        res.json(updatedItem);
    } else {
        res.status(404).json({ message: 'Item not found' });
    }
  } catch (error) {
    console.error('Error in rejectItem:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete market item
// @route   DELETE /api/market/:id
// @access  Private/Admin
const deleteItem = async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    const item = await MarketplaceItem.findById(req.params.id);
    if (item) {
        await item.deleteOne();
        res.json({ message: 'Item removed' });
    } else {
        res.status(404).json({ message: 'Item not found' });
    }
  } catch (error) {
    console.error('Error in deleteItem:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getItems, publishItem, getPendingItems, approveItem, rejectItem, deleteItem };