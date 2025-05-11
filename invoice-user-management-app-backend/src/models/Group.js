const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['ADMIN', 'UNIT_MANAGER'],
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    trim: true
  },
  // For Admin groups to track which Unit Managers they can see
  visibleUnitManagers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // For Unit Manager groups to track which Users they can see
  visibleUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { timestamps: true });

// Pre-save middleware to validate group type based on creator's role
groupSchema.pre('save', async function (next) {
  try {
    const creator = await mongoose.model('User').findById(this.createdBy);

    if (!creator) {
      throw new Error('Creator not found');
    }

    if (this.type === 'ADMIN' && creator.role !== 'SUPER_ADMIN') {
      throw new Error('Only Super Admin can create admin groups');
    }

    if (this.type === 'UNIT_MANAGER' && creator.role !== 'ADMIN') {
      throw new Error('Only Admin can create unit manager groups');
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Method to add a member to the group
groupSchema.methods.addMember = async function (userId) {
  if (!this.members.includes(userId)) {
    this.members.push(userId);
    await this.save();
  }
};

// Method to remove a member from the group
groupSchema.methods.removeMember = async function (userId) {
  this.members = this.members.filter(member => member.toString() !== userId.toString());
  await this.save();
};

// Method to check if a user is a member of the group
groupSchema.methods.hasMember = function (userId) {
  return this.members.some(member => member.toString() === userId.toString());
};

// Method to add visible users/unit managers
groupSchema.methods.addVisibleUser = async function (userId) {
  if (!this.visibleUsers.includes(userId)) {
    this.visibleUsers.push(userId);
    await this.save();
  }
};

groupSchema.methods.addVisibleUnitManager = async function (unitManagerId) {
  if (!this.visibleUnitManagers.includes(unitManagerId)) {
    this.visibleUnitManagers.push(unitManagerId);
    await this.save();
  }
};

// Method to get all visible users for an admin group
groupSchema.methods.getVisibleUsers = async function () {
  await this.populate('visibleUnitManagers');
  const unitManagerIds = this.visibleUnitManagers.map(um => um._id);

  const User = mongoose.model('User');
  return await User.find({
    createdBy: { $in: unitManagerIds },
    role: 'USER'
  });
};

// Method to get all visible users for a unit manager group
groupSchema.methods.getVisibleUsersForUnitManager = async function () {
  await this.populate('members');
  const memberIds = this.members.map(member => member._id);

  const User = mongoose.model('User');
  return await User.find({
    createdBy: { $in: memberIds },
    role: 'USER'
  });
};

const Group = mongoose.model('Group', groupSchema);

module.exports = Group;