import axiosClient from "./axiosClient";

const carService = {
  createCar: async ({ model, batteryType, producer, createDate, images, status }) => {
    try {
      const res = await axiosClient.post("/Car/CreateCar", {
        model: model,
        batteryType: batteryType,
        producer: producer,
        createDate: createDate || new Date().toISOString(),
        images: images || null,
        status: status || "Available",
      });
      console.log("CarService: Create car response:", res);
      return res.data;
    } catch (error) {
      console.error("CarService: Create car API Error:", error);
      throw error;
    }
  },

  getAllCars: async () => {
    try {
      const res = await axiosClient.get("/Car/GetAllCar");
      console.log("CarService: Get all cars response:", res);
      return res.data.data || [];
    } catch (error) {
      console.error("CarService: Get all cars API Error:", error);
      throw error;
    }
  },

  updateCar: async (vehicleId, { model, batteryType, producer, images, createDate, status }) => {
    try {
      const res = await axiosClient.put("/Car/UpdateCar", {
        vehicleId: vehicleId,
        model: model,
        batteryType: batteryType,
        producer: producer,
        images: images || null,
        createDate: createDate,
        status: status,
      });
      console.log("CarService: Update car response:", res);
      return res.data;
    } catch (error) {
      console.error("CarService: Update car API Error:", error);
      throw error;
    }
  },

  getCarById: async (vehicleId) => {
    try {
      const res = await axiosClient.get(`/Car/GetCarById?carId=${vehicleId}`);
      return res.data?.data;
    } catch (error) {
      console.error("CarService: Get car by ID API Error:", error);
      throw error;
    }
  },

  deleteCar: async (carId) => {
    try {
      const res = await axiosClient.delete(`/Car/DeleteCar/${carId}`);
      console.log("CarService: Delete car response:", res);
      return res.data;
    } catch (error) {
      console.error("CarService: Delete car API Error:", error);
      throw error;
    }
  },
};

export default carService;