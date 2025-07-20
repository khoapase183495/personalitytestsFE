// API Service for admin booking management
const API_BASE_URL = 'http://localhost:8080';

class AdminBookingService {
  // Get all bookings (admin only)
  static async getAllBookings() {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/booking/getAll`, {
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
      console.error('AdminBookingService: Error fetching bookings:', error);
      throw error;
    }
  }

  // Get bookings by user ID (admin only)
  static async getBookingsByUserId(userId) {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/booking/getByUserId/${userId}`, {
        method: 'GET',
        headers: headers
      });

      if (!response.ok) {
        let errorMessage = 'Failed to get user bookings';
        
        if (response.status === 404) {
          errorMessage = 'User not found or no bookings';
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
      console.error('AdminBookingService: Error fetching user bookings:', error);
      throw error;
    }
  }

  // Delete booking (admin only)
  static async deleteBooking(bookingId) {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/booking/delete/${bookingId}`, {
        method: 'DELETE',
        headers: headers
      });

      if (!response.ok) {
        let errorMessage = 'Failed to delete booking';
        
        try {
          const errorData = await response.json();
          if (response.status === 404) {
            errorMessage = 'Booking not found';
          } else {
            errorMessage = errorData.message || errorMessage;
          }
        } catch (parseError) {
          // Silent error parsing
        }
        
        throw new Error(errorMessage);
      }

      return { message: 'Booking deleted successfully' };
      
    } catch (error) {
      console.error('AdminBookingService: Error deleting booking:', error);
      throw error;
    }
  }

  // Update booking status (if backend supports it)
  static async updateBookingStatus(bookingId, status) {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/booking/updateStatus/${bookingId}`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        let errorMessage = 'Failed to update booking status';
        
        try {
          const errorData = await response.json();
          if (response.status === 404) {
            errorMessage = 'Booking not found';
          } else if (response.status === 400) {
            errorMessage = errorData.message || 'Invalid status';
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
      console.error('AdminBookingService: Error updating booking status:', error);
      throw error;
    }
  }

  // Get booking statistics (calculated from booking data)
  static async getBookingStats() {
    try {
      const bookings = await this.getAllBookings();
      
      const activeBookings = bookings.filter(booking => !booking.isDeleted);
      const now = new Date();
      
      // Categorize bookings by time
      const upcomingBookings = activeBookings.filter(booking => new Date(booking.bookTime) > now);
      const pastBookings = activeBookings.filter(booking => new Date(booking.bookTime) <= now);
      
      // Today's bookings
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const todayBookings = activeBookings.filter(booking => {
        const bookingDate = new Date(booking.bookTime);
        return bookingDate >= today && bookingDate < tomorrow;
      });

      // This week's bookings
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);
      
      const thisWeekBookings = activeBookings.filter(booking => {
        const bookingDate = new Date(booking.bookTime);
        return bookingDate >= startOfWeek && bookingDate < endOfWeek;
      });
      
      return {
        totalBookings: bookings.length,
        activeBookings: activeBookings.length,
        deletedBookings: bookings.filter(booking => booking.isDeleted).length,
        upcomingBookings: upcomingBookings.length,
        pastBookings: pastBookings.length,
        todayBookings: todayBookings.length,
        thisWeekBookings: thisWeekBookings.length,
        recentBookings: activeBookings
          .sort((a, b) => new Date(b.createAt) - new Date(a.createAt))
          .slice(0, 5)
      };
      
    } catch (error) {
      console.error('AdminBookingService: Error calculating booking stats:', error);
      return {
        totalBookings: 0,
        activeBookings: 0,
        deletedBookings: 0,
        upcomingBookings: 0,
        pastBookings: 0,
        todayBookings: 0,
        thisWeekBookings: 0,
        recentBookings: []
      };
    }
  }
}

export default AdminBookingService;
