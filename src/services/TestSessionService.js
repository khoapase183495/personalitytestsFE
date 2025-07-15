const API_BASE_URL = 'http://localhost:8080';

class TestSessionService {
  // Khởi tạo session mới
  static async createSession(testId) {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        console.warn('TestSessionService: No token found in localStorage');
        throw new Error('No token found in localStorage');
      }

      const response = await fetch(`${API_BASE_URL}/api/test-sessions/create`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ testId })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to create test session');
      }

      const session = await response.json();
      return session;
    } catch (error) {
      console.error('TestSessionService: createSession error:', error);
      throw error;
    }
  }

  // Nộp bài test
  static async completeSession(sessionId, answers) {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        console.warn('TestSessionService: No token found in localStorage');
        throw new Error('No token found in localStorage');
      }

      const response = await fetch(`${API_BASE_URL}/api/test-sessions/${sessionId}/complete`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ answers })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to submit test answers');
      }

      return;
    } catch (error) {
      console.error('TestSessionService: completeSession error:', error);
      throw error;
    }
  }

  // Lấy kết quả bài test
  static async getResult(sessionId) {
    try {
      const token = localStorage.getItem('token');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        console.warn('TestSessionService: No token found in localStorage');
        throw new Error('No token found in localStorage');
      }

      const response = await fetch(`${API_BASE_URL}/api/test-sessions/${sessionId}/result`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to fetch test result');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('TestSessionService: getResult error:', error);
      throw error;
    }
  }
}

export default TestSessionService;