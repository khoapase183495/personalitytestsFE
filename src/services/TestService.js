// API Service cho Test management
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

class TestService {
  // Get all tests
  static async getAllTests() {
    try {
      console.log('TestService: Making request to:', `${API_BASE_URL}/api/test`);
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      // Add Authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('TestService: Adding Authorization header');
      } else {
        console.warn('TestService: No token found in localStorage');
      }
      
      const response = await fetch(`${API_BASE_URL}/api/test`, {
        method: 'GET',
        headers: headers
      });

      console.log('TestService: Response status:', response.status);

      if (!response.ok) {
        let errorMessage = `HTTP Error ${response.status}`;
        
        // Handle specific status codes
        if (response.status === 401) {
          errorMessage = 'Unauthorized - Please log in to access personality tests';
        } else if (response.status === 403) {
          errorMessage = 'Access forbidden - Please check your permissions';
        } else if (response.status === 500) {
          errorMessage = 'Server error - This may be due to authentication requirements';
        } else {
          try {
            const errorData = await response.text();
            console.log('TestService: Error response body:', errorData);
            errorMessage += `: ${errorData}`;
          } catch (parseError) {
            console.log('TestService: Could not parse error response');
          }
        }
        
        throw new Error(errorMessage);
      }

      const tests = await response.json();
      console.log('TestService: Successfully received tests:', tests);
      return tests;
    } catch (error) {
      console.error('TestService: getAllTests error:', error);
      throw error;
    }
  }

  // Create new test (for admin)
  static async createTest(testData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(testData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create test');
      }

      const test = await response.json();
      return test;
    } catch (error) {
      console.error('TestService: createTest error:', error);
      throw error;
    }
  }

  // Update test (for admin)
  static async updateTest(id, testData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/test/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(testData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update test');
      }

      const test = await response.json();
      return test;
    } catch (error) {
      console.error('TestService: updateTest error:', error);
      throw error;
    }
  }

  // Delete test (for admin)
  static async deleteTest(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/test/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete test');
      }

      const test = await response.json();
      return test;
    } catch (error) {
      console.error('TestService: deleteTest error:', error);
      throw error;
    }
  }
}

export default TestService;
