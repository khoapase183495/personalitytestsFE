const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

class ParentService {
  // Get children (students) by parentId
  static async getChildren(parentId) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/user/${parentId}/children`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      }
    });
    if (!response.ok) {
      throw new Error(await response.text());
    }
    return await response.json();
  }

  // Attach student to parent
  static async addStudentToParent(parentId, studentEmail) {
    const token = localStorage.getItem('token');
    const response = await fetch(
      `${API_BASE_URL}/api/user/${parentId}/set-student?request=${encodeURIComponent(studentEmail)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        }
      }
    );
    if (!response.ok) {
      throw new Error(await response.text());
    }
    return await response.text(); // returns success message
  }
}

export default ParentService;