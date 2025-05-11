import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, message, Table, Spin } from 'antd';
import { createUser, getUsers } from '../api/userService';

const { Option } = Select;

const UserManagement = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [tableLoading, setTableLoading] = useState(false);

    const columns = [
        {
            title: 'User ID',
            dataIndex: 'userId',
            key: 'userId',
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
            title: 'Timezone',
            dataIndex: 'timezone',
            key: 'timezone',
        }
    ];

    const fetchUsers = async () => {
        setTableLoading(true);
        try {
            const response = await getUsers();
            // Ensure each user object has a unique key
            const usersWithKeys = (response.users || []).map(user => ({
                ...user,
                key: user.userId // Use userId as the unique key
            }));
            setUsers(usersWithKeys);
        } catch (err) {
            console.error('Error fetching users:', err);
            message.error('Failed to fetch users');
        } finally {
            setTableLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreateUser = async (values) => {
        try {
            setLoading(true);
            // Add timezone to the request data
            const userData = {
                ...values,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            };

            console.log('Submitting user data:', {
                ...userData,
                password: '[REDACTED]'
            });

            await createUser(userData);
            message.success('User created successfully');
            form.resetFields();
            fetchUsers(); // Refresh the user list
        } catch (error) {
            console.error('Error creating user:', {
                message: error.msg,
                validationErrors: error.validationErrors,
                missingFields: error.missing
            });

            // Display specific error message
            if (error.validationErrors) {
                const errorMessages = Object.entries(error.validationErrors)
                    .map(([field, err]) => `${field}: ${err.message}`)
                    .join('\n');
                message.error(`Validation failed: ${errorMessages}`);
            } else if (error.missing) {
                const missingFields = Object.entries(error.missing)
                    .filter(([_, isMissing]) => isMissing)
                    .map(([field]) => field)
                    .join(', ');
                message.error(`Missing required fields: ${missingFields}`);
            } else {
                message.error(error.msg || 'Failed to create user');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Create User Form */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="p-8">
                        <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">Create New User</div>
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleCreateUser}
                            className="mt-4 space-y-4"
                        >
                            <Form.Item
                                name="name"
                                label="Name"
                                rules={[{ required: true, message: 'Please enter name' }]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[
                                    { required: true, message: 'Please enter email' },
                                    { type: 'email', message: 'Please enter a valid email' }
                                ]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                name="password"
                                label="Password"
                                rules={[
                                    { required: true, message: 'Please enter password' },
                                    { min: 6, message: 'Password must be at least 6 characters' }
                                ]}
                            >
                                <Input.Password />
                            </Form.Item>

                            <Form.Item
                                name="role"
                                label="Role"
                                rules={[{ required: true, message: 'Please select role' }]}
                                initialValue="USER"
                            >
                                <Select>
                                    <Option value="USER">User</Option>
                                    <Option value="UNIT_MANAGER">Unit Manager</Option>
                                    <Option value="ADMIN">Admin</Option>
                                    <Option value="SUPER_ADMIN">Super Admin</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="timezone"
                                label="Timezone"
                                initialValue={Intl.DateTimeFormat().resolvedOptions().timeZone}
                                rules={[{ required: true, message: 'Please select timezone' }]}
                            >
                                <Select>
                                    <Option value="UTC">UTC</Option>
                                    <Option value="America/New_York">Eastern Time</Option>
                                    <Option value="America/Chicago">Central Time</Option>
                                    <Option value="America/Denver">Mountain Time</Option>
                                    <Option value="America/Los_Angeles">Pacific Time</Option>
                                    <Option value="Asia/Kolkata">India Standard Time</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    className="w-full"
                                >
                                    Create User
                                </Button>
                            </Form.Item>
                        </Form>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="p-8">
                        <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold mb-4">User List</div>
                        <Spin spinning={tableLoading}>
                            <Table
                                dataSource={users}
                                columns={columns}
                                rowKey="userId"
                                pagination={{
                                    pageSize: 10,
                                    showSizeChanger: true,
                                    showTotal: (total) => `Total ${total} users`
                                }}
                            />
                        </Spin>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserManagement; 