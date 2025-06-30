import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Spin, Alert, Typography, Breadcrumb } from 'antd';
import { PlayCircleOutlined, HomeOutlined, LoadingOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import TestService from '../../services/TestService';
import LoginModal from '../authentication/LoginModal';
import './TestDetail.css';

const { Title, Paragraph } = Typography;

function TestDetail() {
  const { testSlug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const loadTestDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('TestDetail: Loading test details for slug:', testSlug);
        const testsData = await TestService.getAllTests();
        
        // Find test by slug
        const foundTest = testsData.find(t => 
          t.title.toLowerCase().replace(/\s+/g, '-') === testSlug
        );
        
        if (foundTest) {
          setTest({
            ...foundTest,
            fullDescription: getFullDescription(foundTest.title, foundTest.description)
          });
        } else {
          setError('Test not found');
        }
      } catch (error) {
        console.error('TestDetail: Failed to load test:', error);
        setError('Failed to load test details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (testSlug) {
      loadTestDetail();
    }
  }, [testSlug]);

  const getFullDescription = (title, originalDescription) => {
    const titleLower = title.toLowerCase();
    
    // Extended descriptions for each test type
    if (titleLower.includes('mbti')) {
      return `${originalDescription}\n\nThe Myers-Briggs Type Indicator (MBTI) is one of the world's most popular personality assessments. It helps you understand your preferences in four key areas: where you focus your attention (Extraversion vs Introversion), how you take in information (Sensing vs Intuition), how you make decisions (Thinking vs Feeling), and how you approach the outside world (Judging vs Perceiving).\n\nThis comprehensive assessment will help you:\n• Understand your natural preferences and strengths\n• Improve communication with others\n• Make better career decisions\n• Enhance team dynamics\n• Develop leadership skills\n\nThe test takes approximately 15-20 minutes to complete and provides detailed insights into your personality type.`;
    }
    
    if (titleLower.includes('enneagram')) {
      return `${originalDescription}\n\nThe Enneagram is a powerful system that describes nine distinct personality types, each with their own motivations, fears, and behavioral patterns. Unlike other personality tests, the Enneagram focuses on your core motivations and what drives your behavior.\n\nThis assessment will help you:\n• Discover your core motivations and fears\n• Understand your stress and growth patterns\n• Improve relationships and communication\n• Develop emotional intelligence\n• Break free from limiting patterns\n\nEach of the nine types has a unique way of seeing and interacting with the world. Understanding your type can be transformative for personal growth and relationships.`;
    }
    
    if (titleLower.includes('career') || titleLower.includes('holland')) {
      return `${originalDescription}\n\nThe Holland Career Interest Test, also known as the RIASEC model, helps you identify careers that align with your interests and values. It categorizes careers into six main types: Realistic, Investigative, Artistic, Social, Enterprising, and Conventional.\n\nThis assessment will help you:\n• Identify career paths that match your interests\n• Understand your work style preferences\n• Explore new career possibilities\n• Make informed educational decisions\n• Plan your professional development\n\nWhether you're a student choosing a major, someone considering a career change, or a professional looking to advance, this test provides valuable insights into careers where you're likely to find satisfaction and success.`;
    }
    
    if (titleLower.includes('big five')) {
      return `${originalDescription}\n\nThe Big Five personality test measures five major dimensions of personality: Openness to Experience, Conscientiousness, Extraversion, Agreeableness, and Neuroticism. This model is widely used in academic research and is considered one of the most scientifically valid personality assessments.\n\nThis assessment will help you:\n• Understand your personality across five key dimensions\n• Gain insights into your behavior patterns\n• Improve self-awareness and personal development\n• Better understand how others perceive you\n• Make informed decisions about relationships and career\n\nThe Big Five model provides a comprehensive view of personality that can help you understand yourself and others more effectively.`;
    }
    
    return originalDescription;
  };

  const handleTakeTest = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
    } else {
      // Navigate to test questions page
      navigate(`/tests/${testSlug}`);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="test-detail-container">
        <div className="test-detail-loading">
          <Spin 
            indicator={<LoadingOutlined style={{ fontSize: 48, color: '#3d348b' }} spin />}
            size="large"
          />
          <Paragraph style={{ marginTop: 16, color: '#6c757d', fontSize: '1.1rem' }}>
            Loading test details...
          </Paragraph>
        </div>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="test-detail-container">
        <Alert
          message="Test Not Found"
          description={error || 'The requested test could not be found.'}
          type="error"
          showIcon
          action={
            <Button 
              type="primary"
              icon={<HomeOutlined />}
              onClick={handleBackToHome}
            >
              Back to Home
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="test-detail-container">
      <div className="test-detail-content">
        <Breadcrumb className="test-breadcrumb">
          <Breadcrumb.Item>
            <HomeOutlined />
            <span onClick={handleBackToHome} style={{ cursor: 'pointer', marginLeft: '8px' }}>
              Home
            </span>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Tests</Breadcrumb.Item>
          <Breadcrumb.Item>{test.title}</Breadcrumb.Item>
        </Breadcrumb>

        <Card className="test-detail-card">
          <div className="test-detail-header">
            <div className="test-detail-info">
              <Title level={1} className="test-detail-title">
                {test.title}
              </Title>
              <div className="test-detail-description">
                {test.fullDescription.split('\n').map((paragraph, index) => (
                  <Paragraph key={index} className="test-paragraph">
                    {paragraph}
                  </Paragraph>
                ))}
              </div>
            </div>
          </div>

          <div className="test-detail-actions">
            <Button
              type="primary"
              size="large"
              icon={<PlayCircleOutlined />}
              onClick={handleTakeTest}
              className="take-test-button"
            >
              Take Test Now
            </Button>
            <Button
              size="large"
              icon={<HomeOutlined />}
              onClick={handleBackToHome}
              className="back-home-button"
            >
              Back to Home
            </Button>
          </div>
        </Card>

        <LoginModal
          visible={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          testTitle={test?.title}
        />
      </div>
    </div>
  );
}

export default TestDetail;
