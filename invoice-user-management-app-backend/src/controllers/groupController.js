const Group = require("../models/Group");
const User = require("../models/User");

// POST /api/groups
exports.createGroup = async (req, res) => {
    try {
        const { name, type, members } = req.body;
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
        res.status(500).json({ msg: 'Server error' });
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
            .populate('createdBy', 'userId name email role');

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
        const { name, members } = req.body;
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