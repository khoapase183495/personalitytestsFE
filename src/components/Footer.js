import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
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
            <li><a href="/tests/mbti">MBTI</a></li>
            <li><a href="/tests/enneagram">Enneagram</a></li>
            <li><a href="/tests/big-five">Big Five</a></li>
            <li><a href="/tests/career">Career Guidance</a></li>
            <li><a href="/tests/relationship">Relationship Compatibility</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>Articles</h3>
          <ul>
            <li><a href="/articles/personality">Personality</a></li>
            <li><a href="/articles/career">Career</a></li>
            <li><a href="/articles/relationships">Relationships</a></li>
            <li><a href="/articles/self-growth">Personal Development</a></li>
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