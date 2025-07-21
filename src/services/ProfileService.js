const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

class ProfileService {
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

  // Get all users to check for email conflicts
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

  // Check if email already exists (excluding current user for profile updates)
  static async checkEmailExists(email, excludeUserId = null) {
    try {
      const users = await this.getAllUsers();
      return users.some(user => 
        user.email.toLowerCase() === email.toLowerCase() && 
        user.id !== excludeUserId
      );
    } catch (error) {
      console.error('ProfileService: checkEmailExists error:', error);
      // If we can't check, assume it doesn't exist to avoid blocking valid operations
      return false;
    }
  }
}

export default ProfileService;