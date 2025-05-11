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
  permissions: {
    createUsers: { type: Boolean, default: false },
    deleteUsers: { type: Boolean, default: false },
    editUsers: { type: Boolean, default: false },
    viewAllUsers: { type: Boolean, default: false },
    manageRoles: { type: Boolean, default: false },
    systemSettings: { type: Boolean, default: false }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Pre-save middleware to ensure PRIMARY_ADMIN_GROUP always has all permissions
groupSchema.pre('save', function (next) {
  if (this.name === 'PRIMARY_ADMIN_GROUP') {
    Object.keys(this.permissions).forEach(key => {
      this.permissions[key] = true;
    });
  }
  next();
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

const Group = mongoose.model('Group', groupSchema);

module.exports = Group;