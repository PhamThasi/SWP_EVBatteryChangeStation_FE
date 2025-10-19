import axiosClient from "./axiosClient";

const authService = {
  login: async (email, password) => {
    try {
      const response = await axiosClient.post("/Authen/Login", {
        keyword: email,
        password: password,
      });
      console.log(" Login API Success:", response.data);
      return response.data;
    } catch (error) {
      console.error("Login API Error:", error);
      throw error;
    }
  },
  register: async (email, password) => {
    try {
      const response = await axiosClient.post("/Authen/register", {
        keyword: email,
        password: password,
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
      const response = await axiosClient.get("/Account/GetAll"); // ví dụ endpoint GET
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
  verifyOtp: async (email, otp) => {
    try {
      const response = await axiosClient.post("/Authen/verify-otp", {
        email,
        otpCode: otp,
      });
      console.log(" OTP Verify Success:", response.data);
      return response.data;
    } catch (error) {
      console.error("OTP Verify Error:", error);
      throw error;
    }
  },
};

export default authService;
