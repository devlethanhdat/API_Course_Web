import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Popconfirm } from 'antd';
import agent from '../../../actions/agent';

const { Option } = Select;

const UserAdmin = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    const data = await agent.Admin.getUsers();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    await agent.Admin.deleteUser(id);
    message.success('User deleted');
    fetchUsers();
  };

  const handleModalOk = async (values: any) => {
    if (editingUser) {
      await agent.Admin.updateUser(editingUser.id, values);
      message.success('User updated');
    } else {
      await agent.Admin.createUser(values);
      message.success('User created');
    }
    setModalVisible(false);
    setEditingUser(null);
    fetchUsers();
  };

  return (
    <div>
      <Button type="primary" onClick={() => { setEditingUser(null); setModalVisible(true); }} style={{ marginBottom: 16 }}>
        Add User
      </Button>
      <Table
        dataSource={users}
        rowKey="id"
        loading={loading}
        columns={[
          { title: 'Username', dataIndex: 'userName' },
          { title: 'Email', dataIndex: 'email' },
          { title: 'Roles', dataIndex: 'roles', render: (roles: string[]) => roles.join(', ') },
          {
            title: 'Actions',
            render: (_, user) => (
              <>
                <Button onClick={() => handleEdit(user)} style={{ marginRight: 8 }}>Edit</Button>
                <Popconfirm title="Delete user?" onConfirm={() => handleDelete(user.id)}>
                  <Button danger>Delete</Button>
                </Popconfirm>
              </>
            )
          }
        ]}
      />
      <Modal
        title={editingUser ? 'Edit User' : 'Add User'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form
          initialValues={editingUser || { roles: ['Student'] }}
          onFinish={handleModalOk}
          layout="vertical"
        >
          <Form.Item name="userName" label="Username" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          {!editingUser && (
            <Form.Item name="password" label="Password" rules={[{ required: true, min: 6 }]}>
              <Input.Password />
            </Form.Item>
          )}
          <Form.Item name="roles" label="Roles" rules={[{ required: true }]}>
            <Select mode="multiple">
              <Option value="Student">Student</Option>
              <Option value="Instructor">Instructor</Option>
              <Option value="Admin">Admin</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {editingUser ? 'Update' : 'Create'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserAdmin;
