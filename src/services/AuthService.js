// API Service cho authentication
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

class AuthService {  // Login user
  static async login(loginData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData)
      });

      if (!response.ok) {
        let errorMessage = 'Login failed. Please try again.';
        
        try {
          const errorData = await response.json();
          
          // Xử lý các loại lỗi khác nhau
          if (response.status === 401) {
            errorMessage = 'Invalid email or password. Please check your credentials.';
          } else if (response.status === 500) {
            // Kiểm tra nếu là lỗi UserDetailsService
            if (errorData.message && errorData.message.includes('UserDetailsService')) {
              errorMessage = 'Invalid email or password. Please check your credentials.';
            } else if (errorData.message && errorData.message.includes('InternalAuthenticationServiceException')) {
              errorMessage = 'Invalid email or password. Please check your credentials.';
            } else {
              errorMessage = errorData.message || 'Server error. Please try again later.';
            }
          } else if (response.status === 400) {
            errorMessage = errorData.message || 'Invalid request. Please check your input.';
          } else {
            errorMessage = errorData.message || 'Login failed. Please try again.';
          }
        } catch (parseError) {
          // Nếu không parse được JSON, sử dụng message dựa trên status code
          if (response.status === 401 || response.status === 500) {
            errorMessage = 'Invalid email or password. Please check your credentials.';
          }
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      // Lưu token và thông tin user vào localStorage
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
      }
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      
      // Nếu là network error hoặc lỗi không xác định
      if (error.name === 'TypeError' || error.message.includes('fetch')) {
        throw new Error('Network error. Please check your internet connection.');
      }
      
      throw error;
    }
  }
  // Register user
  static async register(registerData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData)
      });

      if (!response.ok) {
        let errorMessage = 'Registration failed. Please try again.';
        
        try {
          const errorData = await response.json();
          
          // Xử lý các loại lỗi khác nhau
          if (response.status === 400) {
            if (errorData.message && errorData.message.includes('email')) {
              errorMessage = 'Email already exists. Please use a different email.';
            } else if (errorData.message && errorData.message.includes('phone')) {
              errorMessage = 'Phone number already exists. Please use a different phone number.';
            } else {
              errorMessage = errorData.message || 'Invalid input. Please check your information.';
            }
          } else if (response.status === 500) {
            errorMessage = 'Server error. Please try again later.';
          } else {
            errorMessage = errorData.message || 'Registration failed. Please try again.';
          }
        } catch (parseError) {
          // Nếu không parse được JSON, sử dụng message dựa trên status code
          if (response.status === 400) {
            errorMessage = 'Invalid input. Please check your information.';
          } else if (response.status === 500) {
            errorMessage = 'Server error. Please try again later.';
          }
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Register error:', error);
      
      // Nếu là network error hoặc lỗi không xác định
      if (error.name === 'TypeError' || error.message.includes('fetch')) {
        throw new Error('Network error. Please check your internet connection.');
      }
      
      throw error;
    }
  }

  // Logout user
  static logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // Get current user
  static getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // Get token
  static getToken() {
    return localStorage.getItem('token');
  }

  // Check if user is authenticated
  static isAuthenticated() {
    const token = this.getToken();
    return !!token;
  }

  // Create authenticated headers
  static getAuthHeaders() {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }
}

export default AuthService;
