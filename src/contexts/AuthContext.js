import React, { createContext, useContext, useState, useEffect } from "react";
import AuthService from "../services/AuthService";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = AuthService.getCurrentUser();
        const token = AuthService.getToken();

        if (currentUser && token) {
      const userData = {
        id: currentUser.id,
        email: currentUser.email,
        phone: currentUser.phone,
        username: currentUser.username || currentUser.fullname || currentUser.fullName,
        fullname: currentUser.fullname || currentUser.fullName || currentUser.username,
        role: currentUser.role,
        token: currentUser.token || token,
      };          setUser(userData);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        AuthService.logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (loginData) => {
    try {
      setLoading(true);
      const response = await AuthService.login(loginData);
      const userData = {
        id: response.id,
        email: response.email,
        phone: response.phone,
        username: response.username || response.fullname || response.fullName,
        fullname: response.fullname || response.fullName || response.username,
        role: response.role,
        token: response.token,
      };

      setUser(userData);
      return response;
    } catch (error) {
      console.log('AuthContext: login error caught:', error);
      console.log('AuthContext: error message:', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (registerData) => {
    try {
      setLoading(true);
      const response = await AuthService.register(registerData);
      return response;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    isParent: user?.role === 'PARENT',
    isStudent: user?.role === 'STUDENT',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
