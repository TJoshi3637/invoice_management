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
    const { name, email, password, role, username } = req.body;
    const creator = req.user;

    console.log('Creating user with data:', {
      name,
      email,
      username,
      role,
      creatorRole: creator.role,
      creatorId: creator._id,
      timezone: req.body.timezone
    });

    // Validate required fields
    if (!name || !email || !password || !role || !username) {
      return res.status(400).json({
        msg: 'Please provide all required fields',
        missing: {
          name: !name,
          email: !email,
          password: !password,
          role: !role,
          username: !username
        }
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({
      $or: [
        { email },
        { username }
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        msg: existingUser.email === email ? 'Email already registered' : 'Username already taken',
        field: existingUser.email === email ? 'email' : 'username'
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
        username,
        name,
        email,
        password,
        role,
        createdBy: creator._id,
        timezone: req.body.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
      });

      // Save user
      const savedUser = await newUser.save();
      console.log('User created successfully:', {
        userId: savedUser.userId,
        username: savedUser.username,
        role: savedUser.role
      });

      // Update group visibility if needed
      if (creator.role === 'ADMIN' && role === 'UNIT_MANAGER') {
        const adminGroup = await Group.findOne({ _id: creator.adminGroup });
        if (adminGroup) {
          await adminGroup.addVisibleUnitManager(savedUser._id);
        }
      } else if (creator.role === 'UNIT_MANAGER' && role === 'USER') {
        const unitManagerGroup = await Group.findOne({ _id: creator.unitManagerGroup });
        if (unitManagerGroup) {
          await unitManagerGroup.addVisibleUser(savedUser._id);
        }
      }

      res.status(201).json({
        msg: 'User created successfully',
        user: {
          userId: savedUser.userId,
          username: savedUser.username,
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

// GET /api/users (with pagination and group-based visibility)
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const user = req.user;

    let query = {};

    // Group-based filtering
    if (user.role === 'SUPER_ADMIN') {
      // Super Admin can see all users
      query = {};
    } else if (user.role === 'ADMIN') {
      // Admin can see users in the same group(s)
      if (user.groups && user.groups.length > 0) {
        query = {
          groups: { $in: user.groups },
          role: { $in: ['UNIT_MANAGER', 'USER'] }
        };
      } else {
        // If not in any group, see only users they created
        query = { createdBy: user._id, role: { $in: ['UNIT_MANAGER', 'USER'] } };
      }
    } else if (user.role === 'UNIT_MANAGER') {
      if (user.groups && user.groups.length > 0) {
        // Find all unit managers in the same group(s)
        const groups = await Group.find({ _id: { $in: user.groups } }).populate('members');
        const allUnitManagerIds = groups.flatMap(g => g.members.map(m => m._id.toString()));
        query = {
          role: 'USER',
          createdBy: { $in: allUnitManagerIds }
        };
      } else {
        query = { createdBy: user._id, role: 'USER' };
      }
    } else {
      // Regular users can only see themselves
      query = { _id: user._id };
    }

    const users = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'userId name email role')
      .populate('groups', 'name type')
      .lean();

    console.log(users);

    const usersWithStringId = users.map(u => ({
      ...u,
      _id: u._id.toString()
    }));

    const count = await User.countDocuments(query);

    res.json({
      users: usersWithStringId,
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

    console.log('Updating user:', {
      userId,
      updates,
      updaterRole: updater.role
    });

    const user = await User.findOne({ userId });
    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({ msg: 'User not found' });
    }

    // Check permissions
    if (!updater.canUpdateUser(user)) {
      console.log('Permission denied:', {
        updaterRole: updater.role,
        targetRole: user.role
      });
      return res.status(403).json({
        msg: 'Not authorized to update this user',
        details: {
          updaterRole: updater.role,
          targetRole: user.role
        }
      });
    }

    // Update user
    const allowedUpdates = ['name', 'email', 'timezone', 'username', 'groups'];
    const filteredUpdates = {};

    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    // Handle group updates separately
    if (updates.groups) {
      // Validate group IDs
      const validGroups = await Group.find({ _id: { $in: updates.groups } });
      if (validGroups.length !== updates.groups.length) {
        return res.status(400).json({
          msg: 'One or more invalid group IDs provided',
          invalidGroups: updates.groups.filter(groupId =>
            !validGroups.some(g => g._id.toString() === groupId.toString())
          )
        });
      }
      user.groups = updates.groups;
    }

    // Apply other updates
    Object.assign(user, filteredUpdates);

    // Save changes
    await user.save();

    console.log('User updated successfully:', {
      userId: user.userId,
      updatedFields: Object.keys(filteredUpdates)
    });

    // Populate groups in response
    await user.populate('groups', 'name type');

    res.json({
      msg: 'User updated successfully',
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        timezone: user.timezone,
        groups: user.groups
      }
    });
  } catch (err) {
    console.error('Error in updateUser:', {
      error: err.message,
      stack: err.stack,
      requestBody: req.body
    });
    res.status(500).json({
      msg: 'Server error',
      error: err.message
    });
  }
};

// DELETE /api/users/:userId
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const deleter = req.user;

    console.log('Attempting to delete user:', {
      targetUserId: userId,
      deleterRole: deleter.role,
      deleterId: deleter._id
    });

    const user = await User.findOne({ userId });
    if (!user) {
      console.log('User not found for deletion:', userId);
      return res.status(404).json({
        msg: 'User not found',
        userId
      });
    }

    // Check permissions
    if (!deleter.canDeleteUser(user)) {
      console.log('Permission denied for deletion:', {
        deleterRole: deleter.role,
        targetRole: user.role
      });
      return res.status(403).json({
        msg: 'Not authorized to delete this user',
        details: {
          deleterRole: deleter.role,
          targetRole: user.role
        }
      });
    }

    // Remove user from groups
    if (user.adminGroup) {
      const adminGroup = await Group.findById(user.adminGroup);
      if (adminGroup) {
        await adminGroup.removeMember(user._id);
      }
    }
    if (user.unitManagerGroup) {
      const unitManagerGroup = await Group.findById(user.unitManagerGroup);
      if (unitManagerGroup) {
        await unitManagerGroup.removeMember(user._id);
      }
    }

    // Delete the user
    await User.deleteOne({ _id: user._id });

    console.log('User deleted successfully:', {
      userId: user.userId,
      role: user.role
    });

    res.json({
      msg: 'User deleted successfully',
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Error in deleteUser:', {
      error: err.message,
      stack: err.stack,
      userId: req.params.userId
    });
    res.status(500).json({
      msg: 'Server error',
      error: err.message
    });
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
