import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container footer-grid">
        <div className="footer-section">
          <h3>PersonalityVN</h3>
          <p>Vietnam's leading personality test platform, helping you understand yourself and develop your potential.</p>
          <div className="social-media">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook"></i></a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-twitter"></i></a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram"></i></a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-linkedin"></i></a>
          </div>
        </div>
        <div className="footer-section">
          <h3>Tests</h3>
          <ul>
            <li>MBTI</li>
            <li>Enneagram</li>
            <li>Big Five</li>
            <li>Career Guidance</li>
            <li>Relationship Compatibility</li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>Contact</h3>
          <ul>
            <li>Email: info@personalityvn.com</li>
            <li>Phone: 0123 456 789</li>
            <li><a href="/contact">Contact us</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2025 PersonalityVN. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;