import axiosClient from "./axiosClient";

const supportRequestService = {
  createSupportRequest: async (supportRequest) => {
    try {
      const response = await axiosClient.post(
        "/SupportRequest/Create",
        supportRequest
      );
      return response.data;
    } catch (error) {
      console.error("Error creating support request:", error);
      throw error;
    }
  },
  getByAccountId: async (accountId) => {
    try {
      const response = await axiosClient.get(
        `/SupportRequest/GetByAccount/${accountId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error getting support requests by account ID:", error);
      throw error;
    }
  },
  softDelete: async (requestId) => {
    try {
      const response = await axiosClient.put(
        `/SupportRequest/SoftDelete/${requestId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error soft deleting support request:", error);
      throw error;
    }
  },
  hardDelete: async (requestId) => {
    try {
      const response = await axiosClient.delete(
        `/SupportRequest/HardDelete/${requestId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error hard deleting support request:", error);
      throw error;
    }
  },
};

export default supportRequestService;
