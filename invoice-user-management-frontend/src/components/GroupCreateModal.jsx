import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, message, Spin } from 'antd';
import api from '../services/api'; // your axios instance

const GroupCreateModal = ({ visible, onClose, onGroupCreated }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [groupType, setGroupType] = useState();
    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);

    useEffect(() => {
        if (visible) {
            setUsersLoading(true);
            api.get('/users')
                .then(res => {
                    // Support both array and object with .users
                    const userList = Array.isArray(res.data) ? res.data : res.data.users || [];
                    setUsers(userList);
                })
                .catch(() => setUsers([]))
                .finally(() => setUsersLoading(false));
        } else {
            setUsers([]);
        }
    }, [visible]);

    const handleCreate = async (values) => {
        setLoading(true);
        try {
            await api.post('/groups', values);
            message.success('Group created!');
            onGroupCreated && onGroupCreated();
            onClose();
            form.resetFields();
            setGroupType(undefined);
        } catch (err) {
            message.error('Failed to create group');
        } finally {
            setLoading(false);
        }
    };

    // Filter users based on groupType selection
    const filteredUsers = groupType
        ? users.filter(u => u.role && u.role.toUpperCase() === groupType)
        : users;

    return (
        <Modal
            title="Create Group"
            open={visible}
            onCancel={() => {
                onClose();
                setGroupType(undefined);
                form.resetFields();
            }}
            footer={null}
            destroyOnClose
        >
            <Form form={form} layout="vertical" onFinish={handleCreate}>
                <Form.Item name="name" label="Group Name" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="type" label="Group Type" rules={[{ required: true }]}>
                    <Select
                        placeholder="Select group type"
                        onChange={val => {
                            setGroupType(val);
                            form.setFieldsValue({ members: [] });
                        }}
                    >
                        <Select.Option value="ADMIN">Admin</Select.Option>
                        <Select.Option value="UNIT_MANAGER">Unit Manager</Select.Option>
                    </Select>
                </Form.Item>
                <Form.Item name="members" label="Members" rules={[{ required: true }]}>
                    {usersLoading ? (
                        <Spin />
                    ) : (
                        <Select
                            mode="multiple"
                            showSearch
                            placeholder="Select members by name"
                            notFoundContent={groupType ? "No users available for this group type" : "Please select a group type"}
                            filterOption={(input, option) =>
                                option.label && option.label.toLowerCase().includes(input.toLowerCase())
                            }
                        >
                            {filteredUsers.map(u => (
                                <Select.Option
                                    key={u._id}
                                    value={u._id}
                                    label={`${u.name} (${u.role})`}
                                >
                                    {u.name} ({u.role})
                                </Select.Option>
                            ))}
                        </Select>
                    )}
                </Form.Item>
                <Form.Item name="description" label="Description">
                    <Input.TextArea />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Create Group
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default GroupCreateModal;
