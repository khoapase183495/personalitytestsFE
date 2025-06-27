class QuestionService {
  static async getQuestionsByTestId(testId) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/question/${testId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized access. Please login first.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching questions:', error);
      throw error;
    }
  }

  static async submitAnswers(testId, answers) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/test/${testId}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized access. Please login first.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error submitting answers:', error);
      throw error;
    }
  }
}

export default QuestionService;
