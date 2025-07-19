import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Descriptions, 
  Tag, 
  Button, 
  Space, 
  Spin, 
  message,
  Row,
  Col,
  Statistic,
  List,
  Avatar,
  Typography
} from 'antd';
import { 
  ArrowLeftOutlined, 
  EditOutlined, 
  UserOutlined,
  CalendarOutlined,
  PhoneOutlined,
  MailOutlined,
  TeamOutlined,
  FileTextOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import AdminUserService from '../../../services/AdminUserService';
import './UserDetails.css';

const { Title, Text } = Typography;

function UserDetails() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserDetails = async () => {
      try {
        setLoading(true);
        
        if (!userId) {
          throw new Error('User ID is required');
        }
        
        const userData = await AdminUserService.getUserById(userId);
        
        if (!userData) {
          throw new Error('No user data received');
        }
        
        setUser(userData);
      } catch (error) {
        console.error('UserDetails: Error loading user details:', error);
        message.error(`Failed to load user details: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    loadUserDetails();
  }, [userId]);

  const handleEdit = () => {
    // Navigate back to admin dashboard with edit modal open
    navigate('/admin', { 
      state: { 
        editUser: user,
        openEditModal: true 
      } 
    });
  };

  const handleBack = () => {
    navigate('/admin');
  };

  if (loading) {
    return (
      <div className="user-details-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="user-details-error">
        <Title level={3}>User not found</Title>
        <Button onClick={handleBack}>Back to Admin Dashboard</Button>
      </div>
    );
  }

  const getRoleColor = (role) => {
    switch(role?.toLowerCase()) {
      case 'admin': return 'red';
      case 'parent': return 'green';
      case 'student': return 'blue';
      default: return 'default';
    }
  };

  const getStatusColor = (isDeleted) => {
    return isDeleted ? 'red' : 'green';
  };

  return (
    <div className="user-details-container">
      <div className="user-details-header">
        <Space>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={handleBack}
            type="text"
          >
            Back to Admin Dashboard
          </Button>
        </Space>
        <Space>
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={handleEdit}
          >
            Edit User
          </Button>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        {/* User Basic Info */}
        <Col xs={24} lg={16}>
          <Card 
            title={
              <Space>
                <UserOutlined />
                <span>User Information</span>
              </Space>
            }
            className="user-details-card"
          >
            <Descriptions column={1} bordered>
              <Descriptions.Item label="ID">
                <Text code>{user.id}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Full Name">
                <Text strong>{user.fullname || 'N/A'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                <Space>
                  <MailOutlined />
                  <Text copyable>{user.email}</Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Phone">
                <Space>
                  <PhoneOutlined />
                  <Text copyable>{user.phone || 'N/A'}</Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Role">
                <Tag 
                  color={getRoleColor(user.role)} 
                  className={`role-tag role-${user.role?.toLowerCase() || 'unknown'}`}
                >
                  <TeamOutlined /> {user.role || 'Unknown'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Created At">
                <Space>
                  <CalendarOutlined />
                  <Text>
                    {user.createAt ? new Date(user.createAt).toLocaleString() : 'N/A'}
                  </Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={getStatusColor(user.isDeleted)}>
                  {user.isDeleted ? 'Deleted' : 'Active'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Statistics */}
        <Col xs={24} lg={8}>
          <Card 
            title={
              <Space>
                <FileTextOutlined />
                <span>Activity Statistics</span>
              </Space>
            }
            className="user-stats-card"
          >
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Statistic
                  title="Total Tests Created"
                  value={user.tests ? user.tests.length : 0}
                  prefix={<FileTextOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col span={24}>
                <Statistic
                  title="Total Test Sessions"
                  value={user.testSessions ? user.testSessions.length : 0}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
            </Row>
          </Card>

          {/* Quick Actions */}
          <Card 
            title="Quick Actions" 
            className="user-actions-card"
            style={{ marginTop: 16 }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button 
                type="primary" 
                icon={<EditOutlined />} 
                onClick={handleEdit}
                block
              >
                Edit User Details
              </Button>
              <Button 
                icon={<UserOutlined />} 
                onClick={() => message.info('View tests feature coming soon!')}
                block
              >
                View User Tests
              </Button>
              <Button 
                icon={<ClockCircleOutlined />} 
                onClick={() => message.info('View sessions feature coming soon!')}
                block
              >
                View Test Sessions
              </Button>
            </Space>
          </Card>
        </Col>

        {/* Tests List (if available) */}
        {user.tests && user.tests.length > 0 && (
          <Col span={24}>
            <Card 
              title={
                <Space>
                  <FileTextOutlined />
                  <span>Created Tests ({user.tests.length})</span>
                </Space>
              }
              className="user-tests-card"
            >
              <List
                dataSource={user.tests.slice(0, 5)} // Show only first 5
                renderItem={(test) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<FileTextOutlined />} />}
                      title={test.title || `Test #${test.id}`}
                      description={
                        <Space>
                          <Text type="secondary">
                            Created: {test.createAt ? new Date(test.createAt).toLocaleDateString() : 'N/A'}
                          </Text>
                          <Tag>{test.questions ? test.questions.length : 0} Questions</Tag>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
              {user.tests.length > 5 && (
                <div style={{ textAlign: 'center', marginTop: 16 }}>
                  <Button 
                    type="link" 
                    onClick={() => message.info('View all tests feature coming soon!')}
                  >
                    View all {user.tests.length} tests
                  </Button>
                </div>
              )}
            </Card>
          </Col>
        )}

        {/* Test Sessions List (if available) */}
        {user.testSessions && user.testSessions.length > 0 && (
          <Col span={24}>
            <Card 
              title={
                <Space>
                  <ClockCircleOutlined />
                  <span>Test Sessions ({user.testSessions.length})</span>
                </Space>
              }
              className="user-sessions-card"
            >
              <List
                dataSource={user.testSessions.slice(0, 5)} // Show only first 5
                renderItem={(session) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<ClockCircleOutlined />} />}
                      title={`Session #${session.id}`}
                      description={
                        <Space>
                          <Text type="secondary">
                            Date: {session.createAt ? new Date(session.createAt).toLocaleDateString() : 'N/A'}
                          </Text>
                          <Tag color={session.isCompleted ? 'green' : 'orange'}>
                            {session.isCompleted ? 'Completed' : 'In Progress'}
                          </Tag>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
              {user.testSessions.length > 5 && (
                <div style={{ textAlign: 'center', marginTop: 16 }}>
                  <Button 
                    type="link" 
                    onClick={() => message.info('View all sessions feature coming soon!')}
                  >
                    View all {user.testSessions.length} sessions
                  </Button>
                </div>
              )}
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
}

export default UserDetails;
