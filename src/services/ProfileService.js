const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

class ProfileService {
  // Get all users to check email existence
  static async getAllUsers() {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/api/user`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      return await response.json();
    } catch (error) {
      console.error('ProfileService: getAllUsers error:', error);
      throw error;
    }
  }

  // Check if email already exists in database
  static async checkEmailExists(email, excludeUserId = null) {
    try {
      const users = await this.getAllUsers();
      
      // Check if email exists, excluding the current user if editing profile
      const emailExists = users.some(user => 
        user.email.toLowerCase() === email.toLowerCase() && 
        (excludeUserId ? user.id !== excludeUserId : true)
      );
      
      return emailExists;
    } catch (error) {
      console.error('ProfileService: checkEmailExists error:', error);
      throw error;
    }
  }

  // Check if email exists and belongs to a STUDENT
  static async checkStudentEmailExists(email) {
    try {
      const users = await this.getAllUsers();
      
      // Find user with the email
      const user = users.find(user => 
        user.email.toLowerCase() === email.toLowerCase()
      );
      
      if (!user) {
        return { exists: false, isStudent: false, message: `No user found with email "${email}".` };
      }
      
      if (user.role !== 'STUDENT') {
        return { 
          exists: true, 
          isStudent: false, 
          message: `User with email "${email}" exists but is not a student (Role: ${user.role}).` 
        };
      }
      
      return { exists: true, isStudent: true, user: user };
    } catch (error) {
      console.error('ProfileService: checkStudentEmailExists error:', error);
      throw error;
    }
  }

  // Update user account info
  static async updateAccount(userId, { email, fullName, phone }) {
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/updateAccount/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify({ email, fullName, phone }),
    });

    if (!response.ok) {
      // Try to parse error as JSON, fallback to text
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: await response.text() };
      }
      throw new Error(errorData.message || 'Failed to update account');
    }

    // Always read as text, then try to parse as JSON
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      return text; // e.g. "Update Success"
    }
  } catch (error) {
    console.error('ProfileService: updateAccount error:', error);
    throw error;
  }
}

  // Reset user password (POST method)
  static async resetPassword(newPassword) {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/user/resetPassword?newPassword=${encodeURIComponent(newPassword)}`,
        {
          method: 'POST', // <-- changed from PUT to POST
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to reset password');
      }

      // Some APIs may not return a body for password reset
      try {
        return await response.json();
      } catch {
        return true;
      }
    } catch (error) {
      console.error('ProfileService: resetPassword error:', error);
      throw error;
    }
  }
}

export default ProfileService;