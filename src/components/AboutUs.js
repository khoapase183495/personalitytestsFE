import React from 'react';
import { Card, Typography, Row, Col, Timeline, Space } from 'antd';
import { 
  TrophyOutlined, 
  HeartOutlined, 
  BulbOutlined,
  AimOutlined,
  CheckCircleOutlined,
  UserOutlined,
  BookOutlined,
  RocketOutlined,
  TeamOutlined
} from '@ant-design/icons';
import './AboutUs.css';

const { Title, Paragraph, Text } = Typography;

function AboutUs() {
  const values = [
    {
      icon: <HeartOutlined />,
      title: "Student-Centered",
      description: "We put students at the heart of everything we do, ensuring their career development is our top priority."
    },
    {
      icon: <BulbOutlined />,
      title: "Innovation",
      description: "Constantly improving our assessment methods using the latest psychological research and technology."
    },
    {
      icon: <AimOutlined />,
      title: "Accuracy",
      description: "Providing precise and reliable personality assessments to guide students toward their ideal careers."
    },
    {
      icon: <TeamOutlined />,
      title: "Collaboration",
      description: "Working together with educators, parents, and students to create the best career guidance experience."
    }
  ];

  const features = [
    "Comprehensive personality assessments",
    "Career matching based on psychological profiles",
    "Student progress tracking for parents",
    "Expert-designed test questions",
    "Detailed career recommendations",
    "Secure and confidential results"
  ];

  return (
    <div className="about-us-container">
      {/* Hero Section */}
      <Card className="hero-card">
        <div className="hero-content">
          <Title level={1} className="hero-title">
            About Us
          </Title>
          <Paragraph className="hero-subtitle">
            Empowering Vietnamese students to discover their ideal career paths through 
            scientifically-backed personality assessments and expert guidance.
          </Paragraph>
        </div>
      </Card>

      {/* Mission Section */}
      <Card className="mission-card">
        <div className="mission-content">
          <Title level={2} className="section-title center">
            <RocketOutlined className="section-icon" />
            Our Mission
          </Title>
          <Paragraph className="mission-text">
            At PersonalityVN, we believe every student has unique talents and potential. 
            Our mission is to help Vietnamese students discover their strengths, understand 
            their personality types, and find career paths that align with their natural abilities.
          </Paragraph>
          <Paragraph className="mission-text">
            Through advanced personality testing and career matching, we bridge the gap 
            between education and employment, ensuring students make informed decisions 
            about their future careers.
          </Paragraph>
        </div>
      </Card>

      {/* Values Section */}
      <Card className="values-card">
        <Title level={2} className="section-title center">
          <HeartOutlined className="section-icon" />
          Our Core Values
        </Title>
        <Row gutter={[24, 24]}>
          {values.map((value, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card className="value-item">
                <div className="value-icon">
                  {value.icon}
                </div>
                <Title level={4} className="value-title">
                  {value.title}
                </Title>
                <Paragraph className="value-description">
                  {value.description}
                </Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* How It Works Section */}
      <Card className="how-it-works-card">
        <Title level={2} className="section-title center">
          <BookOutlined className="section-icon" />
          How PersonalityVN Works
        </Title>
        <Row gutter={[48, 32]} align="middle">
          <Col xs={24} lg={12}>
            <Timeline
              className="process-timeline"
              items={[
                {
                  dot: <UserOutlined className="timeline-icon" />,
                  children: (
                    <div>
                      <Title level={4}>Register & Create Profile</Title>
                      <Paragraph>Students create their account and complete basic information</Paragraph>
                    </div>
                  ),
                },
                {
                  dot: <BookOutlined className="timeline-icon" />,
                  children: (
                    <div>
                      <Title level={4}>Take Personality Assessment</Title>
                      <Paragraph>Complete our scientifically-designed personality tests</Paragraph>
                    </div>
                  ),
                },
                {
                  dot: <BulbOutlined className="timeline-icon" />,
                  children: (
                    <div>
                      <Title level={4}>Receive Analysis</Title>
                      <Paragraph>Get detailed personality profile and career recommendations</Paragraph>
                    </div>
                  ),
                },
                {
                  dot: <TrophyOutlined className="timeline-icon" />,
                  children: (
                    <div>
                      <Title level={4}>Plan Your Future</Title>
                      <Paragraph>Use insights to make informed career and education decisions</Paragraph>
                    </div>
                  ),
                },
              ]}
            />
          </Col>
          <Col xs={24} lg={12}>
            <div className="features-list">
              <Title level={3} className="features-title">What We Offer</Title>
              <Space direction="vertical" size="middle" className="features-space">
                {features.map((feature, index) => (
                  <div key={index} className="feature-item">
                    <CheckCircleOutlined className="feature-check" />
                    <Text className="feature-text">{feature}</Text>
                  </div>
                ))}
              </Space>
            </div>
          </Col>
        </Row>
      </Card>

      {/* CTA Section */}
      <Card className="cta-card">
        <div className="cta-content">
          <Title level={2} className="cta-title">
            Ready to Discover Your Ideal Career?
          </Title>
          <Paragraph className="cta-description">
            Join thousands of Vietnamese students who have already found their career direction with PersonalityVN.
          </Paragraph>
          <Space size="large" className="cta-buttons">
            <a href="/register" className="cta-button primary">
              Get Started Today
            </a>
            <a href="/" className="cta-button secondary">
              Take a Free Test
            </a>
          </Space>
        </div>
      </Card>
    </div>
  );
}

export default AboutUs;