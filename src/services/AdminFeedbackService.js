// API Service for admin feedback management
const API_BASE_URL = 'http://localhost:8080';

class AdminFeedbackService {
  // Get all feedbacks (admin only)
  static async getAllFeedbacks() {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/feedback/getAll`, {
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
      console.error('AdminFeedbackService: Error fetching feedbacks:', error);
      throw error;
    }
  }

  // Get feedback by ID (admin only)
  static async getFeedbackById(feedbackId) {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/feedback/getById/${feedbackId}`, {
        method: 'GET',
        headers: headers
      });

      if (!response.ok) {
        let errorMessage = 'Failed to get feedback';
        
        if (response.status === 404) {
          errorMessage = 'Feedback not found';
        } else if (response.status === 401) {
          errorMessage = 'Unauthorized - Admin access required';
        } else if (response.status === 403) {
          errorMessage = 'Access forbidden - Admin privileges required';
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error('AdminFeedbackService: Error fetching feedback:', error);
      throw error;
    }
  }

  // Delete feedback (soft delete - admin only)
  static async deleteFeedback(feedbackId) {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/feedback/delete/${feedbackId}`, {
        method: 'DELETE',
        headers: headers
      });

      if (!response.ok) {
        let errorMessage = 'Failed to delete feedback';
        
        try {
          const errorData = await response.json();
          if (response.status === 404) {
            errorMessage = 'Feedback not found';
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
      console.error('AdminFeedbackService: Error deleting feedback:', error);
      throw error;
    }
  }

  // Get feedback statistics (calculated from feedback data)
  static async getFeedbackStats() {
    try {
      const feedbacks = await this.getAllFeedbacks();
      
      const activeFeedbacks = feedbacks.filter(feedback => !feedback.isDeleted);
      const totalRatings = activeFeedbacks.reduce((sum, feedback) => sum + feedback.rating, 0);
      const averageRating = activeFeedbacks.length > 0 ? (totalRatings / activeFeedbacks.length).toFixed(1) : 0;
      
      // Rating distribution
      const ratingDistribution = {};
      for (let i = 1; i <= 5; i++) {
        ratingDistribution[i] = activeFeedbacks.filter(feedback => feedback.rating === i).length;
      }
      
      return {
        totalFeedbacks: feedbacks.length,
        activeFeedbacks: activeFeedbacks.length,
        deletedFeedbacks: feedbacks.filter(feedback => feedback.isDeleted).length,
        averageRating: parseFloat(averageRating),
        ratingDistribution,
        recentFeedbacks: activeFeedbacks
          .sort((a, b) => new Date(b.createAt) - new Date(a.createAt))
          .slice(0, 5)
      };
      
    } catch (error) {
      console.error('AdminFeedbackService: Error calculating feedback stats:', error);
      return {
        totalFeedbacks: 0,
        activeFeedbacks: 0,
        deletedFeedbacks: 0,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        recentFeedbacks: []
      };
    }
  }
}

export default AdminFeedbackService;
