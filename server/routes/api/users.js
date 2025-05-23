import express from 'express';
import User from '../../models/User.js';
import { authenticate, authorize } from '../../middleware/auth.js';

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (admin only), with pagination, search, and status filter
// @access  Private/Admin
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status, role, sort = '-createdAt' } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) query.status = status;
    if (role) query.role = role;
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort(sort)
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));
    res.json({ users, total });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

<<<<<<< HEAD:server/routes/users.js
// @route   POST /api/users
// @desc    Create a new user (admin only)
// @access  Private/Admin
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'Email already exists.' });
    }
    const user = new User({ name, email, password, role });
    await user.save();
    const userObj = user.toObject();
    delete userObj.password;
    res.json(userObj);
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/:id
// @desc    Update a user (admin only)
// @access  Private/Admin
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { name, email, password, role, status } = req.body;
    const update = { name, email, role, status };
    if (password) {
      const bcrypt = require('bcryptjs');
      update.password = await bcrypt.hash(password, 10);
    }
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete a user (admin only)
// @access  Private/Admin
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ message: 'You cannot delete yourself.' });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
=======
export default router;
>>>>>>> main:server/routes/api/users.js
