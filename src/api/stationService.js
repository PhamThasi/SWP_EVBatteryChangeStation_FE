import axiosClient from "./axiosClient";
import { notifyError } from "@/components/notification/notification";

const stationSevice = {
  getStationList: async () => {
    try {
      const response = await axiosClient.get("/Station/SelectAll");
      return response.data.data;
    } catch (error) {
      notifyError("Không thể tải danh sách trạm. Vui lòng thử lại!");
      console.error("Error fetching stations:", error);
      throw error;
    }
  },

  createStation: async (payload) => {
    try {
      const response = await axiosClient.post("/Station/Create", payload);
      return response.data;
    } catch (error) {
      notifyError("Không thể tạo trạm. Vui lòng thử lại!");
      console.error("Error creating station:", error);
      throw error;
    }
  },

  updateStation: async (stationId, payload) => {
    try {
      const response = await axiosClient.put(`/Station/Update/${stationId}`, payload);
      return response.data;
    } catch (error) {
      notifyError("Không thể cập nhật trạm. Vui lòng thử lại!");
      console.error("Error updating station:", error);
      throw error;
    }
  },

  deleteStation: async (stationId) => {
    try {
      const response = await axiosClient.delete(`/Station/Delete/${stationId}`);
      return response.data;
    } catch (error) {
      notifyError("Không thể xóa trạm. Vui lòng thử lại!");
      console.error("Error deleting station:", error);
      throw error;
    }
  },
  
  getStationsByName: async (keyword) => {
    try {
      const response = await axiosClient.get(`/Station/${keyword}`);
      return response.data;
    } catch (error) {
      notifyError("Không thể tải danh sách trạm. Vui lòng thử lại!");
      console.error("Error getting stations by name:", error);
      throw error;
    }
  },
};
export default stationSevice;
