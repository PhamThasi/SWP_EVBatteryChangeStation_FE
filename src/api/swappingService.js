import axiosClient from "./axiosClient";
import { notifySuccess, notifyError } from "@/components/notification/notification";
import batteryService from "./batteryService";
import carService from "./carService";

const swappingService = {
  createSwapping: async (payload) => {
    try {
      // Validate: Kiểm tra xem có pin sẵn sàng tại trạm không (nếu có stationId)
      if (payload.stationId) {
        const availableBatteries = await batteryService.getBatteriesByStationId(payload.stationId);
        if (availableBatteries.length === 0) {
          notifyError("Trạm này không còn pin sẵn sàng để đổi!");
          throw new Error("Không có pin sẵn sàng tại trạm");
        }
      }

      const response = await axiosClient.post("/Swapping/CreateSwapping", {
        notes: payload.notes || "Battery transfer",
        staffId: payload.staffId,
        oldBatteryId: payload.oldBatteryId || "",
        vehicleId: payload.vehicleId,
        newBatteryId: payload.newBatteryId,
        status: payload.status || "pending",
        createDate: payload.createDate || new Date().toISOString(),
      });
      notifySuccess("Tạo giao dịch đổi pin thành công!");
      return response.data;
    } catch (error) {
      console.error("Error creating swapping:", error);
      if (error.message !== "Không có pin sẵn sàng tại trạm") {
        notifyError("Không thể tạo giao dịch đổi pin!");
      }
      throw error;
    }
  },

  updateSwapping: async (payload) => {
    try {
      // Validate: Nếu đang cập nhật status thành "Completed" hoặc "In Progress", kiểm tra pin sẵn sàng
      if ((payload.status === "Completed" || payload.status === "In Progress") && payload.stationId) {
        const availableBatteries = await batteryService.getBatteriesByStationId(payload.stationId);
        if (availableBatteries.length === 0) {
          notifyError("Trạm này không còn pin sẵn sàng để đổi!");
          throw new Error("Không có pin sẵn sàng tại trạm");
        }
      }

      const response = await axiosClient.put("/Swapping/UpdateSwapping", {
        transactionId: payload.transactionId,
        notes: payload.notes,
        staffId: payload.staffId,
        oldBatteryId: payload.oldBatteryId || "",
        vehicleId: payload.vehicleId,
        newBatteryId: payload.newBatteryId,
        status: payload.status,
        createDate: payload.createDate,
      });

      notifySuccess("Cập nhật giao dịch đổi pin thành công!");
      return response.data;
    } catch (error) {
      console.error("Error updating swapping:", error);
      if (error.message !== "Không có pin sẵn sàng tại trạm") {
        notifyError("Không thể cập nhật giao dịch đổi pin!");
      }
      throw error;
    }
  },

  getAllSwapping: async (options = {}) => {
    try {
      const response = await axiosClient.get("/Swapping/GetAllSwapping");
      return response.data?.data || [];
    } catch (error) {
      console.error("Error fetching swappings:", error);
      // Chỉ hiển thị thông báo lỗi nếu không có flag silent
      if (!options.silent) {
        notifyError("Không thể tải danh sách giao dịch đổi pin!");
      }
      throw error;
    }
  },

  getSwappingByTransactionId: async (transactionId, options = {}) => {
    try {
      // Sử dụng silent: true để tránh duplicate error messages khi gọi từ bên trong service
      const allSwappings = await swappingService.getAllSwapping({ silent: true });
      return allSwappings.find((s) => s.transactionId === transactionId);
    } catch (error) {
      console.error("Error fetching swapping by transactionId:", error);
      // Chỉ hiển thị thông báo lỗi nếu không có flag silent và được gọi từ bên ngoài
      if (!options.silent) {
        notifyError("Không thể tải thông tin giao dịch đổi pin!");
      }
      throw error;
    }
  },

  getSwappingByBookingId: async (bookingId, options = {}) => {
    try {
      // Sử dụng silent: true để tránh duplicate error messages khi gọi từ bên trong service
      const allSwappings = await swappingService.getAllSwapping({ silent: true });
      // Tìm swapping có vehicleId trùng với booking
      return allSwappings.find((s) => s.vehicleId === bookingId);
    } catch (error) {
      console.error("Error fetching swapping by bookingId:", error);
      // Chỉ hiển thị thông báo lỗi nếu không có flag silent và được gọi từ bên ngoài
      if (!options.silent) {
        notifyError("Không thể tải thông tin giao dịch đổi pin!");
      }
      throw error;
    }
  },

  // Tạo swapping từ booking - tự động lấy thông tin từ booking
  createSwappingFromBooking: async (booking, staffId, options = {}) => {
    try {
      // Validate booking có đủ thông tin
      if (!booking.vehicleId || !booking.stationId) {
        notifyError("Booking thiếu thông tin vehicleId hoặc stationId!");
        throw new Error("Booking thiếu thông tin cần thiết");
      }

      // 1. Lấy loại pin của xe từ vehicleId
      const carData = await carService.getCarById(booking.vehicleId);
      if (!carData || !carData.batteryType) {
        notifyError("Không thể lấy thông tin loại pin của xe!");
        throw new Error("Không thể lấy thông tin loại pin");
      }

      // 2. Lấy danh sách pin phù hợp với batteryType
      const allCompatibleBatteries = await batteryService.getBatteriesByType(carData.batteryType);
      
      // 3. Lọc pin tại trạm từ stationId
      const compatibleBatteries = allCompatibleBatteries.filter(
        (b) => b.stationId === booking.stationId
      );

      if (compatibleBatteries.length === 0) {
        notifyError(`Trạm này không có pin loại "${carData.batteryType}" sẵn sàng để đổi!`);
        throw new Error("Không có pin phù hợp tại trạm");
      }

      // 4. Chọn pin ngẫu nhiên từ danh sách pin phù hợp
      const randomBattery = compatibleBatteries[Math.floor(Math.random() * compatibleBatteries.length)];

      // 5. Tạo swapping với thông tin đã lấy
      const swappingPayload = {
        notes: options.notes || `Đổi pin cho booking ${booking.bookingId || booking.id}`,
        staffId: staffId,
        vehicleId: booking.vehicleId,
        newBatteryId: randomBattery.batteryId,
        status: options.status || "Pending",
        createDate: options.createDate || booking.dateTime || new Date().toISOString(),
        stationId: booking.stationId,
        oldBatteryId: options.oldBatteryId || "",
      };

      // 6. Gọi createSwapping với payload đã chuẩn bị
      const result = await swappingService.createSwapping(swappingPayload);

      return {
        ...result,
        selectedBattery: randomBattery,
        carData: carData,
      };
    } catch (error) {
      console.error("Error creating swapping from booking:", error);
      throw error;
    }
  },

  // Staff xác nhận đổi pin: BE tự validate + tạo transaction + trừ pin + trừ lượt gói
  confirmAndSwap: async ({ bookingId, notes }) => {
    try {
      const response = await axiosClient.post("/Swapping/ConfirmAndSwap", {
        bookingId,
        notes: notes || `Đổi pin cho booking ${bookingId}`,
      });
      notifySuccess("Đổi pin thành công!");
      return response.data;
    } catch (error) {
      console.error("Error confirming swap:", error);
      const msg = error?.response?.data?.message || error?.message || "Không thể xác nhận đổi pin!";
      notifyError(msg);
      throw error;
    }
  },
};

export default swappingService;

