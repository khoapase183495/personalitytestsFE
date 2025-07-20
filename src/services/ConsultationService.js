class ConsultationService {
  constructor() {
    this.baseURL = 'http://localhost:8080/api';
  }

  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }

  async getUserConsultations(userId) {
    try {
      const response = await fetch(`${this.baseURL}/consulation/user/${userId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch consultations: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user consultations:', error);
      throw error;
    }
  }

  // Book a new consultation (existing functionality)
  async bookConsultation(consultationData) {
    try {
      const response = await fetch(`${this.baseURL}/consultations`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(consultationData)
      });

      if (!response.ok) {
        throw new Error(`Failed to book consultation: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error booking consultation:', error);
      throw error;
    }
  }
}

const consultationService = new ConsultationService();
export default consultationService;
