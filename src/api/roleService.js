import axiosClient from "./axiosClient";

const roleService = {
  getAllRoles: async () => {
    try {
      const response = await axiosClient.get("/Role/GetAll");
      return response.data;
    } catch (error) {
      console.error("Error getting all roles:", error);
      throw error;
    }
  },
};
export default roleService;
