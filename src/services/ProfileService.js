const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

class ProfileService {
  // Update user account info
  static async updateAccount(userId, { email, username, phone }) {
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/updateAccount/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify({ email, username, phone }),
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