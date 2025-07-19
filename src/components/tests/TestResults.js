import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Typography, Spin, Alert, Button, Card, Divider } from 'antd';
import { LoadingOutlined, TrophyOutlined, HomeOutlined } from '@ant-design/icons';
import TestSessionService from '../../services/TestSessionService';
import './TestResults.css';

const { Title, Paragraph, Text } = Typography;

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

  useEffect(() => {
    if (!sessionId) {
      setError('No sessionId provided. Please retake the test.');
      setLoading(false);
      return;
    }
    const fetchResult = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await TestSessionService.getResult(sessionId);
        setResult(data.result);
      } catch (err) {
        setError('Failed to fetch test result. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [sessionId]);

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
