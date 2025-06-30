import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Typography, Result } from 'antd';
import { HomeOutlined, ReloadOutlined } from '@ant-design/icons';
import './TestResults.css';

const { Title, Paragraph } = Typography;

function TestResults() {
  const { testSlug } = useParams();
  const navigate = useNavigate();

  return (
    <div className="test-results-container">
      <Result
        status="success"
        title="Test Completed Successfully!"
        subTitle={`Thank you for completing the ${testSlug.replace(/-/g, ' ')} personality test. Your results have been saved.`}
        extra={[
          <Button 
            type="primary" 
            key="home"
            icon={<HomeOutlined />}
            onClick={() => navigate('/')}
            size="large"
          >
            Back to Home
          </Button>,
          <Button 
            key="retake" 
            icon={<ReloadOutlined />}
            onClick={() => navigate(`/tests/${testSlug}`)}
            size="large"
          >
            Retake Test
          </Button>,
        ]}
      >
        <div className="results-content">
          <Card className="results-card">
            <Title level={4}>What's Next?</Title>
            <Paragraph>
              Your personality test results are being processed. You will receive detailed insights about your personality type via email shortly.
            </Paragraph>
            <Paragraph>
              In the meantime, feel free to explore our other personality tests or read our articles about personality psychology.
            </Paragraph>
          </Card>
        </div>
      </Result>
    </div>
  );
}

export default TestResults;
