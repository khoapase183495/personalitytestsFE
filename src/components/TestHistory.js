import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  List, 
  Typography, 
  Space, 
  Tag, 
  Divider,
  Empty,
  Spin,
  Select,
  Modal,
  Collapse,
  Rate
} from 'antd';
import { 
  CalendarOutlined, 
  ClockCircleOutlined, 
  UserOutlined,
  BookOutlined,
  EyeOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import TestSessionService from '../services/TestSessionService';
import ParentService from '../services/ParentService';
import moment from 'moment';
import './TestHistory.css';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

function TestHistory() {
  const { user } = useAuth();
  const [testHistory, setTestHistory] = useState([]);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);

  const loadStudentHistory = useCallback(async () => {
    if (!user?.id) return;
    try {
      const historyData = await TestSessionService.getUserTestHistory(user.id);
      setTestHistory(historyData || []);
    } catch (error) {
      console.error('Failed to load test history:', error);
      setTestHistory([]);
    }
  }, [user?.id]);

  const loadParentData = useCallback(async () => {
    if (!user?.id) return;
    try {
      const childrenData = await ParentService.getChildren(user.id);
      setChildren(childrenData || []);
      
      if (childrenData && childrenData.length > 0) {
        const firstChild = childrenData[0];
        setSelectedChild(firstChild);
        const historyData = await TestSessionService.getUserTestHistory(firstChild.id);
        setTestHistory(historyData || []);
      } else {
        setTestHistory([]);
      }
    } catch (error) {
      console.error('Failed to load parent data:', error);
      setChildren([]);
      setTestHistory([]);
    }
  }, [user?.id]);

  const loadData = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      if (user.role === 'STUDENT') {
        await loadStudentHistory();
      } else if (user.role === 'PARENT') {
        await loadParentData();
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }, [user, loadStudentHistory, loadParentData]);

  useEffect(() => {
    if (!user) {
      setTestHistory([]);
      setChildren([]);
      setSelectedChild(null);
      setLoading(false);
      return;
    }
    loadData();
  }, [loadData, user]);

  const handleChildChange = async (childId) => {
    const child = children.find(c => c.id === childId);
    setSelectedChild(child);
    setLoading(true);
    
    try {
      const historyData = await TestSessionService.getUserTestHistory(childId);
      setTestHistory(historyData || []);
    } catch (error) {
      console.error('Failed to load child test history:', error);
      setTestHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (result) => {
    setSelectedResult(result);
    setModalVisible(true);
  };

  const renderTestCard = (testResult) => (
    <Card 
      key={testResult.sessionId}
      className="test-history-card"
      hoverable
      actions={[
        <div 
          className="view-details-action"
          onClick={() => handleViewDetails(testResult)}
        >
          <EyeOutlined /> View Details
        </div>
      ]}
    >
      <div className="test-card-header">
        <div className="test-info">
          <Title level={4} className="test-title">
            <TrophyOutlined /> {testResult.title}
          </Title>
          <Space direction="vertical" size="small">
            <Text className="test-time">
              <ClockCircleOutlined /> Started: {moment(testResult.startTime).format('MMM Do YYYY, h:mm A')}
            </Text>
            <Text className="test-completed">
              <CalendarOutlined /> Completed: {moment(testResult.endTime).format('MMM Do YYYY, h:mm A')}
            </Text>
            <Text className="test-duration">
              Duration: {moment.duration(moment(testResult.endTime).diff(moment(testResult.startTime))).humanize()}
            </Text>
          </Space>
        </div>
        <Tag color="green" className="test-status">Completed</Tag>
      </div>
      
      <Divider />
      
      <div className="test-result-preview">
        <Text strong>Result Preview:</Text>
        <Paragraph className="result-text" ellipsis={{ rows: 3 }}>
          {testResult.result}
        </Paragraph>
        <Text type="secondary">
          Questions answered: {testResult.answerReviewResponses?.length || 0}
        </Text>
      </div>
    </Card>
  );

  const renderAnswerDetails = (answers) => (
    <Collapse ghost>
      {answers.map((answer, index) => (
        <Panel 
          header={
            <div className="answer-header">
              <Text strong>Q{index + 1}: </Text>
              <Text ellipsis style={{ maxWidth: '70%' }}>
                {answer.questionContent}
              </Text>
              <Rate 
                disabled 
                value={answer.selectedRating} 
                style={{ marginLeft: 'auto' }}
              />
            </div>
          } 
          key={answer.questionId}
        >
          <div className="answer-details">
            <Paragraph>{answer.questionContent}</Paragraph>
            <Space>
              <Text strong>Your Rating:</Text>
              <Rate disabled value={answer.selectedRating} />
              <Text>({answer.selectedRating}/5)</Text>
            </Space>
          </div>
        </Panel>
      ))}
    </Collapse>
  );

  if (!user) {
    return (
      <div className="test-history-container">
        <Card className="test-history-card">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <UserOutlined style={{ fontSize: '4rem', color: '#d9d9d9' }} />
            <Title level={3} style={{ marginTop: '1rem' }}>Access Denied</Title>
            <Paragraph>Please log in to view test history.</Paragraph>
          </div>
        </Card>
      </div>
    );
  }

  if (user.role !== 'STUDENT' && user.role !== 'PARENT') {
    return (
      <div className="test-history-container">
        <Card className="test-history-card">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <UserOutlined style={{ fontSize: '4rem', color: '#d9d9d9' }} />
            <Title level={3} style={{ marginTop: '1rem' }}>Access Denied</Title>
            <Paragraph>This page is only available for students and parents.</Paragraph>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="test-history-container">
      <div className="test-history-wrapper">
        <Card className="test-history-card">
          <div className="test-history-header">
            <Title level={2} className="test-history-title">
              <BookOutlined /> Test History
            </Title>
            
            {user.role === 'PARENT' && children.length > 0 && (
              <div className="child-selector">
                <Text strong>Select Child: </Text>
                <Select
                  value={selectedChild?.id}
                  onChange={handleChildChange}
                  style={{ minWidth: 200 }}
                  placeholder="Select a child"
                >
                  {children.map(child => (
                    <Option key={child.id} value={child.id}>
                      {child.fullName || child.email}
                    </Option>
                  ))}
                </Select>
              </div>
            )}
          </div>

          <Divider />

          <div className="test-history-content">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <Spin size="large" />
              </div>
            ) : testHistory.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  user.role === 'PARENT' 
                    ? selectedChild 
                      ? `No test history found for ${selectedChild.fullName || selectedChild.email}`
                      : 'No children found'
                    : 'No test history yet'
                }
              />
            ) : (
              <List
                grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 2 }}
                dataSource={testHistory}
                renderItem={renderTestCard}
                className="test-history-list"
              />
            )}
          </div>
        </Card>
      </div>

      {/* Test Details Modal */}
      <Modal
        title={
          <div className="modal-title">
            <TrophyOutlined /> {selectedResult?.title} - Test Details
          </div>
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setSelectedResult(null);
        }}
        footer={null}
        centered
        destroyOnClose
        className="test-details-modal"
        width={800}
      >
        {selectedResult && (
          <div className="test-details-content">
            <div className="test-summary">
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div>
                  <Text strong>Test Completed: </Text>
                  <Text>{moment(selectedResult.endTime).format('MMMM Do YYYY, h:mm A')}</Text>
                </div>
                <div>
                  <Text strong>Duration: </Text>
                  <Text>
                    {moment.duration(
                      moment(selectedResult.endTime).diff(moment(selectedResult.startTime))
                    ).humanize()}
                  </Text>
                </div>
                <div>
                  <Text strong>Questions Answered: </Text>
                  <Text>{selectedResult.answerReviewResponses?.length || 0}</Text>
                </div>
              </Space>
            </div>

            <Divider />

            <div className="test-result-section">
              <Title level={4}>Test Result</Title>
              <div className="result-content">
                <Paragraph>{selectedResult.result}</Paragraph>
              </div>
            </div>

            <Divider />

            <div className="answers-section">
              <Title level={4}>Your Answers</Title>
              {selectedResult.answerReviewResponses && selectedResult.answerReviewResponses.length > 0 ? (
                renderAnswerDetails(selectedResult.answerReviewResponses)
              ) : (
                <Text type="secondary">No answer details available</Text>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default TestHistory;
