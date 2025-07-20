import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Button,
  Space,
  message,
  Row,
  Col,
  Statistic,
  Input,
  DatePicker
} from 'antd';
import {
  VideoCameraOutlined,
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  FilterOutlined
} from '@ant-design/icons';
import AdminConsultationService from '../../../services/AdminConsultationService';
import './ConsultationManagement.css';

const { Search } = Input;
const { RangePicker } = DatePicker;

function ConsultationManagement() {
  const [consultations, setConsultations] = useState([]);
  const [filteredConsultations, setFilteredConsultations] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Filters
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState([]);
  
  // Stats
  const [stats, setStats] = useState({
    totalConsultations: 0,
    activeConsultations: 0,
    upcomingConsultations: 0,
    todayConsultations: 0
  });

  useEffect(() => {
    loadConsultations();
  }, []);

  const loadConsultations = async () => {
    setLoading(true);
    try {
      console.log('Loading consultations...');
      const response = await AdminConsultationService.getAllConsultations();
      console.log('Consultations loaded:', response);
      
      if (response && Array.isArray(response)) {
        // Data is already transformed in the service
        setConsultations(response);
      } else {
        console.warn('Unexpected response format:', response);
        setConsultations([]);
      }
    } catch (error) {
      console.error('Error loading consultations:', error);
      message.error('Failed to load consultations: ' + error.message);
      setConsultations([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = React.useCallback(() => {
    let filtered = [...consultations];

    // Search filter
    if (searchText) {
      filtered = filtered.filter(consultation =>
        consultation.users?.some(user => 
          user.email?.toLowerCase().includes(searchText.toLowerCase()) ||
          user.fullname?.toLowerCase().includes(searchText.toLowerCase()) ||
          user.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
          user.username?.toLowerCase().includes(searchText.toLowerCase())
        )
      );
    }

    // Date range filter
    if (dateRange && dateRange.length === 2) {
      filtered = filtered.filter(consultation => {
        const consultationDate = new Date(consultation.scheduledTime);
        return consultationDate >= dateRange[0].startOf('day') && 
               consultationDate <= dateRange[1].endOf('day');
      });
    }

    setFilteredConsultations(filtered);
  }, [consultations, searchText, dateRange]);

  const calculateStats = React.useCallback(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    const stats = {
      totalConsultations: consultations.length,
      activeConsultations: consultations.filter(c => {
        const consultationDate = new Date(c.scheduledTime);
        const timeDiff = consultationDate - now;
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        return hoursDiff > -1 && hoursDiff <= 1; // Active within ±1 hour
      }).length,
      upcomingConsultations: consultations.filter(c => {
        const consultationDate = new Date(c.scheduledTime);
        return consultationDate > now;
      }).length,
      todayConsultations: consultations.filter(c => {
        const consultationDate = new Date(c.scheduledTime);
        return consultationDate >= todayStart && consultationDate < todayEnd;
      }).length
    };

    setStats(stats);
  }, [consultations]);

  useEffect(() => {
    applyFilters();
    calculateStats();
  }, [applyFilters, calculateStats]);

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'Participants',
      key: 'participants',
      width: 200,
      render: (_, record) => (
        <Space>
          <UserOutlined />
          <span>
            {record.users && record.users.length > 0 
              ? record.users[0].fullname || record.users[0].fullName || 'No name' 
              : 'No participants'
            }
          </span>
        </Space>
      ),
      sorter: (a, b) => {
        const aName = a.users && a.users.length > 0 ? (a.users[0].fullname || a.users[0].fullName || '') : '';
        const bName = b.users && b.users.length > 0 ? (b.users[0].fullname || b.users[0].fullName || '') : '';
        return aName.localeCompare(bName);
      },
    },
    {
      title: 'Scheduled Time',
      dataIndex: 'scheduledTime',
      key: 'scheduledTime',
      width: 180,
      render: (scheduledTime) => (
        <span>{formatDateTime(scheduledTime)}</span>
      ),
      sorter: (a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime),
    },
    {
      title: 'Created At',
      dataIndex: 'createAt',
      key: 'createAt',
      width: 150,
      render: (createAt) => createAt ? formatDateTime(createAt) : 'N/A',
      sorter: (a, b) => new Date(a.createAt || 0) - new Date(b.createAt || 0),
    },
  ];

  return (
    <div className="consultation-management">
      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Consultations"
              value={stats.totalConsultations}
              prefix={<VideoCameraOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Now"
              value={stats.activeConsultations}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Upcoming"
              value={stats.upcomingConsultations}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Today's Meetings"
              value={stats.todayConsultations}
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
              placeholder="Search by participant name/email..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{ width: '100%' }}
            />
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
              icon={<ReloadOutlined />}
              onClick={loadConsultations}
              type="primary"
              ghost
            >
              Refresh
            </Button>
          </Col>
          <Col>
            <Button
              icon={<FilterOutlined />}
              onClick={() => {
                setSearchText('');
                setDateRange([]);
              }}
            >
              Clear Filters
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Consultations Table */}
      <Card title={`Consultation Management (${filteredConsultations.length} consultations)`}>
        <Table
          columns={columns}
          dataSource={filteredConsultations}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} consultations`,
          }}
          scroll={{ x: 800 }}
          rowClassName={(record) => {
            const now = new Date();
            const consultationDate = new Date(record.scheduledTime);
            const timeDiff = consultationDate - now;
            const hoursDiff = timeDiff / (1000 * 60 * 60);
            return (hoursDiff > -1 && hoursDiff <= 1) ? 'active-consultation-row' : '';
          }}
        />
      </Card>
    </div>
  );
}

export default ConsultationManagement;
