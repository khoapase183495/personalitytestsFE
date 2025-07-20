import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Spin, Alert, Typography } from 'antd';
import { PlayCircleOutlined, LoadingOutlined, LoginOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import TestService from '../../services/TestService';
import './TestSectionAntd.css';

const { Title, Paragraph } = Typography;

function TestSectionAntd() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadTestsOnMount = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('TestSectionAntd: Attempting to load tests from backend...');
        const testsData = await TestService.getAllTests();
        console.log('TestSectionAntd: Loaded tests data:', testsData);
        
        // Map backend data to frontend format
        const formattedTests = testsData.map((test) => ({
          ...test,
          slug: test.title.toLowerCase().replace(/\s+/g, '-'),
          shortDescription: truncateDescription(test.description, 2)
        }));
        
        setTests(formattedTests);
        console.log('TestSectionAntd: Formatted tests:', formattedTests);
      } catch (error) {
        console.error('TestSectionAntd: Failed to load tests from backend:', error);
        
        // Check if it's an authentication error
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          setError('Please log in to view available personality tests.');
        } else if (error.message.includes('500')) {
          setError('Server error occurred. This might be due to authentication requirements. Please try logging in first.');
        } else {
          setError(`Failed to connect to backend: ${error.message}. Please ensure the Spring Boot server is running on http://localhost:8080`);
        }
      } finally {
        setLoading(false);
      }
    };

    loadTestsOnMount();
  }, []);

  const loadTests = async (isRetry = false) => {
    try {
      if (isRetry) {
        setIsRetrying(true);
        setError(null);
      }
      
      console.log('TestSectionAntd: Attempting to load tests from backend...');
      const testsData = await TestService.getAllTests();
      console.log('TestSectionAntd: Loaded tests data:', testsData);
      
        // Map backend data to frontend format
        const formattedTests = testsData.map((test) => ({
          ...test,
          slug: test.title.toLowerCase().replace(/\s+/g, '-'),
          shortDescription: truncateDescription(test.description, 2)
        }));
      
      setTests(formattedTests);
      console.log('TestSectionAntd: Formatted tests:', formattedTests);
      setError(null); // Clear error on success
    } catch (error) {
      console.error('TestSectionAntd: Failed to load tests from backend:', error);
      
      // Check if it's an authentication error
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        setError('Please log in to view available personality tests.');
      } else if (error.message.includes('500')) {
        setError('Server error occurred. This might be due to authentication requirements. Please try logging in first.');
      } else {
        setError(`Failed to connect to backend: ${error.message}. Please ensure the Spring Boot server is running on http://localhost:8080`);
      }
    } finally {
      if (isRetry) {
        setIsRetrying(false);
      }
    }
  };

  const truncateDescription = (description, lines = 2) => {
    if (!description) return '';
    
    const sentences = description.split('.');
    if (sentences.length <= lines) return description;
    
    return sentences.slice(0, lines).join('.') + '.';
  };

  const handleTestClick = (test) => {
    // Navigate to test details page
    navigate(`/tests/${test.slug}/details`);
  };

  const handleLoginClick = () => {
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <section className="test-section-antd">
        <div className="test-loading">
          <Spin 
            indicator={<LoadingOutlined style={{ fontSize: 48, color: '#3d348b' }} spin />}
            size="large"
          />
          <Paragraph style={{ marginTop: 16, color: '#6c757d', fontSize: '1.1rem' }}>
            Loading personality tests...
          </Paragraph>
        </div>
      </section>
    );
  }

  if (error) {
    const showLoginButton = error.includes('log in') || error.includes('authentication');
    
    return (
      <section className="test-section-antd">
        <div className="test-header">
          <Title level={2} className="test-title">
            Discover Your Personality
          </Title>
          <Paragraph className="test-subtitle">
            Take our scientifically-backed personality tests to gain deep insights into your character, motivations, and potential.
          </Paragraph>
        </div>
        
        <Alert
          message="Unable to Load Tests"
          description={error}
          type="warning"
          showIcon
          className="test-error"
          action={
            <div className="error-actions">
              {showLoginButton && (
                <Button 
                  type="primary"
                  icon={<LoginOutlined />}
                  onClick={handleLoginClick}
                  className="login-button"
                >
                  Login
                </Button>
              )}
              <Button 
                type="default"
                onClick={() => loadTests(true)}
                loading={isRetrying}
                className="retry-button"
              >
                Retry
              </Button>
            </div>
          }
        />
      </section>
    );
  }

  return (
    <section className="test-section-antd">
      <div className="test-header">
        <Title level={2} className="test-title">
          Discover Your Personality
        </Title>
        <Paragraph className="test-subtitle">
          Take our scientifically-backed personality tests to gain deep insights into your character, motivations, and potential.
        </Paragraph>
      </div>

      <Row gutter={[40, 40]} className="test-grid-antd">
        {tests.map((test) => (
          <Col xs={24} sm={24} md={12} lg={12} xl={12} key={test.id}>
            <Card
              className="test-card-antd no-image"
              actions={[
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  size="large"
                  className="test-button"
                  onClick={() => handleTestClick(test)}
                >
                  View Test
                </Button>
              ]}
            >
              <Card.Meta
                title={<span className="test-card-title">{test.title}</span>}
                description={
                  <span className="test-card-description">
                    {test.shortDescription}
                  </span>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      {tests.length === 0 && !error && (
        <div className="no-tests">
          <Paragraph className="no-tests-text">
            No personality tests are currently available.
          </Paragraph>
        </div>
      )}
    </section>
  );
}

export default TestSectionAntd;
