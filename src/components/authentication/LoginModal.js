import React from 'react';
import { Modal, Button, Typography, Space } from 'antd';
import { LoginOutlined, UserAddOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './LoginModal.css';

const { Title, Text } = Typography;

function LoginModal({ visible, onClose, testTitle }) {
  const navigate = useNavigate();

  const handleLogin = () => {
    onClose();
    navigate('/login');
  };

  const handleRegister = () => {
    onClose();
    navigate('/register');
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
      className="login-modal"
      width={480}
      closable={true}
    >
      <div className="login-modal-content">
        <div className="login-modal-icon">
          <LockOutlined />
        </div>
        
        <Title level={3} className="login-modal-title">
          Login Required
        </Title>
        
        <Text className="login-modal-description">
          You need to be logged in to take the personality test{testTitle && `: "${testTitle}"`}. 
          Please log in to your account or create a new one to get started.
        </Text>

        <div className="login-modal-benefits">
          <Text className="benefits-title">Why create an account?</Text>
          <ul className="benefits-list">
            <li>Save your test results</li>
            <li>Track your personality insights over time</li>
            <li>Get personalized recommendations</li>
            <li>Access exclusive content and tests</li>
          </ul>
        </div>

        <Space direction="vertical" size="middle" className="login-modal-actions">
          <Button
            type="primary"
            size="large"
            icon={<LoginOutlined />}
            onClick={handleLogin}
            className="login-button"
            block
          >
            Log In to Your Account
          </Button>
          
          <Button
            type="default"
            size="large"
            icon={<UserAddOutlined />}
            onClick={handleRegister}
            className="register-button"
            block
          >
            Create New Account
          </Button>
        </Space>

        <Text className="login-modal-footer">
          It's free and takes less than a minute!
        </Text>
      </div>
    </Modal>
  );
}

export default LoginModal;
