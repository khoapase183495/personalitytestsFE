import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './contexts/AuthContext';
import NavBar from './components/NavBar';
import HomePage from './components/homepage/HomePage';
import Footer from './components/Footer';
import Login from './components/authentication/Login';
import Register from './components/authentication/Register';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <NavBar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {/* Thêm các routes khác ở đây */}
            <Route path="/tests" element={<div style={{padding: '2rem', textAlign: 'center'}}>Trang Tests - Coming Soon!</div>} />
            <Route path="/articles" element={<div style={{padding: '2rem', textAlign: 'center'}}>Trang Articles - Coming Soon!</div>} />
            <Route path="/about" element={<div style={{padding: '2rem', textAlign: 'center'}}>Trang About - Coming Soon!</div>} />
          </Routes>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
