import React, { useState, useEffect } from 'react';
import { Card, Tabs, Table, Button, Modal, Form, Input, Select, message, Popconfirm, Space, Drawer, Descriptions, Tag } from 'antd';
import { UserOutlined, FileTextOutlined, PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import AdminUserService from '../../services/AdminUserService';
import TestService from '../../services/TestService';
import './AdminDashboard.css';

const { TabPane } = Tabs;
const { Option } = Select;

function AdminDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [tests, setTests] = useState([]);
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewUserDrawer, setViewUserDrawer] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [stats, setStats] = useState({
    totalUsers: 0,
    adminCount: 0,
    parentCount: 0,
    studentCount: 0
  });
  const [form] = Form.useForm();

  useEffect(() => {
    loadUsers();
    loadTests();
    loadStats();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await AdminUserService.getAllUsers();
      setUsers(response);
      
      // Calculate stats from users data
      const totalUsers = response.length;
      const adminCount = response.filter(u => u.role === 'ADMIN').length;
      const parentCount = response.filter(u => u.role === 'PARENT').length;
      const studentCount = response.filter(u => u.role === 'STUDENT').length;
      
      setStats({
        totalUsers,
        adminCount,
        parentCount,
        studentCount
      });
    } catch (error) {
      message.error('Failed to load users');
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // This can be used for additional stats from API if available
      console.log('Loading additional stats...');
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadTests = async () => {
    try {
      const response = await TestService.getAllTests();
      setTests(response);
    } catch (error) {
      message.error('Failed to load tests');
      console.error('Error loading tests:', error);
    }
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    form.resetFields();
    setUserModalVisible(true);
  };

  const handleEditUser = (record) => {
    console.log('Editing user:', record);
    setEditingUser(record);
    // Use setTimeout to ensure the form is ready before setting values
    setTimeout(() => {
      const formValues = {
        fullname: record.fullname || '',
        email: record.email || '',
        phone: record.phone || '',
        role: record.role || ''
      };
      console.log('Setting form values:', formValues);
      form.setFieldsValue(formValues);
    }, 0);
    setUserModalVisible(true);
  };

  const handleDeleteUser = async (userId) => {
    try {
      await AdminUserService.deleteUser(userId);
      message.success('User deleted successfully');
      loadUsers();
    } catch (error) {
      message.error('Failed to delete user');
      console.error('Error deleting user:', error);
    }
  };

  const handleViewUser = async (userId) => {
    try {
      setLoading(true);
      const user = await AdminUserService.getUserById(userId);
      setSelectedUser(user);
      setViewUserDrawer(true);
    } catch (error) {
      message.error('Failed to load user details');
      console.error('Error loading user details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitUser = async (values) => {
    try {
      setLoading(true);
      
      // Validate phone number format (Vietnamese phone numbers)
      const phoneRegex = /^(84|0[3|5|7|8|9])(\d{8})$/;
      if (values.phone && !phoneRegex.test(values.phone)) {
        message.error('Please enter a valid Vietnamese phone number');
        return;
      }

      // Validate password strength for new users
      if (!editingUser && values.password) {
        if (values.password.length < 6) {
          message.error('Password must be at least 6 characters long');
          return;
        }
      }

      if (editingUser) {
        // Update existing user - sending the same format as successful Swagger test
        const updateData = {
          fullname: values.fullname,
          username: values.fullname, // Add username field
          phone: values.phone,
          email: editingUser.email // Include email from existing user
        };
        console.log('Updating user with data:', updateData);
        console.log('User ID:', editingUser.id);
        await AdminUserService.updateUser(editingUser.id, updateData);
        message.success('User updated successfully');
      } else {
        // Create new user
        await AdminUserService.createUser(values);
        message.success('User created successfully');
      }
      
      setUserModalVisible(false);
      form.resetFields();
      loadUsers();
    } catch (error) {
      const errorMessage = error.message || (editingUser ? 'Failed to update user' : 'Failed to create user');
      message.error(errorMessage);
      console.error('Error saving user:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search text and role filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchText || 
      (user.fullname && user.fullname.toLowerCase().includes(searchText.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchText.toLowerCase())) ||
      (user.phone && user.phone.includes(searchText));
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const userColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70,
    },
    {
      title: 'Full Name',
      dataIndex: 'fullname',
      key: 'fullname',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <span className={`role-tag role-${role ? role.toLowerCase() : 'unknown'}`}>
          {role || 'Unknown'}
        </span>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'createAt',
      key: 'createAt',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="default"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewUser(record.id)}
            className="action-btn view-btn"
          >
            View
          </Button>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditUser(record)}
            className="action-btn edit-btn"
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this user?"
            onConfirm={() => handleDeleteUser(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="primary"
              danger
              size="small"
              icon={<DeleteOutlined />}
              className="action-btn delete-btn"
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const testColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70,
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Created At',
      dataIndex: 'createAt',
      key: 'createAt',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Creator',
      dataIndex: 'user',
      key: 'user',
      render: (user) => user?.name || 'System',
    },
  ];

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome back, {user?.fullname || user?.username || user?.email}</p>
      </div>

      <div className="admin-content">
        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-number">{stats.totalUsers}</div>
            <div className="stat-label">Total Users</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{stats.adminCount}</div>
            <div className="stat-label">Administrators</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{stats.parentCount}</div>
            <div className="stat-label">Parents</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{stats.studentCount}</div>
            <div className="stat-label">Students</div>
          </div>
        </div>

        <Tabs defaultActiveKey="users" className="admin-tabs">
          <TabPane
            tab={
              <span>
                <UserOutlined />
                User Management
              </span>
            }
            key="users"
          >
            <Card className="admin-card">
              <div className="table-header">
                <h2>All Users</h2>
                <Space>
                  <Input
                    placeholder="Search users..."
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ width: 250 }}
                  />
                  <Select
                    value={roleFilter}
                    onChange={setRoleFilter}
                    style={{ width: 120 }}
                  >
                    <Select.Option value="all">All Roles</Select.Option>
                    <Select.Option value="ADMIN">Admin</Select.Option>
                    <Select.Option value="PARENT">Parent</Select.Option>
                    <Select.Option value="STUDENT">Student</Select.Option>
                  </Select>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreateUser}
                    className="create-user-btn-small"
                  >
                    Create User
                  </Button>
                </Space>
              </div>
              <Table
                columns={userColumns}
                dataSource={filteredUsers}
                rowKey="id"
                loading={loading}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => 
                    `${range[0]}-${range[1]} of ${total} users`,
                }}
              />
            </Card>
          </TabPane>

          <TabPane
            tab={
              <span>
                <FileTextOutlined />
                Test Management
              </span>
            }
            key="tests"
          >
            <Card className="admin-card">
              <div className="table-header">
                <h2>All Tests</h2>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => message.info('Test creation feature coming soon!')}
                  className="create-user-btn-small"
                >
                  Create Test
                </Button>
              </div>
              <Table
                columns={testColumns}
                dataSource={tests}
                rowKey="id"
                loading={loading}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => 
                    `${range[0]}-${range[1]} of ${total} tests`,
                }}
              />
            </Card>
          </TabPane>
        </Tabs>
      </div>

      <Modal
        title={editingUser ? 'Edit User' : 'Create User'}
        open={userModalVisible}
        onCancel={() => {
          setUserModalVisible(false);
          form.resetFields();
          setEditingUser(null);
        }}
        footer={null}
        width={600}
        className="admin-modal"
        key={editingUser ? `edit-${editingUser.id}` : 'create'}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitUser}
          className="admin-form"
        >
          <Form.Item
            label="Full Name"
            name="fullname"
            rules={[
              { required: true, message: 'Please enter full name' },
              { min: 2, message: 'Full name must be at least 2 characters' },
              { max: 100, message: 'Full name must not exceed 100 characters' }
            ]}
          >
            <Input placeholder="Enter full name" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter a valid email address' },
              { max: 255, message: 'Email must not exceed 255 characters' }
            ]}
          >
            <Input placeholder="Enter email" disabled={!!editingUser} />
          </Form.Item>

          <Form.Item
            label="Phone"
            name="phone"
            rules={[
              { required: true, message: 'Please enter phone number' },
              { pattern: /^(84|0[3|5|7|8|9])(\d{8})$/, message: 'Please enter a valid Vietnamese phone number (e.g., 0987654321 or 84987654321)' }
            ]}
          >
            <Input placeholder="Enter phone number (e.g., 0987654321)" />
          </Form.Item>

          <Form.Item
            label="Role"
            name="role"
            rules={editingUser ? [] : [{ required: true, message: 'Please select role' }]}
          >
            <Select placeholder="Select role" disabled={!!editingUser}>
              <Option value="ADMIN">ADMIN</Option>
              <Option value="PARENT">PARENT</Option>
              <Option value="STUDENT">STUDENT</Option>
            </Select>
          </Form.Item>

          {!editingUser && (
            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: 'Please enter password' },
                { min: 6, message: 'Password must be at least 6 characters' }
              ]}
            >
              <Input.Password placeholder="Enter password" />
            </Form.Item>
          )}

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingUser ? 'Update' : 'Create'}
              </Button>
              <Button onClick={() => {
                setUserModalVisible(false);
                form.resetFields();
                setEditingUser(null);
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title="User Details"
        placement="right"
        onClose={() => setViewUserDrawer(false)}
        open={viewUserDrawer}
        width={500}
      >
        {selectedUser && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="ID">{selectedUser.id}</Descriptions.Item>
            <Descriptions.Item label="Full Name">{selectedUser.fullname || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Email">{selectedUser.email}</Descriptions.Item>
            <Descriptions.Item label="Phone">{selectedUser.phone || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Role">
              <Tag className={`role-tag role-${selectedUser.role ? selectedUser.role.toLowerCase() : 'unknown'}`}>
                {selectedUser.role || 'Unknown'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Created At">
              {selectedUser.createAt ? new Date(selectedUser.createAt).toLocaleString() : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={selectedUser.isDeleted ? 'red' : 'green'}>
                {selectedUser.isDeleted ? 'Deleted' : 'Active'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Total Tests">
              {selectedUser.tests ? selectedUser.tests.length : 0}
            </Descriptions.Item>
            <Descriptions.Item label="Total Test Sessions">
              {selectedUser.testSessions ? selectedUser.testSessions.length : 0}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
}

export default AdminDashboard;
