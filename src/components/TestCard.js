import React from 'react';
import './TestCard.css';

function TestCard({ title, description, image, link }) {
  return (
    <div className="test-card">
      <div className="test-card-image">
        <img src={image} alt={title} />
      </div>
      <div className="test-card-content">
        <h3>{title}</h3>
        <p>{description}</p>
        <a href={link} className="test-card-button">Take Test</a>
      </div>
    </div>
  );
}

export default TestCard;