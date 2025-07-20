import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  List, 
  Button, 
  Modal, 
  Form, 
  DatePicker, 
  Input, 
  message, 
  Typography, 
  Space, 
  Tag, 
  Divider,
  Empty,
  Spin,
  Select
} from 'antd';
import { 
  CalendarOutlined, 
  ClockCircleOutlined, 
  PlusOutlined, 
  UserOutlined,
  BookOutlined 
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import BookingService from '../services/BookingService';
import ParentService from '../services/ParentService';
import moment from 'moment';
import './Consultation.css';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

function Consultation() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form] = Form.useForm();

  const loadStudentBookings = useCallback(async () => {
    if (!user?.id) return;
    try {
      const bookingsData = await BookingService.getBookingsByUserId(user.id);
      setBookings(bookingsData || []);
    } catch (error) {
      console.error('Failed to load bookings:', error);
      setBookings([]);
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
        const bookingsData = await BookingService.getBookingsByUserId(firstChild.id);
        setBookings(bookingsData || []);
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error('Failed to load parent data:', error);
      setChildren([]);
      setBookings([]);
    }
  }, [user?.id]);

  const loadData = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      if (user.role === 'STUDENT') {
        await loadStudentBookings();
      } else if (user.role === 'PARENT') {
        await loadParentData();
      }
    } catch (error) {
      message.error('Failed to load data: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [user, loadStudentBookings, loadParentData]);

  useEffect(() => {
    if (!user) {
      // Reset state when user logs out
      setBookings([]);
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
      const bookingsData = await BookingService.getBookingsByUserId(childId);
      setBookings(bookingsData || []);
    } catch (error) {
      message.error('Failed to load child bookings: ' + error.message);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBooking = async (values) => {
    setCreating(true);
    try {
      const bookingData = {
        bookTime: values.bookTime.toISOString(),
        description: values.description
      };

      await BookingService.createBooking(bookingData);
      message.success('Booking created successfully!');
      setModalVisible(false);
      form.resetFields();
      await loadData();
    } catch (error) {
      message.error('Failed to create booking: ' + error.message);
    } finally {
      setCreating(false);
    }
  };

  const renderBookingCard = (booking) => (
    <Card 
      key={booking.id}
      className="booking-card"
      hoverable
    >
      <div className="booking-header">
        <div className="booking-info">
          <Title level={4} className="booking-title">
            <BookOutlined /> Consultation Booking
          </Title>
          <Space direction="vertical" size="small">
            <Text className="booking-time">
              <ClockCircleOutlined /> {moment(booking.bookTime).format('MMMM Do YYYY, h:mm A')}
            </Text>
            <Text className="booking-created">
              <CalendarOutlined /> Created: {moment(booking.createAt).format('MMMM Do YYYY')}
            </Text>
          </Space>
        </div>
        <Tag color="blue" className="booking-status">Active</Tag>
      </div>
      
      <Divider />
      
      <div className="booking-content">
        <Text strong>Description:</Text>
        <Paragraph className="booking-description">
          {booking.description || 'No description provided'}
        </Paragraph>
      </div>
    </Card>
  );

  if (!user) {
    return (
      <div className="consultation-container">
        <Card className="consultation-card">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <UserOutlined style={{ fontSize: '4rem', color: '#d9d9d9' }} />
            <Title level={3} style={{ marginTop: '1rem' }}>Access Denied</Title>
            <Paragraph>Please log in to view consultation bookings.</Paragraph>
          </div>
        </Card>
      </div>
    );
  }

  if (user.role !== 'STUDENT' && user.role !== 'PARENT') {
    return (
      <div className="consultation-container">
        <Card className="consultation-card">
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
    <div className="consultation-container">
      <div className="consultation-wrapper">
        <Card className="consultation-card">
          <div className="consultation-header">
            <Title level={2} className="consultation-title">
              <BookOutlined /> Consultation Bookings
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

            {user.role === 'STUDENT' && (
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setModalVisible(true)}
                className="create-booking-btn"
              >
                Book Consultation
              </Button>
            )}
          </div>

          <Divider />

          <div className="consultation-content">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <Spin size="large" />
              </div>
            ) : bookings.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  user.role === 'PARENT' 
                    ? selectedChild 
                      ? `No bookings found for ${selectedChild.fullName || selectedChild.email}`
                      : 'No children found'
                    : 'No consultation bookings yet'
                }
              >
                {user.role === 'STUDENT' && (
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={() => setModalVisible(true)}
                  >
                    Create Your First Booking
                  </Button>
                )}
              </Empty>
            ) : (
              <List
                grid={{ gutter: 16, xs: 1, sm: 1, md: 1, lg: 1, xl: 1 }}
                dataSource={bookings}
                renderItem={renderBookingCard}
                className="bookings-list"
              />
            )}
          </div>
        </Card>
      </div>

      {/* Create Booking Modal */}
      <Modal
        title={
          <div className="modal-title">
            <PlusOutlined /> Book Consultation
          </div>
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        centered
        destroyOnClose
        className="consultation-modal"
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateBooking}
          className="booking-form"
        >
          <Form.Item
            name="bookTime"
            label="Consultation Date & Time"
            rules={[
              { required: true, message: "Please select date and time" }
            ]}
          >
            <DatePicker 
              showTime
              placeholder="Select date and time"
              size="large"
              style={{ width: '100%' }}
              disabledDate={(current) => current && current < moment().startOf('day')}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[
              { required: true, message: "Please enter a description" }
            ]}
          >
            <TextArea 
              placeholder="Describe what you'd like to discuss in the consultation"
              size="large"
              rows={4}
            />
          </Form.Item>

          <Form.Item className="form-actions">
            <Space>
              <Button 
                onClick={() => {
                  setModalVisible(false);
                  form.resetFields();
                }}
                size="large"
              >
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={creating}
                size="large"
                className="submit-btn"
              >
                Book Consultation
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Consultation;