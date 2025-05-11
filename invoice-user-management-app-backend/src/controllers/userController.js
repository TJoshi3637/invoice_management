const User = require("../models/User");
const Group = require("../models/Group");
const bcrypt = require("bcryptjs");
const { generateUserId } = require('../utils/helpers');

// Role creation permissions
const roleCreationRules = {
  SUPER_ADMIN: ['ADMIN'],
  ADMIN: ['UNIT_MANAGER'],
  UNIT_MANAGER: ['USER']
};

// GET /api/users/next-id/:role
exports.getNextUserId = async (req, res) => {
  try {
    const { role } = req.params;
    const nextId = await generateUserId(role);
    res.json({ nextId });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to generate user ID' });
  }
};

// GET /api/users/:userId
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.userId });
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// POST /api/users
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const creator = req.user;

    console.log('Creating user with data:', {
      name,
      email,
      role,
      creatorRole: creator.role,
      creatorId: creator._id,
      timezone: req.body.timezone
    });

    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        msg: 'Please provide all required fields',
        missing: {
          name: !name,
          email: !email,
          password: !password,
          role: !role
        }
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        msg: 'Email already registered',
        email
      });
    }

    // Check if creator has permission to create this role
    if (!creator.canCreateUser(role)) {
      console.log('Permission denied:', {
        creatorRole: creator.role,
        targetRole: role
      });
      return res.status(403).json({
        msg: 'You do not have permission to create a user with this role',
        creatorRole: creator.role,
        targetRole: role
      });
    }

    try {
      // Generate unique user ID
      const userId = await generateUserId(role);
      console.log('Generated userId:', userId);

      // Create new user
      const newUser = new User({
        userId,
        name,
        email,
        password,
        role,
        timezone: req.body.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
      });

      // Save user
      const savedUser = await newUser.save();
      console.log('User created successfully:', {
        userId: savedUser.userId,
        role: savedUser.role
      });

      res.status(201).json({
        msg: 'User created successfully',
        user: {
          userId: savedUser.userId,
          name: savedUser.name,
          email: savedUser.email,
          role: savedUser.role,
          timezone: savedUser.timezone
        }
      });
    } catch (saveError) {
      console.error('Error saving user:', {
        error: saveError.message,
        validationErrors: saveError.errors,
        stack: saveError.stack
      });
      return res.status(400).json({
        msg: 'Error creating user',
        error: saveError.message,
        validationErrors: saveError.errors
      });
    }
  } catch (err) {
    console.error('Error in createUser:', {
      error: err.message,
      stack: err.stack,
      requestBody: req.body
    });
    res.status(500).json({
      msg: 'Server error',
      error: err.message,
      details: err.stack
    });
  }
};

// GET /api/users (with pagination)
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const user = req.user;

    let query = {};

    // Apply role-based filtering
    if (user.role === 'UNIT_MANAGER') {
      query = { role: 'USER' };
    } else if (user.role === 'ADMIN') {
      query = { role: { $in: ['USER', 'UNIT_MANAGER'] } };
    }

    const users = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (err) {
    console.error('Error in getUsers:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// PUT /api/users/:userId
exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    const updater = req.user;

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Check permissions
    if (!updater.canUpdateUser(user)) {
      return res.status(403).json({ msg: 'Not authorized to update this user' });
    }

    // Update user
    Object.keys(updates).forEach(key => {
      if (key !== 'password' && key !== 'role') {
        user[key] = updates[key];
      }
    });

    await user.save();
    res.json({ msg: 'User updated successfully', user });
  } catch (err) {
    console.error('Error in updateUser:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// DELETE /api/users/:userId
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const deleter = req.user;

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Check permissions
    if (!deleter.canDeleteUser(user)) {
      return res.status(403).json({ msg: 'Not authorized to delete this user' });
    }

    await user.remove();
    res.json({ msg: 'User deleted successfully' });
  } catch (err) {
    console.error('Error in deleteUser:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// GET /api/user-groups
exports.getUserGroups = async (req, res) => {
  try {
    const user = req.user;
    const groups = await user.getGroups();
    res.json({ groups });
  } catch (err) {
    console.error('Error in getUserGroups:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};
