import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';
import './AuthDemo.css';

function AuthDemo() {
  const [currentView, setCurrentView] = useState('login'); // 'login' or 'register'
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    console.log('Login successfully:', userData);
    setUser(userData);
    alert(`Welcome ${userData.name || userData.email}!`);
  };

  const handleRegister = (userData) => {
    console.log('Register successfully:', userData);
    alert(`Register successfully! Welcome ${userData.name || userData.email}!`);
    setCurrentView('login');
  };

  const handleError = (error) => {
    console.error('Authentication error:', error);
  };

  const handleLogout = () => {
    setUser(null);
    // AuthService.logout(); // Uncomment khi sử dụng thực tế
  };

  if (user) {
    return (
      <div className="auth-demo-container">
        <div className="welcome-card">
          <h2>Chào mừng bạn!</h2>
          <p>Email: {user.email}</p>
          {user.name && <p>Tên: {user.name}</p>}
          {user.role && <p>Vai trò: {user.role}</p>}
          <button onClick={handleLogout} className="logout-button">
            Đăng xuất
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-demo-container">
      <div className="auth-toggle">
        <button 
          className={`toggle-button ${currentView === 'login' ? 'active' : ''}`}
          onClick={() => setCurrentView('login')}
        >
          Đăng nhập
        </button>
        <button 
          className={`toggle-button ${currentView === 'register' ? 'active' : ''}`}
          onClick={() => setCurrentView('register')}
        >
          Đăng ký
        </button>
      </div>

      {currentView === 'login' ? (
        <Login 
          onLogin={handleLogin}
          onError={handleError}
        />
      ) : (
        <Register 
          onRegister={handleRegister}
          onError={handleError}
        />
      )}
    </div>
  );
}

export default AuthDemo;
