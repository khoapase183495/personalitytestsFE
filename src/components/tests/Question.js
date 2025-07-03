import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, Radio, Button, Progress, Alert, Spin, Typography, Row, Col } from 'antd';
import { ArrowLeftOutlined, ArrowRightOutlined, CheckOutlined, LoadingOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import QuestionService from '../../services/QuestionService';
import TestService from '../../services/TestService';
import TestSessionService from '../../services/TestSessionService';
import './Question.css';

const { Title, Text } = Typography;

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function Question() {
  const { testSlug } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [testInfo, setTestInfo] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  
  const query = useQuery();
  const sessionId = query.get('sessionId');
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    const loadTestAndQuestions = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load test info first
        const tests = await TestService.getAllTests();
        const currentTest = tests.find(test => 
          test.title.toLowerCase().replace(/\s+/g, '-') === testSlug
        );

        if (!currentTest) {
          setError('Test not found');
          return;
        }

        setTestInfo(currentTest);

        // Load questions for this test
        const questionsData = await QuestionService.getQuestionsByTestId(currentTest.id);
        setQuestions(questionsData);

      } catch (error) {
        console.error('Error loading test and questions:', error);
        setError(error.message || 'Failed to load test questions');
      } finally {
        setLoading(false);
      }
    };

    loadTestAndQuestions();
  }, [testSlug, isAuthenticated, navigate]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
    
    // Add a subtle success feedback
    const selectedOption = document.querySelector(`input[value="${value}"]`);
    if (selectedOption) {
      selectedOption.closest('.radio-option-horizontal').style.transform = 'scale(1.3)';
      setTimeout(() => {
        selectedOption.closest('.radio-option-horizontal').style.transform = '';
      }, 200);
    }
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      await TestSessionService.completeSession(sessionId, answers);
      // Navigate to results page, truyền sessionId
      navigate(`/tests/${testSlug}/results?sessionId=${sessionId}`);
    } catch (error) {
      setError('Failed to submit answers. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getProgressPercentage = () => {
    const answeredQuestions = Object.keys(answers).length;
    return (answeredQuestions / questions.length) * 100;
  };

  const isCurrentQuestionAnswered = () => {
    const currentQuestion = questions[currentQuestionIndex];
    return currentQuestion && answers[currentQuestion.id] !== undefined;
  };

  const areAllQuestionsAnswered = () => {
    return questions.length > 0 && Object.keys(answers).length === questions.length;
  };

  if (loading) {
    return (
      <div className="question-loading">
        <Spin 
          indicator={<LoadingOutlined style={{ fontSize: 48, color: '#3d348b' }} spin />}
          size="large"
        />
        <Text style={{ marginTop: 16, display: 'block', fontSize: '1.1rem', color: '#6c757d' }}>
          Loading test questions...
        </Text>
      </div>
    );
  }

  if (error) {
    return (
      <div className="question-error">
        <Alert
          message="Error Loading Test"
          description={error}
          type="error"
          showIcon
          action={
            <Button type="primary" onClick={() => navigate('/')}>
              Go Back Home
            </Button>
          }
        />
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="question-error">
        <Alert
          message="No Questions Available"
          description="This test doesn't have any questions yet."
          type="warning"
          showIcon
          action={
            <Button type="primary" onClick={() => navigate('/')}>
              Go Back Home
            </Button>
          }
        />
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="question-container">
      <div className="question-header">
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} className="test-title">
              {testInfo?.title}
            </Title>
            <Text className="question-counter">
              Question {currentQuestionIndex + 1} of {questions.length}
            </Text>
          </Col>
          <Col>
            <Button 
              type="text" 
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/')}
              className="back-button"
            >
              Back to Home
            </Button>
          </Col>
        </Row>
        
        <Progress 
          percent={getProgressPercentage()} 
          strokeColor="#3d348b"
          trailColor="#f0f0f0"
          showInfo={false}
          className="progress-bar"
        />
      </div>

      <div className="question-content">
        <Card className="question-card">
          <div className="question-number-badge">
            {currentQuestionIndex + 1}
          </div>
          <Title level={3} className="question-text">
            {currentQuestion.content}
          </Title>
          
          <div className="answer-options">
            <div className="answer-scale">
              <Radio.Group
                value={answers[currentQuestion.id]}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                className="radio-group-horizontal"
              >
                <div className="radio-options-with-labels">
                  <span className="scale-label-left">Strongly Disagree</span>
                  <div className="radio-options-container">
                    <Radio value={1} className="radio-option-horizontal" />
                    <Radio value={2} className="radio-option-horizontal" />
                    <Radio value={3} className="radio-option-horizontal" />
                    <Radio value={4} className="radio-option-horizontal" />
                    <Radio value={5} className="radio-option-horizontal" />
                  </div>
                  <span className="scale-label-right">Strongly Agree</span>
                </div>
              </Radio.Group>
            </div>
          </div>
        </Card>
      </div>

      <div className="question-navigation">
        <Row justify="space-between" align="middle">
          <Col>
            <Button
              type="default"
              icon={<ArrowLeftOutlined />}
              onClick={goToPreviousQuestion}
              disabled={currentQuestionIndex === 0}
              size="large"
            >
              Previous
            </Button>
          </Col>
          
          <Col>
            {currentQuestionIndex === questions.length - 1 ? (
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={handleSubmit}
                disabled={!areAllQuestionsAnswered()}
                loading={submitting}
                size="large"
                className="submit-button"
              >
                Submit Test
              </Button>
            ) : (
              <Button
                type="primary"
                icon={<ArrowRightOutlined />}
                onClick={goToNextQuestion}
                disabled={!isCurrentQuestionAnswered()}
                size="large"
              >
                Next
              </Button>
            )}
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default Question;
