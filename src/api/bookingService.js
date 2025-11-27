import axiosClient from "./axiosClient";

const bookingService = {
  createBooking: async ({
    dateTime,
    notes,
    stationId,
    vehicleId,
    accountId,
    isApproved = "Pending",
  }) => {
    // eslint-disable-next-line no-useless-catch
    try {
      const res = await axiosClient.post("/Booking/Create", {
        dateTime,
        notes,
        isApproved,
        stationId,
        vehicleId,
        accountId,
      });
      return res.data;
    } catch (error) {
      throw error;
    }
  },
  updateBooking: async (id, payload) => {
    // eslint-disable-next-line no-useless-catch
    try {
      const res = await axiosClient.put(`/Booking/Update/${id}`, payload);
      return res.data;
    } catch (error) {
      throw error;
    }
  },
  selectAllBookings: async () => {
    // eslint-disable-next-line no-useless-catch
    try {
      const res = await axiosClient.get("/Booking/SelectAll");
      return res.data;
    } catch (error) {
      throw error;
    }
  },
  getUserBookings: async (accountId) => {
    try {
      const res = await axiosClient.get(`/Booking/User/${accountId}`);
      return res.data;
    } catch (error) {
      console.error("Error getting user bookings:", error);
      throw error;
    }
  },
  getBookingById: async (bookingId) => {
    try {
      const res = await axiosClient.get(`/Booking/Select/${bookingId}`);
      return res.data;
    } catch (error) {
      console.error("Error getting booking by id:", error);
      throw error;
    }
  },
  deleteBooking: async (id) => {
    try {
      const res = await axiosClient.delete(`/Booking/Delete/${id}`);
      return res.data;
    } catch (error) {
      console.error("Error deleting booking:", error);
      throw error;
    }
  },
  staffBookingsSchedule: async () => {
    try {
      const res = await axiosClient.get("/Booking/staff/my-bookings");
      return res.data;
    } catch (error) {
      console.error("Error getting staff bookings schedule:", error);
      throw error;
    }
  },

  // Cập nhật status (isApproved) của booking
  updateBookingStatus: async ({ bookingId, status, notes }) => {
    try {
      const res = await axiosClient.put("/Booking/UpdateStatus", {
        bookingId,
        status,
        notes: notes || "",
      });
      return res.data;
    } catch (error) {
      console.error("Error updating booking status:", error);
      throw error;
    }
  },
};
export default bookingService;
