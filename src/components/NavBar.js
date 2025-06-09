import React from 'react';
import './NavBar.css';

function NavBar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <a href="/" className="navbar-logo">PersonalityVN</a>
        <div className="nav-menu">
          <div className="nav-item">
            <a href="/tests" className="nav-link">Personality Tests</a>
            <div className="dropdown-menu">
              <a href="/tests/mbti" className="dropdown-item">MBTI</a>
              <a href="/tests/enneagram" className="dropdown-item">Enneagram</a>
              <a href="/tests/big-five" className="dropdown-item">Big Five</a>
              <a href="/tests/career" className="dropdown-item">Career Guidance</a>
            </div>
          </div>
          <div className="nav-item">
            <a href="/articles" className="nav-link">Articles</a>
          </div>
          <div className="nav-item">
            <a href="/about" className="nav-link">About Us</a>
          </div>
        </div>
        <div className="nav-auth">
          <button className="login-button">Log In</button>
          <button className="signup-button">Sign Up</button>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;