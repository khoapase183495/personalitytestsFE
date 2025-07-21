import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { 
  Card, 
  Typography, 
  Modal, 
  message, 
  Button, 
  Form, 
  Input, 
  Space,
  Divider,
  Avatar,
  Tag,
  Row,
  Col
} from "antd";
import { 
  UserOutlined, 
  EditOutlined, 
  KeyOutlined, 
  MailOutlined, 
  PhoneOutlined,
  CrownOutlined
} from "@ant-design/icons";
import ProfileService from "../services/ProfileService";
import "./UserProfile.css";

const { Title, Paragraph, Text } = Typography;

function UserProfile() {
  const { user } = useAuth();
  const [editVisible, setEditVisible] = useState(false);
  const [resetVisible, setResetVisible] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const [editForm] = Form.useForm();
  const [resetForm] = Form.useForm();

  if (!user) {
    return (
      <div className="user-profile-container">
        <Card className="user-profile-card">
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <UserOutlined style={{ fontSize: "4rem", color: "#d9d9d9" }} />
            <Title level={3} style={{ marginTop: "1rem" }}>User not found</Title>
            <Paragraph>Please log in to view your profile.</Paragraph>
          </div>
        </Card>
      </div>
    );
  }

  const handleEditSubmit = async (values) => {
    setEditLoading(true);
    try {
      // Check if email is being changed and if it already exists
      if (values.email !== user.email) {
        const emailExists = await ProfileService.checkEmailExists(values.email, user.id);
        if (emailExists) {
          message.error("Email already registered. Please use a different email.");
          setEditLoading(false);
          return;
        }
      }

      await ProfileService.updateAccount(user.id, values);
      message.success("Profile updated successfully!");
      setEditVisible(false);

      // Update localStorage with new user info
      const updatedUser = {
        ...user,
        email: values.email,
        fullName: values.fullName,
        phone: values.phone,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      message.error(error.message || "Failed to update profile.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleResetSubmit = async (values) => {
    setResetLoading(true);
    try {
      await ProfileService.resetPassword(values.newPassword);
      message.success("Password reset successfully!");
      setResetVisible(false);
      resetForm.resetFields();
    } catch (error) {
      message.error(error.message || "Failed to reset password.");
    } finally {
      setResetLoading(false);
    }
  };

  const openEditModal = () => {
    editForm.setFieldsValue({
      email: user.email,
      fullName: user.fullName, // Changed from username to fullName
      phone: user.phone || "",
    });
    setEditVisible(true);
  };

  const getRoleColor = (role) => {
    switch (role?.toUpperCase()) {
      case 'ADMIN': return 'red';
      case 'PARENT': return 'blue';
      case 'STUDENT': return 'green';
      default: return 'default';
    }
  };

  const getRoleIcon = (role) => {
    switch (role?.toUpperCase()) {
      case 'ADMIN': return <CrownOutlined />;
      case 'PARENT': return <UserOutlined />;
      case 'STUDENT': return <UserOutlined />;
      default: return <UserOutlined />;
    }
  };

  return (
    <div className="user-profile-container">
      <div className="profile-wrapper">
        <Card className="user-profile-card">
          <div className="profile-header">
  <Avatar 
    size={80} 
    icon={<UserOutlined />} 
    className="profile-avatar"
  />
  <div className="profile-header-info">
    <Title level={2} className="profile-name">
      {user.fullName || user.email || "User"}
    </Title>
    <Tag 
      icon={getRoleIcon(user.role)}
      color={getRoleColor(user.role)}
      className="profile-role-tag"
    >
      {user.role?.name || user.role || "User"}
    </Tag>
  </div>
</div>

          <Divider className="profile-divider" />

          <div className="profile-details">
            <Row gutter={[24, 16]}>
              <Col xs={24} sm={12}>
                <div className="profile-detail-item">
                  <MailOutlined className="profile-detail-icon" />
                  <div>
                    <Text className="profile-detail-label">Email</Text>
                    <Paragraph className="profile-detail-value">
                      {user.email}
                    </Paragraph>
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div className="profile-detail-item">
                  <UserOutlined className="profile-detail-icon" />
                  <div>
                    <Text className="profile-detail-label">Full Name</Text>
                    <Paragraph className="profile-detail-value">
                      {user.fullName || "Not provided"}
                    </Paragraph>
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div className="profile-detail-item">
                  <PhoneOutlined className="profile-detail-icon" />
                  <div>
                    <Text className="profile-detail-label">Phone</Text>
                    <Paragraph className="profile-detail-value">
                      {user.phone || "Not provided"}
                    </Paragraph>
                  </div>
                </div>
              </Col>
            </Row>
          </div>

          <Divider className="profile-divider" />

          <div className="profile-actions">
            <Space size="large" wrap>
              <Button 
                type="primary" 
                icon={<EditOutlined />}
                size="large"
                onClick={openEditModal}
                className="profile-action-btn primary"
              >
                Edit Profile
              </Button>
              <Button 
                icon={<KeyOutlined />}
                size="large"
                onClick={() => setResetVisible(true)}
                className="profile-action-btn secondary"
              >
                Change Password
              </Button>
            </Space>
          </div>
        </Card>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        title={
          <div className="modal-title">
            <EditOutlined /> Edit Profile
          </div>
        }
        open={editVisible}
        onCancel={() => setEditVisible(false)}
        footer={null}
        centered
        destroyOnClose
        className="profile-modal"
        width={500}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditSubmit}
          className="profile-form"
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Please enter a valid email" }
            ]}
          >
            <Input 
              prefix={<MailOutlined />} 
              placeholder="Enter your email"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="fullName"
            label="Full Name"
            rules={[{ required: true, message: "Please enter your full name" }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Enter your full name"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone Number"
          >
            <Input 
              prefix={<PhoneOutlined />} 
              placeholder="Enter your phone number"
              size="large"
            />
          </Form.Item>

          <Form.Item className="form-actions">
            <Space>
              <Button 
                onClick={() => setEditVisible(false)}
                size="large"
              >
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={editLoading}
                size="large"
                className="submit-btn"
              >
                Save Changes
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        title={
          <div className="modal-title">
            <KeyOutlined /> Change Password
          </div>
        }
        open={resetVisible}
        onCancel={() => setResetVisible(false)}
        footer={null}
        centered
        destroyOnClose
        className="profile-modal"
        width={450}
      >
        <Form
          form={resetForm}
          layout="vertical"
          onFinish={handleResetSubmit}
          className="profile-form"
        >
          <Form.Item
            name="newPassword"
            label="New Password"
            rules={[
              { required: true, message: "Please enter your new password" },
              { min: 8, message: "Password must be at least 8 characters long" },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  
                  // Check for uppercase letter
                  if (!/[A-Z]/.test(value)) {
                    return Promise.reject(new Error('Password must contain at least 1 uppercase letter'));
                  }
                  
                  // Check for lowercase letter
                  if (!/[a-z]/.test(value)) {
                    return Promise.reject(new Error('Password must contain at least 1 lowercase letter'));
                  }
                  
                  // Check for number
                  if (!/[0-9]/.test(value)) {
                    return Promise.reject(new Error('Password must contain at least 1 number'));
                  }
                  
                  // Check for special character
                  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value)) {
                    return Promise.reject(new Error('Password must contain at least 1 special character'));
                  }
                  
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input.Password 
              prefix={<KeyOutlined />}
              placeholder="Enter new password (8+ chars, 1 uppercase, 1 lowercase, 1 number, 1 special char)"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: "Please confirm your password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password 
              prefix={<KeyOutlined />}
              placeholder="Confirm new password"
              size="large"
            />
          </Form.Item>

          <Form.Item className="form-actions">
            <Space>
              <Button 
                onClick={() => setResetVisible(false)}
                size="large"
              >
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={resetLoading}
                size="large"
                className="submit-btn"
              >
                Change Password
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default UserProfile;