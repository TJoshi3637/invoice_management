const Group = require("../models/Group");
const User = require("../models/User");

// POST /api/groups
exports.createGroup = async (req, res) => {
    try {
        const { name, type, members, description } = req.body;
        const creator = req.user;

        // Validate creator's role
        if (type === 'ADMIN' && creator.role !== 'SUPER_ADMIN') {
            return res.status(403).json({
                msg: 'Only Super Admin can create admin groups'
            });
        }

        if (type === 'UNIT_MANAGER' && creator.role !== 'ADMIN') {
            return res.status(403).json({
                msg: 'Only Admin can create unit manager groups'
            });
        }

        // Create new group
        const newGroup = new Group({
            name,
            type,
            members,
            description,
            createdBy: creator._id
        });

        await newGroup.save();

        // Update users with group reference
        if (members && members.length > 0) {
            await User.updateMany(
                { _id: { $in: members } },
                { $set: { [type === 'ADMIN' ? 'adminGroup' : 'unitManagerGroup']: newGroup._id } }
            );
        }

        res.status(201).json({
            msg: 'Group created successfully',
            group: newGroup
        });
    } catch (err) {
        console.error("Error creating group:", err);
        res.status(500).json({ msg: err.message || 'Server error' });
    }
};

// GET /api/groups
exports.getGroups = async (req, res) => {
    try {
        const currentUser = req.user;
        let query = { isActive: true };

        // Filter groups based on user role
        if (currentUser.role === 'SUPER_ADMIN') {
            query.type = 'ADMIN';
        } else if (currentUser.role === 'ADMIN') {
            query.type = 'UNIT_MANAGER';
        } else {
            return res.status(403).json({
                msg: 'You do not have permission to view groups'
            });
        }

        const groups = await Group.find(query)
            .populate('members', 'userId name email role')
            .populate('createdBy', 'userId name email role')
            .populate('visibleUnitManagers', 'userId name email role')
            .populate('visibleUsers', 'userId name email role');

        res.json(groups);
    } catch (err) {
        console.error("Error fetching groups:", err);
        res.status(500).json({ msg: 'Server error' });
    }
};

// PUT /api/groups/:groupId
exports.updateGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { name, members, description } = req.body;
        const currentUser = req.user;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ msg: 'Group not found' });
        }

        // Check permissions
        if (group.type === 'ADMIN' && currentUser.role !== 'SUPER_ADMIN') {
            return res.status(403).json({
                msg: 'Only Super Admin can update admin groups'
            });
        }

        if (group.type === 'UNIT_MANAGER' && currentUser.role !== 'ADMIN') {
            return res.status(403).json({
                msg: 'Only Admin can update unit manager groups'
            });
        }

        // Update group
        if (name) group.name = name;
        if (description) group.description = description;

        if (members) {
            // Remove old members
            const oldMembers = group.members;
            await User.updateMany(
                { _id: { $in: oldMembers } },
                { $unset: { [group.type === 'ADMIN' ? 'adminGroup' : 'unitManagerGroup']: 1 } }
            );

            // Add new members
            group.members = members;
            await User.updateMany(
                { _id: { $in: members } },
                { $set: { [group.type === 'ADMIN' ? 'adminGroup' : 'unitManagerGroup']: group._id } }
            );
        }

        await group.save();

        res.json({
            msg: 'Group updated successfully',
            group
        });
    } catch (err) {
        console.error("Error updating group:", err);
        res.status(500).json({ msg: 'Server error' });
    }
};

// DELETE /api/groups/:groupId
exports.deleteGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const currentUser = req.user;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ msg: 'Group not found' });
        }

        // Check permissions
        if (group.type === 'ADMIN' && currentUser.role !== 'SUPER_ADMIN') {
            return res.status(403).json({
                msg: 'Only Super Admin can delete admin groups'
            });
        }

        if (group.type === 'UNIT_MANAGER' && currentUser.role !== 'ADMIN') {
            return res.status(403).json({
                msg: 'Only Admin can delete unit manager groups'
            });
        }

        // Remove group reference from members
        await User.updateMany(
            { _id: { $in: group.members } },
            { $unset: { [group.type === 'ADMIN' ? 'adminGroup' : 'unitManagerGroup']: 1 } }
        );

        // Soft delete the group
        group.isActive = false;
        await group.save();

        res.json({ msg: 'Group deleted successfully' });
    } catch (err) {
        console.error("Error deleting group:", err);
        res.status(500).json({ msg: 'Server error' });
    }
};

// POST /api/groups/:groupId/members
exports.addMember = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId } = req.body;
        const currentUser = req.user;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ msg: 'Group not found' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Validate user role matches group type
        if (group.type === 'ADMIN' && user.role !== 'ADMIN') {
            return res.status(400).json({ msg: 'Only Admin users can be added to Admin groups' });
        }
        if (group.type === 'UNIT_MANAGER' && user.role !== 'UNIT_MANAGER') {
            return res.status(400).json({ msg: 'Only Unit Manager users can be added to Unit Manager groups' });
        }

        await group.addMember(userId);
        await user.save();

        res.json({ msg: 'Member added successfully', group });
    } catch (err) {
        console.error("Error adding member:", err);
        res.status(500).json({ msg: 'Server error' });
    }
};

// DELETE /api/groups/:groupId/members/:userId
exports.removeMember = async (req, res) => {
    try {
        const { groupId, userId } = req.params;
        const currentUser = req.user;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ msg: 'Group not found' });
        }

        await group.removeMember(userId);

        // Remove group reference from user
        const user = await User.findById(userId);
        if (user) {
            if (group.type === 'ADMIN') {
                user.adminGroup = undefined;
            } else {
                user.unitManagerGroup = undefined;
            }
            await user.save();
        }

        res.json({ msg: 'Member removed successfully', group });
    } catch (err) {
        console.error("Error removing member:", err);
        res.status(500).json({ msg: 'Server error' });
    }
};

// GET /api/groups/:groupId/visible-users
exports.getVisibleUsers = async (req, res) => {
    try {
        const { groupId } = req.params;
        const currentUser = req.user;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ msg: 'Group not found' });
        }

        let visibleUsers;
        if (group.type === 'ADMIN') {
            visibleUsers = await group.getVisibleUsers();
        } else {
            visibleUsers = await group.getVisibleUsersForUnitManager();
        }

        res.json({ visibleUsers });
    } catch (err) {
        console.error("Error getting visible users:", err);
        res.status(500).json({ msg: 'Server error' });
    }
}; 