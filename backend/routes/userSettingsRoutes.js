const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');

// @desc    Get user settings
// @route   GET /api/user/settings
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        widgetOrder: user.widgetOrder || [],
        theme: user.theme || 'system',
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update user settings
// @route   PUT /api/user/settings
// @access  Private
router.put('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      if (req.body.widgetOrder) user.widgetOrder = req.body.widgetOrder;
      if (req.body.theme) user.theme = req.body.theme;

      const updatedUser = await user.save();
      res.json({
        widgetOrder: updatedUser.widgetOrder,
        theme: updatedUser.theme,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
