import axiosClient from "./axiosClient";

const bookingService = {
  createBooking: async ({
    dateTime,
    notes,
    stationId,
    vehicleId,
    accountId,
  }) => {
    // eslint-disable-next-line no-useless-catch
    try {
      const res = await axiosClient.post("/Booking/Create", {
        dateTime,
        notes,
        stationId,
        vehicleId,
        accountId,
      });
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
    // eslint-disable-next-line no-useless-catch
    try {
      const res = await axiosClient.get(`/Booking/User/${accountId}`);
      return res.data;
    } catch (error) {
      throw error;
    }
  },
  deleteBooking: async (id) => {
    // eslint-disable-next-line no-useless-catch
    try {
      const res = await axiosClient.delete(`/Booking/Delete/${id}`);
      return res.data;
    } catch (error) {
      throw error;
    }
  },
};
export default bookingService;
