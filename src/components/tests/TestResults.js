import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Typography, 
  Spin, 
  Alert, 
  Button, 
  Card, 
  Divider, 
  Rate, 
  Input, 
  Form, 
  message,
  Space 
} from 'antd';
import { 
  LoadingOutlined, 
  TrophyOutlined, 
  HomeOutlined, 
  StarOutlined,
  MessageOutlined 
} from '@ant-design/icons';
import TestSessionService from '../../services/TestSessionService';
import FeedBackService from '../../services/FeedbackService';
import './TestResults.css';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function TestResults() {
  const query = useQuery();
  const sessionId = query.get('sessionId');
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState('');
  const [error, setError] = useState(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [currentTestId, setCurrentTestId] = useState(null); // Will be set from localStorage

  const [feedbackForm] = Form.useForm();

  useEffect(() => {
    console.log('TestResults mounted with sessionId:', sessionId); // Debug log
    
    if (!sessionId) {
      setError('No sessionId provided. Please retake the test.');
      setLoading(false);
      return;
    }

    // Get testId from localStorage
    const storedTestId = localStorage.getItem(`testId_${sessionId}`);
    if (storedTestId) {
      setCurrentTestId(parseInt(storedTestId));
      console.log('Retrieved testId from localStorage:', storedTestId);
    } else {
      console.warn('No testId found in localStorage for sessionId:', sessionId);
    }
    
    const fetchResult = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await TestSessionService.getResult(sessionId);
        setResult(data.result);
        
        console.log('Result data:', data); // Debug log
      } catch (err) {
        console.error('Failed to fetch result:', err);
        setError('Failed to fetch test result. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchResult();
  }, [sessionId]);

  const handleFeedbackSubmit = async (values) => {
    console.log('Submitting feedback with testId:', currentTestId); // Debug log
    
    if (!currentTestId) {
      message.error('Test ID not available. Cannot submit feedback.');
      console.error('TestId missing:', { currentTestId, sessionId });
      return;
    }

    setSubmittingFeedback(true);
    try {
      const feedbackData = {
        rating: values.rating,
        feedbackContent: values.feedbackContent || '',
        testId: currentTestId
      };

      console.log('Feedback data being sent:', feedbackData); // Debug log
      
      await FeedBackService.submitFeedback(feedbackData);
      message.success('Thank you for your feedback!');
      setFeedbackSubmitted(true);
      feedbackForm.resetFields();
      
      // Clean up localStorage after successful feedback submission
      localStorage.removeItem(`testId_${sessionId}`);
    } catch (error) {
      console.error('Feedback submission error:', error);
      message.error(error.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  // Add cleanup when component unmounts
  useEffect(() => {
    return () => {
      // Optional: Clean up localStorage when component unmounts without feedback
      if (sessionId && !feedbackSubmitted) {
        // Keep the testId for a short while in case user refreshes
        setTimeout(() => {
          localStorage.removeItem(`testId_${sessionId}`);
        }, 10 * 60 * 1000); // Remove after 10 minutes
      }
    };
  }, [sessionId, feedbackSubmitted]);

  if (loading) {
    return (
      <div className="test-results-container">
        <div className="loading-wrapper">
          <Spin indicator={<LoadingOutlined className="loading-icon" spin />} />
          <Paragraph className="loading-text">
            Analyzing your personality test results...
          </Paragraph>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="test-results-container">
        <Card className="error-card">
          <Alert
            message="Unable to Load Results"
            description={error}
            type="error"
            showIcon
            action={
              <Button type="primary" onClick={() => navigate('/')}>
                Return to Home
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="test-results-container">
      <div className="results-wrapper">
        <Card className="results-header-card">
          <div className="results-header">
            <TrophyOutlined className="trophy-icon" />
            <Title level={1} className="results-title">
              Personality Assessment Results
            </Title>
            <Text className="results-subtitle">
              Your comprehensive personality analysis is ready
            </Text>
          </div>
        </Card>

        <Card className="results-content-card">
          <div className="results-content">
            <Title level={3} className="content-title">
              Your Personality Profile
            </Title>
            <Divider className="content-divider" />
            <div className="result-text-container">
              <Paragraph className="result-text">
                {result}
              </Paragraph>
            </div>
          </div>
        </Card>

        {/* Feedback Section */}
        <Card className="feedback-card">
          <div className="feedback-content">
            <Title level={3} className="feedback-title">
              <MessageOutlined className="feedback-icon" />
              Share Your Experience
            </Title>
            <Paragraph className="feedback-description">
              Help us improve by rating this personality test and sharing your thoughts.
            </Paragraph>
            
            {!feedbackSubmitted ? (
              <Form
                form={feedbackForm}
                layout="vertical"
                onFinish={handleFeedbackSubmit}
                className="feedback-form"
              >
                <Form.Item
                  name="rating"
                  label="How would you rate this test?"
                  rules={[
                    { required: true, message: 'Please provide a rating' }
                  ]}
                  className="rating-form-item"
                >
                  <Rate 
                    allowHalf={false}
                    character={<StarOutlined />}
                    className="feedback-rating"
                  />
                </Form.Item>
                <div className="rating-helper-container">
                  <Text className="rating-helper">
                    (1 = Poor, 5 = Excellent)
                  </Text>
                </div>

                <Form.Item
                  name="feedbackContent"
                  label="Your feedback (optional)"
                >
                  <TextArea
                    rows={4}
                    placeholder="Share your thoughts about this personality test..."
                    maxLength={500}
                    showCount
                    className="feedback-textarea"
                  />
                </Form.Item>

                <Form.Item className="feedback-actions">
                  <Space>
                    <Button 
                      type="primary"
                      htmlType="submit"
                      loading={submittingFeedback}
                      size="large"
                      className="submit-feedback-btn"
                    >
                      Submit Feedback
                    </Button>
                    <Button 
                      onClick={() => setFeedbackSubmitted(true)}
                      size="large"
                      className="skip-feedback-btn"
                    >
                      Skip
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            ) : (
              <div className="feedback-submitted">
                <Alert
                  message="Thank you for your feedback!"
                  description="Your feedback helps us improve our personality tests for everyone."
                  type="success"
                  showIcon
                  className="feedback-success-alert"
                />
              </div>
            )}
          </div>
        </Card>

        <Card className="results-actions-card">
          <div className="results-actions">
            <Button 
              type="primary" 
              size="large"
              icon={<HomeOutlined />}
              onClick={() => navigate('/')}
              className="action-button primary-button"
            >
              Back to Home
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default TestResults;