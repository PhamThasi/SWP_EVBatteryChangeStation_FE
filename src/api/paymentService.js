import axiosClient from "./axiosClient";

const paymentService = {
  // Tạo payment mới
  createPayment: async (paymentData) => {
    try {
      const response = await axiosClient.post("/Payment/create", paymentData);
      return response.data;
    } catch (error) {
      console.error("Error creating payment:", error);
      throw error;
    }
  },

  // Lấy thông tin payment theo ID
  getPaymentById: async (paymentId) => {
    try {
      const response = await axiosClient.get(`/Payment/GetById/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error("Error getting payment by ID:", error);
      throw error;
    }
  },

  // Lấy tất cả payments
  getAllPayments: async () => {
    try {
      const response = await axiosClient.get("/Payment/GetAll");
      return response.data;
    } catch (error) {
      console.error("Error getting all payments:", error);
      throw error;
    }
  },

  // Lấy payments theo accountId
  getPaymentsByAccountId: async (accountId) => {
    try {
      const response = await axiosClient.get(`/Payment/get-by-account/${accountId}`);
      return response.data;
    } catch (error) {
      console.error("Error getting payments by account ID:", error);
      throw error;
    }
  },

  // Cập nhật payment
  updatePayment: async (paymentId, paymentData) => {
    try {
      const response = await axiosClient.put(`/Payment/Update/${paymentId}`, paymentData);
      return response.data;
    } catch (error) {
      console.error("Error updating payment:", error);
      throw error;
    }
  },

  // Xóa payment (soft delete)
  deletePayment: async (paymentId) => {
    try {
      const response = await axiosClient.delete(`/Payment/Delete/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting payment:", error);
      throw error;
    }
  },

  // Kiểm tra trạng thái subscription của user
  checkSubscriptionStatus: async (accountId) => {
    try {
      const response = await axiosClient.get("/Payment/check-subscription-status", {
        params: { accountId },
      });
      return response.data;
    } catch (error) {
      console.error("Error checking subscription status:", error);
      throw error;
    }
  },
};

export default paymentService;

