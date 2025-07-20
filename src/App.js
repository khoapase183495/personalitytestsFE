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
import UserProfile from './components/UserProfile';
import StudentPage from "./components/StudentPage";
import AboutUs from './components/AboutUs';
import TestHistory from './components/TestHistory';
import Consultation from './components/Consultation';
import ConsultationLinks from './components/ConsultationLinks';
import 'antd/dist/reset.css';

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
            <Route path="/tests/:testSlug" element={<Question />} />
            <Route path="/tests/:testSlug/details" element={<TestDetail />} />
            <Route path="/tests/:testSlug/results" element={<TestResults />} />
            <Route path="/tests" element={<div style={{padding: '2rem', textAlign: 'center'}}>Trang Tests - Coming Soon!</div>} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/student" element={<StudentPage />} />
            <Route path="/consultation" element={<Consultation />} />
            <Route path="/consultation-links" element={<ConsultationLinks />} />
            <Route path="/test-history" element={<TestHistory />} />
          </Routes>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
