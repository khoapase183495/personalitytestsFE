// API Service for admin user management
const API_BASE_URL = 'http://localhost:8080';

class AdminUserService {
  // Get all users (admin only)
  static async getAllUsers() {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/user`, {
        method: 'GET',
        headers: headers
      });

      if (!response.ok) {
        let errorMessage = `HTTP Error ${response.status}`;
        
        if (response.status === 401) {
          errorMessage = 'Unauthorized - Admin access required';
        } else if (response.status === 403) {
          errorMessage = 'Access forbidden - Admin privileges required';
        } else {
          try {
            const errorData = await response.text();
            errorMessage += `: ${errorData}`;
          } catch (parseError) {
            console.log('AdminUserService: Could not parse error response');
          }
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('AdminUserService: Successfully fetched users:', data);
      return data;
      
    } catch (error) {
      console.error('AdminUserService: Error fetching users:', error);
      throw error;
    }
  }

  // Get single user by ID (admin only)
  static async getUserById(userId) {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/user/updateAccount/${userId}`, {
        method: 'GET',
        headers: headers
      });

      if (!response.ok) {
        let errorMessage = `HTTP Error ${response.status}`;
        
        if (response.status === 401) {
          errorMessage = 'Unauthorized - Admin access required';
        } else if (response.status === 403) {
          errorMessage = 'Access forbidden - Admin privileges required';
        } else if (response.status === 404) {
          errorMessage = 'User not found';
        } else {
          try {
            const errorData = await response.text();
            errorMessage += `: ${errorData}`;
          } catch (parseError) {
            console.log('AdminUserService: Could not parse error response');
          }
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('AdminUserService: Successfully fetched user:', data);
      return data;
      
    } catch (error) {
      console.error('AdminUserService: Error fetching user:', error);
      throw error;
    }
  }

  // Create a new user (admin only)
  static async createUser(userData) {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/user/admin/create`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        let errorMessage = 'Failed to create user';
        
        try {
          const errorData = await response.json();
          if (response.status === 400) {
            errorMessage = errorData.message || 'Invalid user data';
          } else if (response.status === 409) {
            errorMessage = 'User with this email already exists';
          } else {
            errorMessage = errorData.message || errorMessage;
          }
        } catch (parseError) {
          console.log('AdminUserService: Could not parse error response');
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('AdminUserService: Successfully created user:', data);
      return data;
      
    } catch (error) {
      console.error('AdminUserService: Error creating user:', error);
      throw error;
    }
  }

  // Update user (admin only)
  static async updateUser(userId, userData) {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/user/updateAccount/${userId}`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        let errorMessage = 'Failed to update user';
        let responseText = '';
        
        try {
          responseText = await response.text();
          console.log('AdminUserService: Error response text:', responseText);
          
          const errorData = JSON.parse(responseText);
          if (response.status === 404) {
            errorMessage = 'User not found';
          } else if (response.status === 400) {
            errorMessage = errorData.message || 'Invalid user data';
          } else if (response.status === 403) {
            errorMessage = 'Access forbidden - Admin privileges required';
          } else if (response.status === 401) {
            errorMessage = 'Unauthorized - Please login again';
          } else {
            errorMessage = errorData.message || errorMessage;
          }
        } catch (parseError) {
          console.log('AdminUserService: Could not parse error response, raw text:', responseText);
          errorMessage = `HTTP ${response.status}: ${responseText || 'Unknown error'}`;
        }
        
        throw new Error(errorMessage);
      }

      // Backend trả về text "Update Success", không phải JSON
      const responseText = await response.text();
      console.log('AdminUserService: Successfully updated user:', responseText);
      return { message: responseText, success: true };
      
    } catch (error) {
      console.error('AdminUserService: Error updating user:', error);
      throw error;
    }
  }

  // Delete user (admin only)
  static async deleteUser(userId) {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/user/${userId}`, {
        method: 'DELETE',
        headers: headers
      });

      if (!response.ok) {
        let errorMessage = 'Failed to delete user';
        
        try {
          const errorData = await response.json();
          if (response.status === 404) {
            errorMessage = 'User not found';
          } else {
            errorMessage = errorData.message || errorMessage;
          }
        } catch (parseError) {
          console.log('AdminUserService: Could not parse error response');
        }
        
        throw new Error(errorMessage);
      }

      console.log('AdminUserService: Successfully deleted user');
      return true;
      
    } catch (error) {
      console.error('AdminUserService: Error deleting user:', error);
      throw error;
    }
  }

  // Get user statistics (admin only)
  static async getUserStats() {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/user/stats`, {
        method: 'GET',
        headers: headers
      });

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }

      const data = await response.json();
      console.log('AdminUserService: Successfully fetched user stats:', data);
      return data;
      
    } catch (error) {
      console.error('AdminUserService: Error fetching user stats:', error);
      throw error;
    }
  }
}

export default AdminUserService;
