import React from 'react';
import './Hero.css';

function Hero() {
  return (
    <div className="hero-container">
      <div className="hero-content">
        <h1>Discover Yourself Through Personality Tests</h1>
        <p>Scientifically validated personality tests to help you understand yourself better</p>
        <button className="hero-button">Take a Free Test</button>
      </div>
      <div className="hero-image">
        <img src="/images/hero-image.png" alt="Personality Tests" />
      </div>
    </div>
  );
}

export default Hero;