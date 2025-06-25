import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./NavBar.css";

function NavBar() {
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          PersonalityVN
        </Link>
        <div className="nav-menu">
          <div className="nav-item">
            <Link to="/tests" className="nav-link">
              Personality Tests
            </Link>
            <div className="dropdown-menu">
              <Link to="/tests/mbti" className="dropdown-item">
                MBTI
              </Link>
              <Link to="/tests/enneagram" className="dropdown-item">
                Enneagram
              </Link>
              <Link to="/tests/big-five" className="dropdown-item">
                Big Five
              </Link>
              <Link to="/tests/career" className="dropdown-item">
                Career Guidance
              </Link>
            </div>
          </div>
          <div className="nav-item">
            <Link to="/articles" className="nav-link">
              Articles
            </Link>
          </div>
          <div className="nav-item">
            <Link to="/about" className="nav-link">
              About Us
            </Link>
          </div>        </div>
        <div className="nav-auth">          {isAuthenticated ? (
            <div className="user-menu">
              <span className="user-name">
                Hello, {user?.username || user?.email}
              </span>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="signup-buttons">
                Log In
              </Link>
              <Link to="/register" className="login-buttons">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
