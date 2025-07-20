const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

class FeedBackService {
  // Submit feedback for a test
  static async submitFeedback(feedbackData) {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        console.warn('FeedBackService: No token found in localStorage');
        throw new Error('Authentication required to submit feedback');
      }

      console.log('FeedBackService: Submitting feedback:', feedbackData);

      const response = await fetch(`${API_BASE_URL}/api/feedback`, {
        method: 'POST',
        headers,
        body: JSON.stringify(feedbackData)
      });

      console.log('FeedBackService: Response status:', response.status);

      if (!response.ok) {
        let errorMessage = 'Failed to submit feedback';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      // Handle response - could be JSON or text
      const responseText = await response.text();
      console.log('FeedBackService: Response:', responseText);
      
      try {
        return JSON.parse(responseText);
      } catch {
        return responseText; // Return as string if not JSON (e.g., "Feedback successfully")
      }
    } catch (error) {
      console.error('FeedBackService: submitFeedback error:', error);
      throw error;
    }
  }
}

export default FeedBackService;