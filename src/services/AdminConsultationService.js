// API Service for consultation management
const API_BASE_URL = 'http://localhost:8080';

class AdminConsultationService {
  // Create meeting consultation
  static async createMeeting(consultationData) {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Format data to match backend ConsulationRequest exactly
      const requestData = {
        googleMeetURL: consultationData.googleMeetURL,
        consultMembersEmail: Array.isArray(consultationData.consultMembersEmail) 
          ? consultationData.consultMembersEmail 
          : [consultationData.consultMembersEmail], // Convert to array if single email
        scheduledTime: new Date(consultationData.scheduledTime).toISOString()
      };
      
      console.log('AdminConsultationService: Creating meeting with formatted data:', requestData);
      console.log('AdminConsultationService: Request headers:', headers);
      console.log('AdminConsultationService: API URL:', `${API_BASE_URL}/api/consulation/create-meeting`);
      
      const response = await fetch(`${API_BASE_URL}/api/consulation/create-meeting`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestData)
      });

      console.log('AdminConsultationService: Response status:', response.status);
      console.log('AdminConsultationService: Response headers:', response.headers);

      if (!response.ok) {
        let errorMessage = 'Failed to create meeting';
        
        try {
          const errorText = await response.text();
          console.error('AdminConsultationService: Backend error response:', errorText);
          
          if (response.status === 400) {
            errorMessage = 'Invalid meeting data - ' + errorText;
          } else if (response.status === 401) {
            errorMessage = 'Unauthorized - Please login again';
          } else if (response.status === 403) {
            errorMessage = 'Access forbidden - Admin privileges required';
          } else if (response.status === 404) {
            errorMessage = 'User not found with provided email';
          } else if (response.status === 500) {
            errorMessage = 'Server error - ' + errorText;
          } else {
            errorMessage = errorText || errorMessage;
          }
        } catch (parseError) {
          console.error('AdminConsultationService: Error parsing error response:', parseError);
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('AdminConsultationService: Meeting created successfully:', data);
      return data;
      
    } catch (error) {
      console.error('AdminConsultationService: Error creating meeting:', error);
      throw error;
    }
  }

  // Get all consultations (admin only)
  static async getAllConsultations() {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      console.log('AdminConsultationService: Fetching all consultations...');
      
      const response = await fetch(`${API_BASE_URL}/api/consulation/all`, {
        method: 'GET',
        headers: headers
      });

      console.log('AdminConsultationService: GetAll response status:', response.status);

      if (!response.ok) {
        let errorMessage = `HTTP Error ${response.status}`;
        
        if (response.status === 401) {
          errorMessage = 'Unauthorized - Admin access required';
        } else if (response.status === 403) {
          errorMessage = 'Access forbidden - Admin privileges required';
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('AdminConsultationService: Raw backend data:', data);
      
      // Transform data to match frontend expectations
      const transformedData = data.map(consultation => ({
        id: consultation.id,
        googleMeetLink: consultation.googleMeetLink || consultation.googleMeetURL, // Handle both field names
        users: consultation.users || [], // Keep full user objects for participants display
        scheduledTime: consultation.scheduledTime,
        createAt: consultation.createAt,
        isDeleted: consultation.isDeleted || consultation.deleted || false,
        // Keep original data for debugging
        _original: consultation
      }));
      
      console.log('AdminConsultationService: Transformed consultations:', transformedData);
      return transformedData;
      
    } catch (error) {
      console.error('AdminConsultationService: Error fetching consultations:', error);
      throw error;
    }
  }
}

export default AdminConsultationService;