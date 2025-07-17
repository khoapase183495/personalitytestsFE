import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Tabs, Table, Button, Modal, Form, Input, Select, message, Space, Popconfirm } from 'antd';
import { UserOutlined, FileTextOutlined, PlusOutlined, EditOutlined, EyeOutlined, SearchOutlined, DeleteOutlined, QuestionCircleOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import AdminUserService from '../../services/AdminUserService';
import AdminTestService from '../../services/AdminTestService';
import AdminQuestionService from '../../services/AdminQuestionService';
import './AdminDashboard.css';

const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [tests, setTests] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [testModalVisible, setTestModalVisible] = useState(false);
  const [questionModalVisible, setQuestionModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingTest, setEditingTest] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);

  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('users');
  const [stats, setStats] = useState({
    totalUsers: 0,
    adminCount: 0,
    parentCount: 0,
    studentCount: 0
  });
  const [form] = Form.useForm();
  const [testForm] = Form.useForm();
  const [questionForm] = Form.useForm();

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
      const response = await AdminTestService.getAllTests();
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

  // Delete function temporarily removed - backend endpoint not available
  // const handleDeleteUser = async (userId) => { ... }

  const handleViewUser = (userId) => {
    // Navigate to dedicated user details page
    navigate(`/admin/users/${userId}`);
  };

  // Test Management Functions
  const handleCreateTest = () => {
    setEditingTest(null);
    testForm.resetFields();
    setTestModalVisible(true);
  };

  const handleEditTest = (record) => {
    setEditingTest(record);
    testForm.setFieldsValue({
      title: record.title || '',
      description: record.description || ''
    });
    setTestModalVisible(true);
  };

  const handleSubmitTest = async (values) => {
    try {
      setLoading(true);
      
      if (editingTest) {
        await AdminTestService.updateTest(editingTest.id, values);
        message.success('Test updated successfully');
      } else {
        await AdminTestService.createTest(values);
        message.success('Test created successfully');
      }
      
      setTestModalVisible(false);
      testForm.resetFields();
      setEditingTest(null);
      loadTests();
    } catch (error) {
      message.error(`Failed to ${editingTest ? 'update' : 'create'} test: ` + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTest = async (testId) => {
    try {
      await AdminTestService.deleteTest(testId);
      message.success('Test deleted successfully');
      loadTests();
    } catch (error) {
      message.error('Failed to delete test: ' + error.message);
    }
  };

  // Question Management Functions
  const loadQuestionsByTest = async (testId) => {
    try {
      setLoading(true);
      const response = await AdminQuestionService.getQuestionsByTestId(testId);
      setQuestions(response || []);
      
      if (!response || response.length === 0) {
        message.info('No questions found for this test. You can create new questions using the buttons above.');
      }
    } catch (error) {
      console.error('Error loading questions:', error);
      setQuestions([]);
      
      if (error.message.includes('500') || error.message.includes('Server error')) {
        message.warning('Question service is temporarily unavailable. You can still create new questions.');
      } else {
        message.error('Failed to load questions: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleViewTestQuestions = (testRecord) => {
    setSelectedTest(testRecord);
    loadQuestionsByTest(testRecord.id);
    setActiveTab('questions');
  };

  const handleBackToTests = () => {
    setSelectedTest(null);
    setQuestions([]);
    setActiveTab('tests');
  };

  const handleCreateQuestion = () => {
    if (!selectedTest) {
      message.warning('Please select a test first');
      return;
    }
    setEditingQuestion(null);
    questionForm.resetFields();
    setQuestionModalVisible(true);
  };

  const handleEditQuestion = (record) => {
    setEditingQuestion(record);
    questionForm.setFieldsValue({
      content: record.content || '',
      testId: selectedTest?.id || record.testId
    });
    setQuestionModalVisible(true);
  };

  const handleSubmitQuestion = async (values) => {
    try {
      setLoading(true);
      
      const questionData = {
        content: values.content,
        testId: selectedTest?.id || values.testId
      };
      
      if (editingQuestion) {
        await AdminQuestionService.updateQuestion(editingQuestion.id, questionData);
        message.success('Question updated successfully');
      } else {
        await AdminQuestionService.createQuestion(questionData);
        message.success('Question created successfully');
      }
      
      setQuestionModalVisible(false);
      questionForm.resetFields();
      setEditingQuestion(null);
      loadQuestionsByTest(selectedTest?.id);
    } catch (error) {
      message.error(`Failed to ${editingQuestion ? 'update' : 'create'} question: ` + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    try {
      setLoading(true);
      
      // Try soft delete first
      try {
        await AdminQuestionService.deleteQuestion(questionId);
        message.success('Question deleted successfully');
      } catch (deleteError) {
        console.warn('Direct delete failed, trying alternative method:', deleteError.message);
        
        // If delete fails, try hide method as workaround
        try {
          await AdminQuestionService.hideQuestion(questionId);
          message.success('Question removed from list (soft delete)');
        } catch (hideError) {
          console.error('Both delete methods failed:', hideError.message);
          
          // If both fail, at least hide it from frontend temporarily
          setQuestions(prevQuestions => 
            prevQuestions.filter(q => q.id !== questionId)
          );
          
          message.warning('Question removed from display. Note: Backend deletion may have failed due to database constraints or server issues. The question may still exist in the database.');
          return; // Exit early since we handled it manually
        }
      }
      
      // Reload questions after successful deletion
      loadQuestionsByTest(selectedTest?.id);
    } catch (error) {
      message.error('Failed to delete question: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // User Management Functions
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
          {/* Delete button temporarily removed - backend endpoint not available */}
          {/* 
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
          */}
        </Space>
      ),
    },
  ];

  const questionColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70,
    },
    {
      title: 'Content',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
    },
    {
      title: 'Test ID',
      dataIndex: 'testId',
      key: 'testId',
      width: 100,
    },
    {
      title: 'Created At',
      dataIndex: 'createAt',
      key: 'createAt',
      width: 120,
      render: (date) => date ? new Date(date).toLocaleDateString() : 'N/A',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEditQuestion(record)}
            size="small"
            type="primary"
            ghost
          />
          <Popconfirm
            title="Are you sure you want to delete this question?"
            onConfirm={() => handleDeleteQuestion(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              icon={<DeleteOutlined />}
              size="small"
              type="primary"
              danger
            />
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
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Button
            icon={<QuestionCircleOutlined />}
            onClick={() => handleViewTestQuestions(record)}
            size="small"
            type="default"
            title="View Questions"
          >
            Questions
          </Button>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEditTest(record)}
            size="small"
            type="primary"
            ghost
          />
          <Popconfirm
            title="Are you sure you want to delete this test?"
            onConfirm={() => handleDeleteTest(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              icon={<DeleteOutlined />}
              size="small"
              type="primary"
              danger
            />
          </Popconfirm>
        </Space>
      ),
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

        <Tabs 
          defaultActiveKey="users" 
          activeKey={activeTab}
          onChange={setActiveTab}
          className="admin-tabs"
        >
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
                <Space>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreateTest}
                    className="create-user-btn-small"
                  >
                    Create Test
                  </Button>
                </Space>
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

          <TabPane
            tab={
              <span>
                <QuestionCircleOutlined />
                Question Management
              </span>
            }
            key="questions"
          >
            <Card className="admin-card">
              {selectedTest ? (
                <>
                  <div className="table-header">
                    <div>
                      <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={handleBackToTests}
                        style={{ marginRight: 16 }}
                      >
                        Back to Tests
                      </Button>
                      <h2 style={{ display: 'inline', marginLeft: 8 }}>
                        Questions for "{selectedTest.title}"
                      </h2>
                    </div>
                    <Space>
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleCreateQuestion}
                        className="create-user-btn-small"
                      >
                        Create Question
                      </Button>
                    </Space>
                  </div>
                  <Table
                    columns={questionColumns}
                    dataSource={questions}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) => 
                        `${range[0]}-${range[1]} of ${total} questions`,
                    }}
                  />
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <QuestionCircleOutlined style={{ fontSize: '48px', color: '#ccc', marginBottom: 16 }} />
                  <h3>No Test Selected</h3>
                  <p>Please go to Test Management and click "Questions" button on any test to view its questions.</p>
                  <Button 
                    type="primary" 
                    onClick={() => setActiveTab('tests')}
                  >
                    Go to Test Management
                  </Button>
                </div>
              )}
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

      <Modal
        title={editingTest ? 'Edit Test' : 'Create Test'}
        open={testModalVisible}
        onCancel={() => {
          setTestModalVisible(false);
          testForm.resetFields();
          setEditingTest(null);
        }}
        footer={null}
        width={600}
        className="admin-modal"
      >
        <Form
          form={testForm}
          layout="vertical"
          onFinish={handleSubmitTest}
          className="admin-form"
        >
          <Form.Item
            label="Test Title"
            name="title"
            rules={[
              { required: true, message: 'Please enter test title' },
              { min: 3, message: 'Title must be at least 3 characters' },
              { max: 200, message: 'Title must not exceed 200 characters' }
            ]}
          >
            <Input placeholder="Enter test title" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[
              { required: true, message: 'Please enter test description' },
              { min: 10, message: 'Description must be at least 10 characters' },
              { max: 500, message: 'Description must not exceed 500 characters' }
            ]}
          >
            <TextArea 
              placeholder="Enter test description" 
              rows={4}
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingTest ? 'Update' : 'Create'}
              </Button>
              <Button onClick={() => {
                setTestModalVisible(false);
                testForm.resetFields();
                setEditingTest(null);
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingQuestion ? 'Edit Question' : 'Create Question'}
        open={questionModalVisible}
        onCancel={() => {
          setQuestionModalVisible(false);
          questionForm.resetFields();
          setEditingQuestion(null);
        }}
        footer={null}
        width={600}
        className="admin-modal"
      >
        <Form
          form={questionForm}
          layout="vertical"
          onFinish={handleSubmitQuestion}
          className="admin-form"
        >
          <Form.Item
            label="Question Content"
            name="content"
            rules={[
              { required: true, message: 'Please enter question content' },
              { min: 5, message: 'Content must be at least 5 characters' },
              { max: 500, message: 'Content must not exceed 500 characters' }
            ]}
            help="Write a personality-related statement (e.g., 'I enjoy meeting new people')"
          >
            <TextArea 
              placeholder="Enter question content" 
              rows={3}
              showCount
              maxLength={500}
            />
          </Form.Item>

          {selectedTest && (
            <Form.Item
              label="Test"
              name="testId"
              initialValue={selectedTest.id}
            >
              <Input 
                value={`${selectedTest.title} (ID: ${selectedTest.id})`}
                disabled
                style={{ background: '#f5f5f5' }}
              />
            </Form.Item>
          )}

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingQuestion ? 'Update' : 'Create'}
              </Button>
              <Button onClick={() => {
                setQuestionModalVisible(false);
                questionForm.resetFields();
                setEditingQuestion(null);
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default AdminDashboard;
