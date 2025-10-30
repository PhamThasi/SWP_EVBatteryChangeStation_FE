import axiosClient from "./axiosClient";

const stationSevice = {
  getStationList: async () => {
    try {
      const response = await axiosClient.get("/Station/SelectAll");
      console.log(response.data.data);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching stations:", error);
      throw error;
    }
  },
};

export default stationSevice;
