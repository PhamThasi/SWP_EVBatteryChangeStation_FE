import { register } from "react-social-icons";
import axiosClient from "./axiosClient";
import { data } from "react-router-dom";

const authService = {
  login: async (email, password) => {
    try {
      const response = await axiosClient.post("/Authen/Login", {
        keyword: email,
        password: password,
      },);
      console.log(" Login API Success:", response.data);
      return response.data;
    } catch (error) {
      console.error("Login API Error:", error);
      throw error;
    }
  },
  register: async (email, password, confirmPassword) => {
    try {
      const response = await axiosClient.post("/Authen/register", {
        keyword: email,
        password: password,
        confirmPassword: confirmPassword,
      });
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  getAll: async () => {
    try {
      const response = await axiosClient.get("/Account/GetAll",); // ví dụ endpoint GET
      console.log(
        "✅ Connected to API:",
        response.config.baseURL + response.config.url
      );
      console.log(" Response data:", response.data);
      return response.data;
    } catch (error) {
      console.error(" API Error:", error.message);
      throw error;
    }
  },
};

export default authService;
