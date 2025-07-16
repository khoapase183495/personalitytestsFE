import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import NavBarDropdown from "./NavBarDropdown";
import "./NavBar.css";
import { UserOutlined } from "@ant-design/icons";

function NavBar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  const handleProfileClick = () => {
    navigate("/profile");
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
            <NavBarDropdown />
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
          </div>
        </div>
        <div className="nav-auth">
          {isAuthenticated ? (
            <div className="user-menu">
              <span className="user-name">
                Hello, {user?.username || user?.email}
              </span>
              {isAuthenticated && (
          <button
            className="profile-button"
            onClick={handleProfileClick}
            title="View Profile"
            style={{
              marginLeft: 12,
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 22,
              color: "#3d348b",
              verticalAlign: "middle"
            }}
          >
            <UserOutlined />
          </button>
        )}
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
