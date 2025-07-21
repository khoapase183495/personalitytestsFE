import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ProfileService from '../../services/ProfileService';
import './Register.css';

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [state, setState] = useState({
    isLoading: false,
    error: null,    formData: {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      phone: '',
      role: ''
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        [name]: value
      },
      error: null
    }));
  };
  const validateForm = () => {
    const { email, password, confirmPassword, fullName, role } = state.formData;
    
    if (!email || !password || !confirmPassword || !fullName || !role) {
      return 'Please fill in all required fields';
    }
    
    if (password !== confirmPassword) {
      return 'Password confirmation does not match';
    }
    
    // Enhanced password validation
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    
    // Check for uppercase letter
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least 1 uppercase letter';
    }
    
    // Check for lowercase letter
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least 1 lowercase letter';
    }
    
    // Check for number
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least 1 number';
    }
    
    // Check for special character
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      return 'Password must contain at least 1 special character (!@#$%^&*()_+-=[]{}|;:,.<>?)';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    
    if (!['ADMIN', 'PARENT', 'STUDENT'].includes(role)) {
      return 'Please select a valid role';
    }
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setState(prev => ({ ...prev, error: validationError }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Check if email already exists
      const emailExists = await ProfileService.checkEmailExists(state.formData.email);
      if (emailExists) {
        setState(prev => ({ 
          ...prev, 
          error: 'Email already registered. Please use a different email.',
          isLoading: false
        }));
        return;
      }

      await register({
        email: state.formData.email,
        password: state.formData.password,
        fullName: state.formData.fullName,
        phone: state.formData.phone,
        role: state.formData.role
      });
      
      // Redirect to login page after successful registration
      navigate('/login');
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error.message || 'Connection error. Please try again!' 
      }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h2>Create Account</h2>
          <p>Join us to discover your personality traits</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          {state.error && (
            <div className="error-message">
              {state.error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="fullName">Full Name <span className="required">*</span></label>
            <input
            type="text"
            id="fullName"
            name="fullName" // <-- use fullName here
            value={state.formData.fullName}
            onChange={handleInputChange}
            placeholder="Enter your full name"
            required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address <span className="required">*</span></label>
            <input
              type="email"
              id="email"
              name="email"
              value={state.formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email address"
              required
            />
          </div>          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={state.formData.phone}
              onChange={handleInputChange}
              placeholder="Enter phone number (optional)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Role <span className="required">*</span></label>
            <select
              id="role"
              name="role"
              value={state.formData.role}
              onChange={handleInputChange}
              required
            >
              <option value="">Select your role</option>
              <option value="STUDENT">Student</option>
              <option value="PARENT">Parent</option>
              
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password <span className="required">*</span></label>
              <input
                type="password"
                id="password"
                name="password"
                value={state.formData.password}
                onChange={handleInputChange}
                placeholder="8+ chars, 1 uppercase, 1 lowercase, 1 number, 1 special char"
                required
              />
              <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                Must contain: 8+ characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password <span className="required">*</span></label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={state.formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your password"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="register-button"
            disabled={state.isLoading}
          >
            {state.isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="register-footer">
          <p>Already have an account? <a href="/login">Sign in now</a></p>
        </div>
      </div>
    </div>
  );
}

export default Register;
