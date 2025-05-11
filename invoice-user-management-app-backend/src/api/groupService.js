import api from './api';
import { API_CONFIG } from '../config/apiConfig';

// Create a new group
export const createGroup = async (groupData) => {
    try {
        const response = await api.post(API_CONFIG.GROUPS.CREATE, groupData);
        return response.data;
    } catch (error) {
        console.error('Error creating group:', error);
        throw error.response?.data || { msg: 'Failed to create group' };
    }
};

// Get all groups
export const getGroups = async () => {
    try {
        const response = await api.get(API_CONFIG.GROUPS.LIST);
        return response.data;
    } catch (error) {
        console.error('Error fetching groups:', error);
        throw error.response?.data || { msg: 'Failed to fetch groups' };
    }
};

// Update a group
export const updateGroup = async (groupId, groupData) => {
    try {
        const response = await api.put(API_CONFIG.GROUPS.UPDATE.replace(':groupId', groupId), groupData);
        return response.data;
    } catch (error) {
        console.error('Error updating group:', error);
        throw error.response?.data || { msg: 'Failed to update group' };
    }
};

// Delete a group
export const deleteGroup = async (groupId) => {
    try {
        const response = await api.delete(API_CONFIG.GROUPS.DELETE.replace(':groupId', groupId));
        return response.data;
    } catch (error) {
        console.error('Error deleting group:', error);
        throw error.response?.data || { msg: 'Failed to delete group' };
    }
};

// Add member to group
export const addMember = async (groupId, userId) => {
    try {
        const response = await api.post(`${API_CONFIG.GROUPS.LIST}/${groupId}/members`, { userId });
        return response.data;
    } catch (error) {
        console.error('Error adding member:', error);
        throw error.response?.data || { msg: 'Failed to add member' };
    }
};

// Remove member from group
export const removeMember = async (groupId, userId) => {
    try {
        const response = await api.delete(`${API_CONFIG.GROUPS.LIST}/${groupId}/members/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error removing member:', error);
        throw error.response?.data || { msg: 'Failed to remove member' };
    }
}; 