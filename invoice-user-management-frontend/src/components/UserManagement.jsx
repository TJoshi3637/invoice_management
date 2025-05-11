import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, message, Space, Popconfirm, Input, Select } from 'antd';
import { EditOutlined, DeleteOutlined, UserAddOutlined } from '@ant-design/icons';
import userService, { USER_ROLES, validateUserCreation } from '../services/userService';
import GroupCreateModal from './GroupCreateModal';

const GROUPS = ['Group1', 'Group2', 'Group3'];

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [groupModalVisible, setGroupModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [editingUser, setEditingUser] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });

    useEffect(() => {
        // Get current user from localStorage
        const user = JSON.parse(localStorage.getItem('user'));
        setCurrentUser(user);
        fetchUsers(1, 10);
    }, []);

    const fetchUsers = async (page, limit) => {
        try {
            setLoading(true);
            const data = await userService.getAllUsers(page, limit);
            setUsers(data.users || []);
            setPagination({
                ...pagination,
                current: page,
                total: data.total || 0
            });
        } catch (error) {
            message.error(error.message || 'Failed to fetch users');
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (values) => {
        try {
            setLoading(true);

            // Validate role permissions
            if (!validateUserCreation(currentUser.role, values.role)) {
                message.error(`${currentUser.role} cannot create users with role ${values.role}`);
                return;
            }

            // Validate required fields
            const requiredFields = ['username', 'email', 'password', 'role'];
            const missingFields = requiredFields.filter(field => !values[field]);

            if (missingFields.length > 0) {
                message.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
                return;
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(values.email)) {
                message.error('Please enter a valid email address');
                return;
            }

            await userService.createUser(values);
            message.success('User created successfully');
            setModalVisible(false);
            form.resetFields();
            fetchUsers(pagination.current, pagination.pageSize);
        } catch (error) {
            message.error(error.message || 'Failed to create user');
            console.error('Error creating user:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateUser = async (values) => {
        try {
            setLoading(true);

            // Validate role update permissions
            if (values.role && !validateUserCreation(currentUser.role, values.role)) {
                message.error(`${currentUser.role} cannot update users to role ${values.role}`);
                return;
            }

            // If password is provided, ensure it meets requirements
            if (values.password && values.password.length < 8) {
                message.error('Password must be at least 8 characters long');
                return;
            }

            // If no password is provided, remove it from the update data
            if (!values.password) {
                delete values.password;
            }

            await userService.updateUser(editingUser.id, values);
            message.success('User updated successfully');
            setModalVisible(false);
            setEditingUser(null);
            form.resetFields();
            fetchUsers(pagination.current, pagination.pageSize);
        } catch (error) {
            message.error(error.message || 'Failed to update user');
            console.error('Error updating user:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        try {
            setLoading(true);
            await userService.deleteUser(userId);
            message.success('User deleted successfully');
            fetchUsers(pagination.current, pagination.pageSize);
        } catch (error) {
            message.error(error.message || 'Failed to delete user');
            console.error('Error deleting user:', error);
        } finally {
            setLoading(false);
        }
    };

    const showModal = (user = null) => {
        setEditingUser(user);
        if (user) {
            form.setFieldsValue({
                username: user.username,
                name: user.name,
                email: user.email,
                role: user.role,
                group: user.group || undefined
            });
        } else {
            form.resetFields();
        }
        setModalVisible(true);
    };

    // Get available roles based on current user's role
    const getAvailableRoles = () => {
        switch (currentUser?.role) {
            case USER_ROLES.SUPER_ADMIN:
                return [USER_ROLES.ADMIN];
            case USER_ROLES.ADMIN:
                return [USER_ROLES.UNIT_MANAGER];
            case USER_ROLES.UNIT_MANAGER:
                return [USER_ROLES.USER];
            default:
                return [];
        }
    };

    const adminAndManagers = users.filter(
        u => u.role === 'ADMIN' || u.role === 'UNIT_MANAGER'
    );

    const columns = [
        {
            title: 'User ID',
            dataIndex: 'userId',
            key: 'userId',
        },
        {
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
        },
        {
            title: 'Group',
            dataIndex: 'group',
            key: 'group',
            render: (group) => group || '-',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space key={`actions-${record.id || record._id}`}>
                    <Button
                        key={`edit-${record.id || record._id}`}
                        icon={<EditOutlined />}
                        onClick={() => showModal(record)}
                        disabled={!validateUserCreation(currentUser?.role, record.role)}
                    >
                        Edit
                    </Button>
                    <Popconfirm
                        key={`delete-${record.id || record._id}`}
                        title="Are you sure you want to delete this user?"
                        onConfirm={() => handleDeleteUser(record.id || record._id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button
                            key={`delete-btn-${record.id || record._id}`}
                            icon={<DeleteOutlined />}
                            danger
                            disabled={!validateUserCreation(currentUser?.role, record.role)}
                        >
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    console.log(users);

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '16px' }}>
                <Button
                    type="primary"
                    icon={<UserAddOutlined />}
                    onClick={() => showModal()}
                    disabled={!currentUser || !getAvailableRoles().length}
                >
                    Add User
                </Button>
                <Button
                    type="dashed"
                    style={{ marginLeft: 8 }}
                    onClick={() => setGroupModalVisible(true)}
                >
                    Create Group
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={users.map(user => ({
                    ...user,
                    userId: user.userId,
                    username: user.username || user.userName,
                    key: user._id
                }))}
                loading={loading}
                rowKey="_id"
                pagination={{
                    ...pagination,
                    onChange: (page, pageSize) => fetchUsers(page, pageSize)
                }}
            />

            <Modal
                title={editingUser ? 'Edit User' : 'Create User'}
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    setEditingUser(null);
                    form.resetFields();
                }}
                footer={null}
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={editingUser ? handleUpdateUser : handleCreateUser}
                    initialValues={editingUser || {}}
                    preserve={false}
                >
                    <Form.Item
                        name="username"
                        label="Username"
                        rules={[
                            { required: true, message: 'Please enter username' },
                            { min: 3, message: 'Username must be at least 3 characters' }
                        ]}
                    >
                        <Input placeholder="Enter username" />
                    </Form.Item>

                    <Form.Item
                        name="name"
                        label="Name"
                        rules={[{ required: true, message: 'Please enter name' }]}
                    >
                        <Input placeholder="Enter name" />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Please enter email' },
                            { type: 'email', message: 'Please enter a valid email' }
                        ]}
                    >
                        <Input placeholder="Enter email" />
                    </Form.Item>

                    {!editingUser ? (
                        <Form.Item
                            name="password"
                            label="Password"
                            rules={[
                                { required: true, message: 'Please enter password' },
                                { min: 8, message: 'Password must be at least 8 characters' }
                            ]}
                        >
                            <Input.Password placeholder="Enter password" />
                        </Form.Item>
                    ) : (
                        <Form.Item
                            name="password"
                            label="Password (leave blank to keep current)"
                            rules={[
                                { min: 8, message: 'Password must be at least 8 characters' }
                            ]}
                        >
                            <Input.Password placeholder="Enter new password (optional)" />
                        </Form.Item>
                    )}

                    <Form.Item
                        name="role"
                        label="Role"
                        rules={[{ required: true, message: 'Please select role' }]}
                    >
                        <Select placeholder="Select role">
                            {getAvailableRoles().map(role => (
                                <Select.Option key={role} value={role}>
                                    {role.replace('_', ' ')}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    {['ADMIN', 'UNIT_MANAGER'].includes(form.getFieldValue('role')) && (
                        <Form.Item
                            name="group"
                            label="Group (optional)"
                        >
                            <Select placeholder="Select group" allowClear>
                                {GROUPS.map(group => (
                                    <Select.Option key={group} value={group}>{group}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    )}

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                {editingUser ? 'Update' : 'Create'}
                            </Button>
                            <Button onClick={() => {
                                setModalVisible(false);
                                setEditingUser(null);
                                form.resetFields();
                            }}>
                                Cancel
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            <GroupCreateModal
                visible={groupModalVisible}
                onClose={() => setGroupModalVisible(false)}
                users={users.filter(u =>
                    (u.role && u.role.toUpperCase() === 'ADMIN') ||
                    (u.role && u.role.toUpperCase() === 'UNIT_MANAGER')
                )}
                onGroupCreated={() => {
                    // Optionally refresh users or groups here
                    // fetchUsers(pagination.current, pagination.pageSize);
                }}
            />
        </div>
    );
};

export default UserManagement;