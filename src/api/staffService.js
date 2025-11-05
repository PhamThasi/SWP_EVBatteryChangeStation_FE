import axiosClient from "./axiosClient";

const staffService = {
  getAllSupportRequests: async () => {
    try {
      const response = await axiosClient.get("/SupportRequest/GetAll");
      return response.data;
    } catch (error) {
      console.error("Error getting all support requests:", error);
      throw error;
    }
  },
  updateSupportRequest: async (id, supportRequest) => {
    try {
      const response = await axiosClient.put(`/SupportRequest/Update/${id}`, supportRequest);
      return response.data;
    } catch (error) {
      console.error("Error updating support request:", error);
      throw error;
    }
  },
};

export default staffService;
