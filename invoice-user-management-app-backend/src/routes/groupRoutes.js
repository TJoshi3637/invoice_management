const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const authMiddleware = require('../middlewares/authMiddleware');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Create a new group
router.post('/', groupController.createGroup);

// Get all groups (filtered by user role)
router.get('/', groupController.getGroups);

// Update a group
router.put('/:groupId', groupController.updateGroup);

// Delete a group
router.delete('/:groupId', groupController.deleteGroup);

// Add member to group
router.post('/:groupId/members', groupController.addMember);

// Remove member from group
router.delete('/:groupId/members/:userId', groupController.removeMember);

// Get visible users for a group
router.get('/:groupId/visible-users', groupController.getVisibleUsers);

module.exports = router; 