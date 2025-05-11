import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, message, Table, Modal, Spin } from 'antd';
import { getUsers } from '../api/userService';
import { createGroup, getGroups } from '../api/groupService';

const { Option } = Select;

const GroupManagement = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [groups, setGroups] = useState([]);
    const [users, setUsers] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [tableLoading, setTableLoading] = useState(false);

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
        },
        {
            title: 'Members',
            dataIndex: 'members',
            key: 'members',
            render: (members) => (
                <span>{members?.length || 0} members</span>
            ),
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
        }
    ];

    const fetchGroups = async () => {
        setTableLoading(true);
        try {
            const response = await getGroups();
            setGroups(response);
        } catch (error) {
            console.error('Error fetching groups:', error);
            message.error('Failed to fetch groups');
        } finally {
            setTableLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await getUsers(1, 100); // Fetch first 100 users
            setUsers(response.users || []);
        } catch (error) {
            console.error('Error fetching users:', error);
            message.error('Failed to fetch users');
        }
    };

    useEffect(() => {
        fetchGroups();
        fetchUsers();
    }, []);

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    const handleCreateGroup = async (values) => {
        try {
            setLoading(true);
            await createGroup(values);
            message.success('Group created successfully');
            setIsModalVisible(false);
            form.resetFields();
            fetchGroups(); // Refresh the groups list
        } catch (error) {
            console.error('Error creating group:', error);
            message.error(error.msg || 'Failed to create group');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Group Management</h1>
                    <Button type="primary" onClick={showModal}>
                        Create Group
                    </Button>
                </div>

                {/* Groups Table */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="p-8">
                        <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold mb-4">Group List</div>
                        <Spin spinning={tableLoading}>
                            <Table
                                dataSource={groups}
                                columns={columns}
                                rowKey="_id"
                            />
                        </Spin>
                    </div>
                </div>

                {/* Create Group Modal */}
                <Modal
                    title="Create New Group"
                    open={isModalVisible}
                    onCancel={handleCancel}
                    footer={null}
                >
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleCreateGroup}
                    >
                        <Form.Item
                            name="name"
                            label="Group Name"
                            rules={[{ required: true, message: 'Please enter group name' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            name="type"
                            label="Group Type"
                            rules={[{ required: true, message: 'Please select group type' }]}
                        >
                            <Select>
                                <Option value="ADMIN">Admin Group</Option>
                                <Option value="UNIT_MANAGER">Unit Manager Group</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="members"
                            label="Group Members"
                            rules={[{ required: true, message: 'Please select at least one member' }]}
                        >
                            <Select
                                mode="multiple"
                                placeholder="Select members"
                                optionFilterProp="children"
                            >
                                {users.map(user => (
                                    <Option key={user._id} value={user._id}>
                                        {user.name} ({user.role})
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="description"
                            label="Description"
                        >
                            <Input.TextArea rows={4} />
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                className="w-full"
                            >
                                Create Group
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </div>
    );
};

export default GroupManagement; 