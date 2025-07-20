import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Tag, 
  Modal, 
  Form, 
  Input, 
  message, 
  Popconfirm,
  Row,
  Col,
  Statistic,
  Typography,
  Tooltip,
  Breadcrumb
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  FileTextOutlined,
  QuestionCircleOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ArrowLeftOutlined,
  HomeOutlined
} from '@ant-design/icons';
import AdminTestService from '../../../services/AdminTestService';
import './TestManagement.css';

const { Title, Text } = Typography;
const { TextArea } = Input;

function TestManagement() {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadTests();
    loadStats();
  }, []);

  const loadTests = async () => {
    try {
      setLoading(true);
      const testsData = await AdminTestService.getAllTests();
      setTests(testsData);
    } catch (error) {
      message.error('Failed to load tests');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await AdminTestService.getTestStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleCreate = () => {
    setEditingTest(null);
    setModalVisible(true);
    form.resetFields();
  };

  const handleEdit = (test) => {
    setEditingTest(test);
    setModalVisible(true);
    form.setFieldsValue({
      title: test.title,
      description: test.description
    });
  };

  const handleDelete = async (testId) => {
    try {
      await AdminTestService.deleteTest(testId);
      message.success('Test deleted successfully');
      loadTests();
      loadStats();
    } catch (error) {
      message.error('Failed to delete test: ' + error.message);
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingTest) {
        await AdminTestService.updateTest(editingTest.id, values);
        message.success('Test updated successfully');
      } else {
        await AdminTestService.createTest(values);
        message.success('Test created successfully');
      }
      
      setModalVisible(false);
      form.resetFields();
      loadTests();
      loadStats();
    } catch (error) {
      message.error(`Failed to ${editingTest ? 'update' : 'create'} test: ` + error.message);
    }
  };

  const getStatusColor = (test) => {
    if (test.isDeleted) return 'red';
    if (test.questions && test.questions.length > 0) return 'green';
    return 'orange';
  };

  const getStatusText = (test) => {
    if (test.isDeleted) return 'Deleted';
    if (test.questions && test.questions.length > 0) return 'Active';
    return 'Draft';
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
      render: (id) => <Text code>{id}</Text>
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (title, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{title || 'Untitled Test'}</Text>
          {record.description && (
            <Text type="secondary" ellipsis style={{ maxWidth: 300 }}>
              {record.description}
            </Text>
          )}
        </Space>
      )
    },
    {
      title: 'Creator',
      dataIndex: 'user',
      key: 'user',
      width: 120,
      render: (user) => (
        <Space>
          <Text>{user ? user.fullname || user.email : 'Unknown'}</Text>
        </Space>
      )
    },
    {
      title: 'Questions',
      dataIndex: 'questions',
      key: 'questions',
      width: 100,
      align: 'center',
      render: (questions) => (
        <Space>
          <QuestionCircleOutlined />
          <Text>{questions ? questions.length : 0}</Text>
        </Space>
      )
    },
    {
      title: 'Created At',
      dataIndex: 'createAt',
      key: 'createAt',
      width: 120,
      render: (createAt) => (
        <Space>
          <CalendarOutlined />
          <Text type="secondary">
            {createAt ? new Date(createAt).toLocaleDateString() : 'N/A'}
          </Text>
        </Space>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (_, record) => (
        <Tag color={getStatusColor(record)} icon={
          record.isDeleted ? <ExclamationCircleOutlined /> : <CheckCircleOutlined />
        }>
          {getStatusText(record)}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit Test">
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Test">
            <Popconfirm
              title="Are you sure you want to delete this test?"
              description="This action cannot be undone."
              onConfirm={() => handleDelete(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                type="primary"
                danger
                icon={<DeleteOutlined />}
                size="small"
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <div className="test-management-container">
      {/* Breadcrumb */}
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item>
          <HomeOutlined />
          <span onClick={() => navigate('/admin')} style={{ cursor: 'pointer', marginLeft: 8 }}>
            Admin Dashboard
          </span>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Test Management</Breadcrumb.Item>
      </Breadcrumb>

      <div className="test-management-header">
        <Space>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/admin')}
            type="text"
          >
            Back to Dashboard
          </Button>
        </Space>
        <Title level={2} style={{ margin: 0 }}>Test Management</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleCreate}
          size="large"
        >
          Create New Test
        </Button>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Tests"
              value={stats.totalTests}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Active Tests"
              value={stats.activeTests}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Draft Tests"
              value={stats.totalTests - stats.activeTests - stats.deletedTests}
              prefix={<EditOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Avg Questions"
              value={stats.averageQuestions}
              prefix={<QuestionCircleOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Tests Table */}
      <Card style={{ borderRadius: 8 }}>
        <Table
          columns={columns}
          dataSource={tests}
          rowKey="id"
          loading={loading}
          size="middle"
          pagination={{
            total: tests.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} tests`,
            size: 'small'
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingTest ? 'Edit Test' : 'Create New Test'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            label="Test Title"
            name="title"
            rules={[
              { required: true, message: 'Please enter test title' },
              { min: 3, message: 'Title must be at least 3 characters' },
              { max: 100, message: 'Title must not exceed 100 characters' }
            ]}
          >
            <Input placeholder="Enter test title" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[
              { max: 500, message: 'Description must not exceed 500 characters' }
            ]}
          >
            <TextArea 
              rows={4} 
              placeholder="Enter test description (optional)" 
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setModalVisible(false);
                form.resetFields();
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                {editingTest ? 'Update Test' : 'Create Test'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default TestManagement;
