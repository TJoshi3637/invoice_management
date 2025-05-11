// src/models/User.js

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    required: true,
    enum: ['SUPER_ADMIN', 'ADMIN', 'UNIT_MANAGER', 'USER'],
    default: 'USER'
  },
  group: {
    type: String,
    default: null
  },
  timezone: {
    type: String,
    required: false,
    default: 'UTC',
    validate: {
      validator: function (v) {
        try {
          Intl.DateTimeFormat(undefined, { timeZone: v });
          return true;
        } catch (e) {
          return false;
        }
      },
      message: props => `${props.value} is not a valid timezone`
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  groups: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Pre-save middleware to hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (err) {
    throw err;
  }
};

// Static method to generate user ID
userSchema.statics.generateUserId = async function (role) {
  const prefix = {
    'SUPER_ADMIN': 'SA',
    'ADMIN': 'A',
    'UNIT_MANAGER': 'UM',
    'USER': 'U'
  }[role];

  const lastUser = await this.findOne({ role }).sort({ userId: -1 });
  let sequence = 1;

  if (lastUser) {
    const lastSequence = parseInt(lastUser.userId.substring(2));
    sequence = lastSequence + 1;
  }

  return `${prefix}${sequence}`;
};

// Method to check if user can create another user
userSchema.methods.canCreateUser = function (targetRole) {
  console.log('Checking create permission:', {
    currentRole: this.role,
    targetRole
  });

  switch (this.role) {
    case 'SUPER_ADMIN':
      return true; // Can create any role
    case 'ADMIN':
      return ['USER', 'UNIT_MANAGER'].includes(targetRole);
    case 'UNIT_MANAGER':
      return targetRole === 'USER';
    default:
      return false;
  }
};

// Method to check if user can update another user
userSchema.methods.canUpdateUser = function (targetUser) {
  console.log('Checking update permission:', {
    currentRole: this.role,
    targetRole: targetUser.role
  });

  switch (this.role) {
    case 'SUPER_ADMIN':
      return true;
    case 'ADMIN':
      return ['USER', 'UNIT_MANAGER'].includes(targetUser.role);
    case 'UNIT_MANAGER':
      return targetUser.role === 'USER';
    default:
      return false;
  }
};

// Method to check if user can delete another user
userSchema.methods.canDeleteUser = function (targetUser) {
  console.log('Checking delete permission:', {
    currentRole: this.role,
    targetRole: targetUser.role
  });

  switch (this.role) {
    case 'SUPER_ADMIN':
      return true;
    case 'ADMIN':
      return ['USER', 'UNIT_MANAGER'].includes(targetUser.role);
    case 'UNIT_MANAGER':
      return targetUser.role === 'USER';
    default:
      return false;
  }
};

// Get user's groups
userSchema.methods.getGroups = async function () {
  try {
    await this.populate('groups');
    return this.groups;
  } catch (err) {
    console.error('Error getting user groups:', err);
    throw err;
  }
};

// Add user to group
userSchema.methods.addToGroup = async function (groupId) {
  try {
    if (!this.groups.includes(groupId)) {
      this.groups.push(groupId);
      await this.save();
    }
  } catch (err) {
    console.error('Error adding user to group:', err);
    throw err;
  }
};

// Remove user from group
userSchema.methods.removeFromGroup = async function (groupId) {
  try {
    this.groups = this.groups.filter(g => g.toString() !== groupId.toString());
    await this.save();
  } catch (err) {
    console.error('Error removing user from group:', err);
    throw err;
  }
};

module.exports = mongoose.model("User", userSchema);
