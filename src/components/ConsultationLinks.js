import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ConsultationService from '../services/ConsultationService';
import moment from 'moment';
import { Button, Card, List, Typography, Spin, message, Empty } from 'antd';
import { CalendarOutlined, LinkOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './ConsultationLinks.css';

const { Title, Text } = Typography;

function ConsultationLinks() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadConsultations = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const data = await ConsultationService.getUserConsultations(user.id);
      setConsultations(data || []);
    } catch (error) {
      message.error('Failed to load consultations. Please try again.');
      console.error('Error loading consultations:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadConsultations();
  }, [loadConsultations]);

  const handleMeetingLinkClick = (link) => {
    if (link && link !== 'string') {
      window.open(link, '_blank');
    } else {
      message.warning('Meeting link is not yet available');
    }
  };

  const formatScheduledTime = (scheduledTime) => {
    if (!scheduledTime) {
      return 'Not scheduled yet';
    }
    return moment(scheduledTime).format('MMMM DD, YYYY at hh:mm A');
  };

  const getConsultationStatus = (consultation) => {
    if (!consultation.scheduledTime) {
      return { text: 'Pending', color: '#faad14' };
    }
    
    const now = moment();
    const scheduled = moment(consultation.scheduledTime);
    
    if (scheduled.isBefore(now)) {
      return { text: 'Completed', color: '#52c41a' };
    } else {
      return { text: 'Scheduled', color: '#1890ff' };
    }
  };

  if (loading) {
    return (
      <div className="consultation-links-container">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
          <p style={{ marginTop: '16px' }}>Loading consultations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="consultation-links-container">
      <div className="consultation-links-header">
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/consultation')}
          style={{ marginBottom: '16px' }}
        >
          Back to Consultation
        </Button>
        <Title level={2}>
          <LinkOutlined /> My Consultation Links
        </Title>
        <Text type="secondary">
          {user?.role === 'PARENT' 
            ? 'View your scheduled consultations and meeting links' 
            : 'View your scheduled consultations and meeting links'
          }
        </Text>
      </div>

      <div className="consultation-links-content">
        {consultations.length === 0 ? (
          <Empty
            description="No consultations found"
            style={{ padding: '50px' }}
          />
        ) : (
          <List
            grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 2 }}
            dataSource={consultations}
            renderItem={(consultation, index) => {
              const status = getConsultationStatus(consultation);
              
              return (
                <List.Item>
                  <Card
                    className="consultation-card"
                    title={
                      <div className="consultation-card-title">
                        <span>Consultation #{consultation.id}</span>
                        <span 
                          className="consultation-status"
                          style={{ color: status.color }}
                        >
                          {status.text}
                        </span>
                      </div>
                    }
                    extra={
                      <Button
                        type="primary"
                        icon={<LinkOutlined />}
                        onClick={() => handleMeetingLinkClick(consultation.googleMeetLink)}
                        disabled={!consultation.googleMeetLink || consultation.googleMeetLink === 'string'}
                      >
                        Join Meeting
                      </Button>
                    }
                  >
                    <div className="consultation-details">
                      <div className="consultation-time">
                        <CalendarOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                        <Text strong>Scheduled: </Text>
                        <Text>{formatScheduledTime(consultation.scheduledTime)}</Text>
                      </div>
                      
                      <div className="consultation-created">
                        <Text type="secondary">
                          Booked on: {moment(consultation.createAt).format('MMMM DD, YYYY')}
                        </Text>
                      </div>

                      {user?.role === 'PARENT' && consultation.users && (
                        <div className="consultation-participants">
                          <Text strong>Participants:</Text>
                          <ul style={{ marginTop: '8px', marginBottom: 0 }}>
                            {consultation.users.map(participant => (
                              <li key={participant.id}>
                                <Text>
                                  {participant.fullname || participant.email} 
                                  <Text type="secondary"> ({participant.role})</Text>
                                </Text>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="consultation-link-info">
                        <Text strong style={{ fontSize: '13px' }}>
                          Meeting Link: 
                        </Text>
                        <br />
                        {consultation.googleMeetLink && consultation.googleMeetLink !== 'string' ? (
                          <Text 
                            copyable 
                            style={{ 
                              fontSize: '12px', 
                              wordBreak: 'break-all',
                              color: '#1890ff'
                            }}
                          >
                            {consultation.googleMeetLink}
                          </Text>
                        ) : (
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            Meeting link will be provided before the session
                          </Text>
                        )}
                      </div>
                    </div>
                  </Card>
                </List.Item>
              );
            }}
          />
        )}
      </div>
    </div>
  );
}

export default ConsultationLinks;
