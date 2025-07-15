// API Service cho authentication
const API_BASE_URL = 'http://localhost:8080';

class AuthService {  // Login user
  static async login(loginData) {
    try {
      console.log('AuthService: login called with:', loginData);
      console.log('AuthService: API URL:', `${API_BASE_URL}/api/user/login`);
      
      const response = await fetch(`${API_BASE_URL}/api/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData)
      });

      console.log('AuthService: response status:', response.status);
      console.log('AuthService: response ok:', response.ok);

      if (!response.ok) {
        let errorMessage = 'Login failed. Please try again.';
          try {
          const errorData = await response.json();
          console.log('AuthService: error data:', errorData);
          
          // Xử lý các loại lỗi khác nhau
          if (response.status === 401) {
            errorMessage = 'Invalid email or password. Please check your credentials.';
          } else if (response.status === 500) {
            // Kiểm tra nếu là lỗi UserDetailsService hoặc Bad credentials
            console.log('AuthService: checking 500 error message:', errorData.message);
            if (errorData.message && (
              errorData.message.includes('UserDetailsService') ||
              errorData.message.includes('InternalAuthenticationServiceException') ||
              errorData.message.includes('Bad credentials') ||
              errorData.message.includes('BadCredentialsException') ||
              errorData.message.includes('Authentication failed')
            )) {
              console.log('AuthService: recognized as authentication error');
              errorMessage = 'Invalid email or password. Please check your credentials.';
            } else {
              console.log('AuthService: unrecognized 500 error, using original message');
              errorMessage = errorData.message || 'Server error. Please try again later.';
            }
          } else if (response.status === 400) {
            errorMessage = errorData.message || 'Invalid request. Please check your input.';
          } else {
            errorMessage = errorData.message || 'Login failed. Please try again.';
          }        } catch (parseError) {
          console.log('AuthService: failed to parse error response, using status code');
          console.log('AuthService: parseError:', parseError);
          // Nếu không parse được JSON, sử dụng message dựa trên status code
          if (response.status === 401) {
            errorMessage = 'Invalid email or password. Please check your credentials.';
          } else if (response.status === 500) {
            // Lỗi 500 thường là BadCredentialsException từ Spring Security
            console.log('AuthService: treating 500 as authentication error');
            errorMessage = 'Invalid email or password. Please check your credentials.';
          } else if (response.status === 400) {
            errorMessage = 'Invalid email or password. Please check your credentials.';          }
        }
        
        console.log('AuthService: final error message:', errorMessage);
        throw new Error(errorMessage);      }

      const data = await response.json();
      console.log('AuthService: response data:', data);
      
      // Lưu token và thông tin user vào localStorage
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        console.log('AuthService: token and user data saved to localStorage');
      }
      
      return data;
    } catch (error) {
      console.error('AuthService: login error:', error);
      
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
