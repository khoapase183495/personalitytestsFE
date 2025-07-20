import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Typography, Spin, Alert, Button } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import TestSessionService from '../../services/TestSessionService';

const { Title, Paragraph } = Typography;

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
      <div style={{ textAlign: 'center', marginTop: 48 }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48, color: '#3d348b' }} spin />} />
        <Paragraph style={{ marginTop: 16, color: '#6c757d', fontSize: '1.1rem' }}>
          Loading test result...
        </Paragraph>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error"
        description={error}
        type="error"
        showIcon
        action={
          <Button type="primary" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        }
      />
    );
  }

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 8 }}>
      <Title level={2} style={{ color: '#3d348b' }}>Your Test Result</Title>
      <Paragraph style={{ whiteSpace: 'pre-line', fontSize: '1.1rem' }}>
        {result}
      </Paragraph>
      <Button type="primary" onClick={() => navigate('/')}>
        Back to Home
      </Button>
    </div>
  );
}

export default TestResults;
