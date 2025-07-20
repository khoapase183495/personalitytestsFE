const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

class BookingService {
  // Create a new booking
  static async createBooking(bookingData) {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/api/booking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(bookingData)
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      // Always read as text, then try to parse as JSON
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch {
        return text; // e.g. "Book successfully"
      }
    } catch (error) {
      console.error('Booking creation error:', error);
      throw error;
    }
  }

  // Get bookings by user ID
  static async getBookingsByUserId(userId) {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/api/booking/getByUserId/${userId}?id=${userId}`, {
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
    } catch (error) {
      console.error('Get bookings error:', error);
      throw error;
    }
  }
}

export default BookingService;