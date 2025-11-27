import axiosClient from "./axiosClient";
import { notifyError } from "@/components/notification/notification";

const batteryService = {
  getAllBatteries: async () => {
    try {
      const response = await axiosClient.get("/Battery/GetAllBattery");
      return response.data?.data || [];
    } catch (error) {
      console.error("Error fetching batteries:", error);
      notifyError("Không thể tải danh sách pin!");
      throw error;
    }
  },

  // Lấy danh sách pin của station mà staff đang làm việc (yêu cầu đăng nhập)
  getMyStationBatteries: async () => {
    try {
      const response = await axiosClient.get("/Battery/staff/my-station-batteries");
      // Cấu trúc: response.data.data.batteries
      const batteries = response.data?.data?.batteries || [];
      return Array.isArray(batteries) ? batteries : [];
    } catch (error) {
      console.error("Error fetching my station batteries:", error);
      notifyError("Không thể tải danh sách pin của trạm!");
      throw error;
    }
  },

  getBatteryById: async (batteryId) => {
    try {
      const response = await axiosClient.get(`/Battery/GetBatteryById/${batteryId}`);
      return response.data?.data;
    } catch (error) {
      console.error("Error fetching battery:", error);
      throw error;
    }
  },

  // Lọc pin theo loại pin (typeBattery) phù hợp với batteryType của car
  getBatteriesByType: async (batteryType) => {
    try {
      const allBatteries = await batteryService.getAllBatteries();
      // So sánh typeBattery của pin với batteryType của car (case-insensitive)
      const normalizedType = (batteryType || "").toLowerCase();
      return allBatteries.filter(
        (b) => (b.typeBattery || "").toLowerCase() === normalizedType && b.status === true
      );
    } catch (error) {
      console.error("Error filtering batteries by type:", error);
      throw error;
    }
  },

  // Đếm số lượng pin theo stationId (chỉ đếm pin có status = true)
  getBatteryCountByStationId: async (stationId) => {
    try {
      const allBatteries = await batteryService.getAllBatteries();
      return allBatteries.filter(
        (b) => b.stationId === stationId && b.status === true
      ).length;
    } catch (error) {
      console.error("Error counting batteries by station:", error);
      throw error;
    }
  },

  // Lấy danh sách pin theo stationId (chỉ pin có status = true)
  getBatteriesByStationId: async (stationId) => {
    try {
      const allBatteries = await batteryService.getAllBatteries();
      return allBatteries.filter(
        (b) => b.stationId === stationId && b.status === true
      );
    } catch (error) {
      console.error("Error getting batteries by station:", error);
      throw error;
    }
  },

  // Cập nhật battery (để set status = false khi đã dùng)
  updateBattery: async (batteryId, payload) => {
    try {
      const response = await axiosClient.put("/Battery/UpdateBattery", {
        batteryId: batteryId,
        ...payload,
      });
      return response.data;
    } catch (error) {
      console.error("Error updating battery:", error);
      throw error;
    }
  },
  // Preview pin sẽ được gán cho booking (BE tự chọn pin phù hợp)
  previewForBooking: async (stationId, vehicleId) => {
    try {
      const response = await axiosClient.get("/Battery/PreviewForBooking", {
        params: { stationId, vehicleId },
      });
      return response.data;
    } catch (error) {
      console.error("Error previewing booking:", error);
      throw error;
    }
  },
};

export default batteryService;

