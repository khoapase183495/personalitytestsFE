// API Service for admin question management
const API_BASE_URL = 'http://localhost:8080';

class AdminQuestionService {
  // Get all questions (admin only)
  static async getAllQuestions() {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/question`, {
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
      
      // Filter out deleted questions on frontend side as well
      if (Array.isArray(data)) {
        return data.filter(question => !question.isDeleted);
      }
      
      return data;
      
    } catch (error) {
      console.error('AdminQuestionService: Error fetching questions:', error);
      throw error;
    }
  }

  // Get questions by test ID (admin only)
  static async getQuestionsByTestId(testId) {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Try the primary endpoint first
      let response;
      try {
        response = await fetch(`${API_BASE_URL}/api/question/${testId}`, {
          method: 'GET',
          headers: headers
        });
      } catch (primaryError) {
        console.warn('Primary question endpoint failed, trying alternative:', primaryError);
        
        // Try alternative endpoint structure
        response = await fetch(`${API_BASE_URL}/api/question/test/${testId}`, {
          method: 'GET',
          headers: headers
        });
      }

      if (!response.ok) {
        let errorMessage = `HTTP Error ${response.status}`;
        
        if (response.status === 401) {
          errorMessage = 'Unauthorized - Admin access required';
        } else if (response.status === 403) {
          errorMessage = 'Access forbidden - Admin privileges required';
        } else if (response.status === 404) {
          errorMessage = 'Test not found or no questions available';
        } else if (response.status === 500) {
          errorMessage = 'Server error - Question service may be unavailable';
          // Return empty array for 500 errors to allow UI to continue working
          return [];
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
      
      // Filter out deleted questions on frontend side as well
      if (Array.isArray(data)) {
        return data.filter(question => !question.isDeleted);
      }
      
      return data;
      
    } catch (error) {
      console.error('AdminQuestionService: Error fetching questions by test ID:', error);
      
      // Return empty array on error to prevent UI crash
      if (error.message.includes('500') || error.message.includes('Server error')) {
        console.warn('Returning empty array due to server error');
        return [];
      }
      
      throw error;
    }
  }

  // Create a new question (admin only)
  static async createQuestion(questionData) {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/question`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(questionData)
      });

      if (!response.ok) {
        let errorMessage = 'Failed to create question';
        
        try {
          const errorData = await response.json();
          if (response.status === 400) {
            errorMessage = errorData.message || 'Invalid question data';
          } else if (response.status === 409) {
            errorMessage = 'Question already exists';
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
      console.error('AdminQuestionService: Error creating question:', error);
      throw error;
    }
  }

  // Update question (admin only)
  static async updateQuestion(questionId, questionData) {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/question/${questionId}`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(questionData)
      });

      if (!response.ok) {
        let errorMessage = 'Failed to update question';
        
        try {
          const errorData = await response.json();
          if (response.status === 404) {
            errorMessage = 'Question not found';
          } else if (response.status === 400) {
            errorMessage = errorData.message || 'Invalid question data';
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
      console.error('AdminQuestionService: Error updating question:', error);
      throw error;
    }
  }

  // Delete question (admin only) - Using soft delete
  static async deleteQuestion(questionId) {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Try soft delete first (PATCH method to set isDeleted = true)
      let response = await fetch(`${API_BASE_URL}/api/question/${questionId}`, {
        method: 'PATCH',
        headers: headers,
        body: JSON.stringify({ isDeleted: true })
      });

      // If PATCH doesn't work, try PUT method
      if (!response.ok && response.status === 405) {
        response = await fetch(`${API_BASE_URL}/api/question/${questionId}`, {
          method: 'PUT',
          headers: headers,
          body: JSON.stringify({ isDeleted: true })
        });
      }

      // If both PATCH and PUT fail, try DELETE
      if (!response.ok && response.status === 405) {
        response = await fetch(`${API_BASE_URL}/api/question/${questionId}`, {
          method: 'DELETE',
          headers: headers
        });
      }

      if (!response.ok) {
        let errorMessage = 'Failed to delete question';
        
        try {
          const errorData = await response.text();
          if (response.status === 404) {
            errorMessage = 'Question not found';
          } else if (response.status === 500) {
            errorMessage = 'Server error - Question may have dependencies that prevent deletion';
          } else {
            errorMessage = errorData || errorMessage;
          }
        } catch (parseError) {
          errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }

      // Handle different response types
      try {
        const data = await response.json();
        return data;
      } catch (parseError) {
        // Some endpoints might return empty response on successful delete
        return { success: true, message: 'Question deleted successfully' };
      }
      
    } catch (error) {
      console.error('AdminQuestionService: Error deleting question:', error);
      throw error;
    }
  }

  // Alternative delete method - try to hide question instead of delete
  static async hideQuestion(questionId) {
    try {
      // First get the question
      const question = await this.getQuestionsByTestId(questionId);
      if (question) {
        // Try to update with isDeleted flag
        const updatedData = {
          ...question,
          isDeleted: true
        };
        return await this.updateQuestion(questionId, updatedData);
      }
      throw new Error('Question not found');
    } catch (error) {
      console.error('AdminQuestionService: Error hiding question:', error);
      throw error;
    }
  }

  // Get question statistics (calculated from questions data)
  static async getQuestionStats() {
    try {
      const questions = await this.getAllQuestions();
      
      return {
        totalQuestions: questions.length,
        questionsWithOptions: questions.filter(q => q.options && q.options.length > 0).length,
        questionsWithoutOptions: questions.filter(q => !q.options || q.options.length === 0).length,
        averageOptionsPerQuestion: questions.length > 0 ? 
          Math.round(questions.reduce((sum, q) => sum + (q.options?.length || 0), 0) / questions.length) : 0
      };
      
    } catch (error) {
      console.error('AdminQuestionService: Error calculating question stats:', error);
      return {
        totalQuestions: 0,
        questionsWithOptions: 0,
        questionsWithoutOptions: 0,
        averageOptionsPerQuestion: 0
      };
    }
  }
}

export default AdminQuestionService;
