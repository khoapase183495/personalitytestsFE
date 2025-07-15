import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './contexts/AuthContext';
import NavBar from './components/NavBar';
import HomePage from './components/homepage/HomePage';
import Footer from './components/Footer';
import Login from './components/authentication/Login';
import Register from './components/authentication/Register';
import TestDetail from './components/tests/TestDetail';
import Question from './components/tests/Question';
import TestResults from './components/tests/TestResults';
import AdminDashboard from './components/admin/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

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
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/tests/:testSlug" 
              element={
                <ProtectedRoute>
                  <Question />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/tests/:testSlug/details" 
              element={
                <ProtectedRoute>
                  <TestDetail />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/tests/:testSlug/results" 
              element={
                <ProtectedRoute>
                  <TestResults />
                </ProtectedRoute>
              } 
            />
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
