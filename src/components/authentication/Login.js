import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./Login.css";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [state, setState] = useState({
    isLoading: false,
    error: null,
    formData: {
      email: "",
      password: "",
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setState((prev) => ({
      ...prev,
      formData: {
        ...prev.formData,
        [name]: value,
      },
      error: null,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!state.formData.email || !state.formData.password) {
      setState((prev) => ({ ...prev, error: "Please fill in all fields" }));
      return;
    }
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const loginResponse = await login({
        email: state.formData.email,
        password: state.formData.password,
      });

      // Redirect based on user role
      if (loginResponse.role === 'ADMIN') {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error.message || "Connection error. Please try again!",
      }));
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Sign In</h2>
          <p>Welcome back! Please sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {state.error && <div className="error-message">{state.error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={state.formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email address"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={state.formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={state.isLoading}
          >
            {state.isLoading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Don't have an account? <a href="/register">Sign up now</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
