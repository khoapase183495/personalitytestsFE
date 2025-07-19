import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Hero.css';

function Hero() {
  const navigate = useNavigate();

  const handleTakeTest = () => {
    // Scroll to test section or navigate to tests page
    const testSection = document.querySelector('.test-section-antd');
    if (testSection) {
      testSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/tests');
    }
  };

  return (
    <div className="hero-container">
      <div className="hero-content">
        <h1>Discover Yourself Through Personality Tests</h1>
        <p>Scientifically validated personality tests to help you understand yourself better</p>
        <button className="hero-button" onClick={handleTakeTest}>
          Take a Free Test
        </button>
      </div>
      <div className="hero-image">
        <img src="/images/hero-image.png" alt="Personality Tests" />
      </div>
    </div>
  );
}

export default Hero;