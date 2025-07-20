// API Service for admin test management
const API_BASE_URL = 'http://localhost:8080';

class AdminTestService {
  // Get all tests (admin only)
  static async getAllTests() {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/test`, {
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
            // Silent error parsing
          }
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error('AdminTestService: Error fetching tests:', error);
      throw error;
    }
  }

  // Create a new test (admin only)
  static async createTest(testData) {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/test`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(testData)
      });

      if (!response.ok) {
        let errorMessage = 'Failed to create test';
        
        try {
          const errorData = await response.json();
          if (response.status === 400) {
            errorMessage = errorData.message || 'Invalid test data';
          } else if (response.status === 409) {
            errorMessage = 'Test with this title already exists';
          } else {
            errorMessage = errorData.message || errorMessage;
          }
        } catch (parseError) {
          // Silent error parsing
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error('AdminTestService: Error creating test:', error);
      throw error;
    }
  }

  // Update test (admin only)
  static async updateTest(testId, testData) {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/test/${testId}`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(testData)
      });

      if (!response.ok) {
        let errorMessage = 'Failed to update test';
        
        try {
          const errorData = await response.json();
          if (response.status === 404) {
            errorMessage = 'Test not found';
          } else if (response.status === 400) {
            errorMessage = errorData.message || 'Invalid test data';
          } else if (response.status === 403) {
            errorMessage = 'Access forbidden - Admin privileges required';
          } else if (response.status === 401) {
            errorMessage = 'Unauthorized - Please login again';
          } else {
            errorMessage = errorData.message || errorMessage;
          }
        } catch (parseError) {
          errorMessage = `HTTP ${response.status}: Unknown error`;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error('AdminTestService: Error updating test:', error);
      throw error;
    }
  }

  // Delete test (admin only)
  static async deleteTest(testId) {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/test/${testId}`, {
        method: 'DELETE',
        headers: headers
      });

      if (!response.ok) {
        let errorMessage = 'Failed to delete test';
        
        try {
          const errorData = await response.json();
          if (response.status === 404) {
            errorMessage = 'Test not found';
          } else {
            errorMessage = errorData.message || errorMessage;
          }
        } catch (parseError) {
          // Silent error parsing
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error('AdminTestService: Error deleting test:', error);
      throw error;
    }
  }

  // Get test statistics (calculated from tests data)
  static async getTestStats() {
    try {
      const tests = await this.getAllTests();
      
      return {
        totalTests: tests.length,
        activeTests: tests.filter(test => !test.isDeleted).length,
        deletedTests: tests.filter(test => test.isDeleted).length,
        averageQuestions: tests.length > 0 ? 
          Math.round(tests.reduce((sum, test) => sum + (test.questions?.length || 0), 0) / tests.length) : 0
      };
      
    } catch (error) {
      console.error('AdminTestService: Error calculating test stats:', error);
      return {
        totalTests: 0,
        activeTests: 0,
        deletedTests: 0,
        averageQuestions: 0
      };
    }
  }
}

export default AdminTestService;
