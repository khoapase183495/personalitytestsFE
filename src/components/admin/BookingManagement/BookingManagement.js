import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Modal, message, Space, Popconfirm, Tag, DatePicker, Select, Input, Row, Col, Statistic, Calendar, Form } from 'antd';
import { EyeOutlined, DeleteOutlined, CalendarOutlined, UserOutlined, ClockCircleOutlined, FilterOutlined, CheckCircleOutlined, VideoCameraOutlined } from '@ant-design/icons';
import AdminBookingService from '../../../services/AdminBookingService';
import ConsultationService from '../../../services/ConsultationService';
import './BookingManagement.css';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Search } = Input;

function BookingManagement() {
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [calendarModalVisible, setCalendarModalVisible] = useState(false);
  const [createMeetingModalVisible, setCreateMeetingModalVisible] = useState(false);
  const [selectedBookingForMeeting, setSelectedBookingForMeeting] = useState(null);
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeBookings: 0,
    deletedBookings: 0,
    upcomingBookings: 0,
    pastBookings: 0,
    todayBookings: 0,
    thisWeekBookings: 0,
    recentBookings: []
  });

  // Filters
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState([]);

  useEffect(() => {
    loadBookings();
    loadStats();
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = bookings.filter(booking => !booking.isDeleted);

    // Search filter
    if (searchText) {
      filtered = filtered.filter(booking =>
        booking.user?.fullname?.toLowerCase().includes(searchText.toLowerCase()) ||
        booking.user?.email?.toLowerCase().includes(searchText.toLowerCase()) ||
        booking.description?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      const now = new Date();
      if (statusFilter === 'upcoming') {
        filtered = filtered.filter(booking => new Date(booking.bookTime) > now);
      } else if (statusFilter === 'past') {
        filtered = filtered.filter(booking => new Date(booking.bookTime) <= now);
      } else if (statusFilter === 'today') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        filtered = filtered.filter(booking => {
          const bookingDate = new Date(booking.bookTime);
          return bookingDate >= today && bookingDate < tomorrow;
        });
      }
    }

    // Date range filter
    if (dateRange && dateRange.length === 2) {
      const [startDate, endDate] = dateRange;
      filtered = filtered.filter(booking => {
        const bookingDate = new Date(booking.bookTime);
        return bookingDate >= startDate.toDate() && bookingDate <= endDate.toDate();
      });
    }

    setFilteredBookings(filtered);
  }, [bookings, searchText, statusFilter, dateRange]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await AdminBookingService.getAllBookings();
      setBookings(response);
    } catch (error) {
      message.error('Failed to load bookings');
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await AdminBookingService.getBookingStats();
      setStats(response);
    } catch (error) {
      console.error('Error loading booking stats:', error);
    }
  };

  const handleViewDetails = (record) => {
    setSelectedBooking(record);
    setDetailModalVisible(true);
  };

  const handleDeleteBooking = async (bookingId) => {
    try {
      await AdminBookingService.deleteBooking(bookingId);
      message.success('Booking deleted successfully');
      loadBookings();
      loadStats();
    } catch (error) {
      message.error('Failed to delete booking');
      console.error('Error deleting booking:', error);
    }
  };

  const handleTestConsultations = async () => {
    try {
      console.log('Testing: Fetching all consultations...');
      const consultations = await ConsultationService.getAllConsultations();
      console.log('Testing: Retrieved consultations:', consultations);
      message.success(`Found ${consultations.length} consultations in database`);
    } catch (error) {
      console.error('Testing: Error fetching consultations:', error);
      message.error('Failed to fetch consultations: ' + error.message);
    }
  };

  const handleCreateMeeting = (record) => {
    setSelectedBookingForMeeting(record);
    setCreateMeetingModalVisible(true);
  };

  const handleSubmitMeeting = async (values) => {
    try {
      if (!selectedBookingForMeeting) {
        message.error('No booking selected');
        return;
      }

      const meetingData = {
        googleMeetURL: values.googleMeetURL || 'https://meet.google.com',
        consultMembersEmail: [values.guestListURL],
        scheduledTime: new Date(values.scheduledTime).toISOString()
      };

      console.log('Frontend: Sending meeting data:', meetingData);
      console.log('Frontend: Selected booking:', selectedBookingForMeeting);

      const response = await ConsultationService.createMeeting(meetingData);
      
      message.success('Meeting created successfully!');
      console.log('Frontend: Meeting response received:', response);
      
      setCreateMeetingModalVisible(false);
      setSelectedBookingForMeeting(null);
      
      // Optionally reload bookings to show updated data
      loadBookings();
      
    } catch (error) {
      message.error('Failed to create meeting: ' + error.message);
      console.error('Frontend: Error creating meeting:', error);
    }
  };

  const getBookingStatus = (bookTime) => {
    const now = new Date();
    const bookingDate = new Date(bookTime);
    
    if (bookingDate > now) {
      return { status: 'upcoming', color: 'blue', text: 'Upcoming' };
    } else {
      return { status: 'past', color: 'default', text: 'Completed' };
    }
  };

  const formatBookingTime = (dateTime) => {
    return new Date(dateTime).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getCalendarData = () => {
    const calendarData = {};
    filteredBookings.forEach(booking => {
      const date = new Date(booking.bookTime).toDateString();
      if (!calendarData[date]) {
        calendarData[date] = [];
      }
      calendarData[date].push(booking);
    });
    return calendarData;
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 50,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'Booked By',
      key: 'fullname',
      width: 100,
      render: (_, record) => (
        <Space>
          <UserOutlined />
          <span>{record.user?.fullname || 'Unknown'}</span>
        </Space>
      ),
      sorter: (a, b) => (a.user?.fullname || '').localeCompare(b.user?.fullname || ''),
    },
    {
      title: 'Email',
      key: 'email',
      width: 140,
      render: (_, record) => (
        <span>{record.user?.email || 'N/A'}</span>
      ),
      sorter: (a, b) => (a.user?.email || '').localeCompare(b.user?.email || ''),
    },
    {
      title: 'Booking Time',
      dataIndex: 'bookTime',
      key: 'bookTime',
      width: 120,
      render: (bookTime) => (
        <Space direction="vertical" size="small">
          <span>{formatBookingTime(bookTime)}</span>
        </Space>
      ),
      sorter: (a, b) => new Date(a.bookTime) - new Date(b.bookTime),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: 120,
      ellipsis: true,
      render: (description) => (
        <span title={description}>
          {description && description.length > 50 ? `${description.substring(0, 50)}...` : description || 'No description'}
        </span>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'createAt',
      key: 'createAt',
      width: 120,
      render: (date) => date ? new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) : 'N/A',
      sorter: (a, b) => new Date(a.createAt || 0) - new Date(b.createAt || 0),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 140,
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
            size="small"
            type="primary"
            ghost
          >
            View
          </Button>
          <Button
            icon={<VideoCameraOutlined />}
            onClick={() => handleCreateMeeting(record)}
            size="small"
            type="default"
            style={{ color: '#52c41a', borderColor: '#52c41a' }}
          >
            Meeting
          </Button>
          <Popconfirm
            title="Are you sure to delete this booking?"
            onConfirm={() => handleDeleteBooking(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              icon={<DeleteOutlined />}
              size="small"
              danger
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="booking-management">
      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Bookings"
              value={stats.totalBookings}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Upcoming Bookings"
              value={stats.upcomingBookings}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Today's Bookings"
              value={stats.todayBookings}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="This Week"
              value={stats.thisWeekBookings}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Search
              placeholder="Search by user name, email or description..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{ width: '100%' }}
            />
          </Col>
          <Col>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 120 }}
              placeholder="Status"
            >
              <Option value="all">All Status</Option>
              <Option value="upcoming">Upcoming</Option>
              <Option value="past">Completed</Option>
              <Option value="today">Today</Option>
            </Select>
          </Col>
          <Col>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              style={{ width: 250 }}
              placeholder={['Start Date', 'End Date']}
            />
          </Col>
          <Col>
            <Button
              icon={<CalendarOutlined />}
              onClick={() => setCalendarModalVisible(true)}
              type="primary"
              ghost
            >
              Calendar View
            </Button>
          </Col>
          <Col>
            <Button
              icon={<FilterOutlined />}
              onClick={() => {
                setSearchText('');
                setStatusFilter('all');
                setDateRange([]);
              }}
            >
              Clear Filters
            </Button>
          </Col>
          <Col>
            <Button
              type="dashed"
              onClick={handleTestConsultations}
            >
              Test DB
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Bookings Table */}
      <Card title={`Booking Management (${filteredBookings.length} bookings)`}>
        <Table
          columns={columns}
          dataSource={filteredBookings}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} bookings`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title="Booking Details"
        visible={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>,
          <Popconfirm
            key="delete"
            title="Are you sure to delete this booking?"
            onConfirm={() => {
              handleDeleteBooking(selectedBooking?.id);
              setDetailModalVisible(false);
            }}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />}>
              Delete Booking
            </Button>
          </Popconfirm>
        ]}
        width={600}
      >
        {selectedBooking && (
          <div className="booking-details">
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <div><strong>Booking ID:</strong> {selectedBooking.id}</div>
              </Col>
              <Col span={12}>
                <div><strong>Created At:</strong> {selectedBooking.createAt ? new Date(selectedBooking.createAt).toLocaleString() : 'N/A'}</div>
              </Col>
            </Row>
            
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <div><strong>Booked By:</strong> {selectedBooking.user?.fullname || 'Unknown'}</div>
              </Col>
              <Col span={12}>
                <div><strong>Email:</strong> {selectedBooking.user?.email || 'N/A'}</div>
              </Col>
            </Row>
            
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <div><strong>Booking Time:</strong> {formatBookingTime(selectedBooking.bookTime)}</div>
              </Col>
              <Col span={12}>
                <div><strong>Created At:</strong> {selectedBooking.createAt ? new Date(selectedBooking.createAt).toLocaleString() : 'N/A'}</div>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <div><strong>Description:</strong></div>
                <Card size="small" style={{ marginTop: 8, backgroundColor: '#f5f5f5' }}>
                  {selectedBooking.description || 'No description provided'}
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </Modal>

      {/* Calendar Modal */}
      <Modal
        title="Booking Calendar"
        visible={calendarModalVisible}
        onCancel={() => setCalendarModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setCalendarModalVisible(false)}>
            Close
          </Button>
        ]}
        width={800}
      >
        <Calendar
          dateCellRender={(value) => {
            const dateStr = value.toDate().toDateString();
            const dayBookings = getCalendarData()[dateStr] || [];
            return (
              <div className="calendar-cell">
                {dayBookings.map(booking => (
                  <div key={booking.id} className="calendar-booking">
                    <Tag color={getBookingStatus(booking.bookTime).color} size="small">
                      {new Date(booking.bookTime).toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: true 
                      })}
                    </Tag>
                    <div className="booking-info">
                      {booking.user?.fullname || 'Unknown'}
                    </div>
                  </div>
                ))}
              </div>
            );
          }}
        />
      </Modal>

      {/* Create Meeting Modal */}
      <Modal
        title="Create Google Meet Consultation"
        visible={createMeetingModalVisible}
        onCancel={() => {
          setCreateMeetingModalVisible(false);
          setSelectedBookingForMeeting(null);
        }}
        footer={null}
        width={600}
      >
        {selectedBookingForMeeting && (
          <div>
            <div style={{ marginBottom: 16, padding: 16, backgroundColor: '#f5f5f5', borderRadius: 6 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <strong>Booking for:</strong> {selectedBookingForMeeting.user?.fullname || 'Unknown'}
                </Col>
                <Col span={12}>
                  <strong>Email:</strong> {selectedBookingForMeeting.user?.email || 'N/A'}
                </Col>
              </Row>
              <Row gutter={16} style={{ marginTop: 8 }}>
                <Col span={12}>
                  <strong>Booking Time:</strong> {formatBookingTime(selectedBookingForMeeting.bookTime)}
                </Col>
                <Col span={12}>
                  <strong>Description:</strong> {selectedBookingForMeeting.description || 'No description'}
                </Col>
              </Row>
            </div>

            <Form
              layout="vertical"
              onFinish={handleSubmitMeeting}
              initialValues={{
                guestListURL: selectedBookingForMeeting.user?.email || '',
                googleMeetURL: 'https://meet.google.com',
                scheduledTime: selectedBookingForMeeting.bookTime ? new Date(selectedBookingForMeeting.bookTime).toISOString().slice(0, 16) : ''
              }}
            >
              <Form.Item
                label="Google Meet URL"
                name="googleMeetURL"
                rules={[
                  { required: true, message: 'Please enter Google Meet URL' },
                  { type: 'url', message: 'Please enter a valid URL' }
                ]}
              >
                <Input 
                  placeholder="Enter Google Meet URL"
                  prefix={<VideoCameraOutlined />}
                />
              </Form.Item>

              <Form.Item
                label="Guest Email"
                name="guestListURL"
                rules={[
                  { required: true, message: 'Please enter guest email' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input 
                  placeholder="Enter guest email for the meeting"
                  prefix={<UserOutlined />}
                  disabled
                  style={{ backgroundColor: '#f5f5f5', color: '#666' }}
                />
              </Form.Item>

              <Form.Item
                label="Scheduled Time"
                name="scheduledTime"
                rules={[
                  { required: true, message: 'Please select meeting time' }
                ]}
              >
                <Input
                  type="datetime-local"
                  placeholder="Select meeting date and time"
                />
              </Form.Item>

              <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
                <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                  <Button onClick={() => {
                    setCreateMeetingModalVisible(false);
                    setSelectedBookingForMeeting(null);
                  }}>
                    Cancel
                  </Button>
                  <Button 
                    type="primary" 
                    htmlType="submit"
                    icon={<VideoCameraOutlined />}
                  >
                    Create Google Meet
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default BookingManagement;
