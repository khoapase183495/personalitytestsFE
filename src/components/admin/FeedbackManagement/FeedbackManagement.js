import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Modal, message, Space, Popconfirm, Rate, DatePicker, Select, Input, Row, Col, Statistic, Progress } from 'antd';
import { EyeOutlined, DeleteOutlined, StarOutlined, UserOutlined, FileTextOutlined, FilterOutlined } from '@ant-design/icons';
import AdminFeedbackService from '../../../services/AdminFeedbackService';
import './FeedbackManagement.css';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Search } = Input;

function FeedbackManagement() {
  const [loading, setLoading] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [stats, setStats] = useState({
    totalFeedbacks: 0,
    activeFeedbacks: 0,
    deletedFeedbacks: 0,
    averageRating: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    recentFeedbacks: []
  });

  // Filters
  const [searchText, setSearchText] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [dateRange, setDateRange] = useState([]);

  useEffect(() => {
    loadFeedbacks();
    loadStats();
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = feedbacks.filter(feedback => !feedback.isDeleted);

    // Search filter
    if (searchText) {
      filtered = filtered.filter(feedback =>
        feedback.feedbackContent?.toLowerCase().includes(searchText.toLowerCase()) ||
        feedback.user?.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
        feedback.test?.title?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Rating filter
    if (ratingFilter !== 'all') {
      filtered = filtered.filter(feedback => feedback.rating === parseInt(ratingFilter));
    }

    // Date range filter
    if (dateRange && dateRange.length === 2) {
      const [startDate, endDate] = dateRange;
      filtered = filtered.filter(feedback => {
        const feedbackDate = new Date(feedback.createAt);
        return feedbackDate >= startDate.toDate() && feedbackDate <= endDate.toDate();
      });
    }

    setFilteredFeedbacks(filtered);
  }, [feedbacks, searchText, ratingFilter, dateRange]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const loadFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await AdminFeedbackService.getAllFeedbacks();
      console.log('Loaded feedbacks:', response);
      console.log('First feedback user:', response[0]?.user);
      setFeedbacks(response);
    } catch (error) {
      message.error('Failed to load feedbacks');
      console.error('Error loading feedbacks:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await AdminFeedbackService.getFeedbackStats();
      setStats(response);
    } catch (error) {
      console.error('Error loading feedback stats:', error);
    }
  };

  const handleViewDetails = useCallback((record) => {
    setSelectedFeedback(record);
    setDetailModalVisible(true);
  }, []);

  const handleDeleteFeedback = useCallback(async (feedbackId) => {
    try {
      await AdminFeedbackService.deleteFeedback(feedbackId);
      message.success('Feedback deleted successfully');
      // Reload data
      const response = await AdminFeedbackService.getAllFeedbacks();
      setFeedbacks(response);
      const statsResponse = await AdminFeedbackService.getFeedbackStats();
      setStats(statsResponse);
    } catch (error) {
      message.error('Failed to delete feedback');
      console.error('Error deleting feedback:', error);
    }
  }, []);

  const getRatingColor = (rating) => {
    if (rating >= 4) return '#52c41a';
    if (rating >= 3) return '#faad14';
    return '#ff4d4f';
  };

  const getTestTitle = (feedback) => {
    return feedback.test?.title || 'Unknown Test';
  };

  const getUserName = (feedback) => {
    // Debug log to check user data structure
    console.log('Feedback user data:', feedback.user);
    console.log('Full feedback object:', feedback);
    
    // More robust checking - prioritize fullName
    if (feedback.user && feedback.user.fullName) {
      console.log('Using fullName:', feedback.user.fullName);
      return feedback.user.fullName;
    }
    
    // Fallback options
    if (feedback.user && feedback.user.name) {
      console.log('Using name:', feedback.user.name);
      return feedback.user.name;
    }
    
    if (feedback.user && feedback.user.email) {
      console.log('Using email:', feedback.user.email);
      return feedback.user.email;
    }
    
    console.log('Returning Unknown User');
    return 'Unknown User';
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'User',
      key: 'user',
      render: (_, record) => {
        const userName = getUserName(record);
        console.log('Rendering user name:', userName, 'for record ID:', record.id);
        return (
          <Space>
            <UserOutlined />
            <span>{userName}</span>
          </Space>
        );
      },
      sorter: (a, b) => getUserName(a).localeCompare(getUserName(b)),
    },
    {
      title: 'Test',
      key: 'test',
      render: (_, record) => (
        <Space>
          <FileTextOutlined />
          <span>{getTestTitle(record)}</span>
        </Space>
      ),
      sorter: (a, b) => getTestTitle(a).localeCompare(getTestTitle(b)),
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      width: 120,
      render: (rating) => (
        <Rate disabled defaultValue={rating} style={{ fontSize: 16 }} />
      ),
      sorter: (a, b) => a.rating - b.rating,
    },
    {
      title: 'Content',
      dataIndex: 'feedbackContent',
      key: 'feedbackContent',
      ellipsis: true,
      render: (content) => (
        <span title={content}>
          {content && content.length > 50 ? `${content.substring(0, 50)}...` : content || 'No content'}
        </span>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'createAt',
      key: 'createAt',
      width: 150,
      render: (date) => new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      sorter: (a, b) => new Date(a.createAt) - new Date(b.createAt),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
            size="small"
            type="primary"
            ghost
          >
            View
          </Button>
          
        </Space>
      ),
    },
  ];

  return (
    <div className="feedback-management">
      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Feedbacks"
              value={stats.totalFeedbacks}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Feedbacks"
              value={stats.activeFeedbacks}
              prefix={<StarOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Average Rating"
              value={stats.averageRating}
              precision={1}
              suffix="/ 5"
              prefix={<StarOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Deleted Feedbacks"
              value={stats.deletedFeedbacks}
              prefix={<DeleteOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Rating Distribution */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card title="Rating Distribution" size="small">
            <Row gutter={16}>
              {[5, 4, 3, 2, 1].map(rating => (
                <Col span={4} key={rating}>
                  <div style={{ textAlign: 'center' }}>
                    <div>{rating} Star</div>
                    <Progress
                      type="line"
                      percent={stats.activeFeedbacks > 0 ? Math.round((stats.ratingDistribution[rating] / stats.activeFeedbacks) * 100) : 0}
                      strokeColor={getRatingColor(rating)}
                      size="small"
                    />
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {stats.ratingDistribution[rating]} feedbacks
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Search
              placeholder="Search by content, user, or test name..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{ width: '100%' }}
            />
          </Col>
          <Col>
            <Select
              value={ratingFilter}
              onChange={setRatingFilter}
              style={{ width: 120 }}
              placeholder="Rating"
            >
              <Option value="all">All Ratings</Option>
              <Option value="5">5 Stars</Option>
              <Option value="4">4 Stars</Option>
              <Option value="3">3 Stars</Option>
              <Option value="2">2 Stars</Option>
              <Option value="1">1 Star</Option>
            </Select>
          </Col>
          <Col>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              style={{ width: 250 }}
              placeholder={['Start Date', 'End Date']}
            />
          </Col>
          <Col>
            <Button
              icon={<FilterOutlined />}
              onClick={() => {
                setSearchText('');
                setRatingFilter('all');
                setDateRange([]);
              }}
            >
              Clear Filters
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Feedbacks Table */}
      <Card title={`Feedback Management (${filteredFeedbacks.length} feedbacks)`}>
        <Table
          key={`table-${feedbacks.length}-${Date.now()}`}
          columns={columns}
          dataSource={filteredFeedbacks}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} feedbacks`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title="Feedback Details"
        visible={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>,
          <Popconfirm
            key="delete"
            title="Are you sure to delete this feedback?"
            onConfirm={() => {
              handleDeleteFeedback(selectedFeedback?.id);
              setDetailModalVisible(false);
            }}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />}>
              Delete Feedback
            </Button>
          </Popconfirm>
        ]}
        width={600}
      >
        {selectedFeedback && (
          <div className="feedback-details">
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <div><strong>Feedback ID:</strong> {selectedFeedback.id}</div>
              </Col>
              <Col span={12}>
                <div><strong>Created:</strong> {new Date(selectedFeedback.createAt).toLocaleString()}</div>
              </Col>
            </Row>
            
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <div><strong>User:</strong> {getUserName(selectedFeedback)}</div>
              </Col>
              <Col span={12}>
                <div><strong>Test:</strong> {getTestTitle(selectedFeedback)}</div>
              </Col>
            </Row>

            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={24}>
                <div><strong>Rating:</strong></div>
                <Rate disabled defaultValue={selectedFeedback.rating} style={{ fontSize: 16 }} />
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <div><strong>Feedback Content:</strong></div>
                <Card size="small" style={{ marginTop: 8, backgroundColor: '#f5f5f5' }}>
                  {selectedFeedback.feedbackContent || 'No content provided'}
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default FeedbackManagement;
