import axiosClient from "./axiosClient";

const authService = {
  login: async (email, password) => {
    try {
      console.log("AuthService: Making login request...");
      const response = await axiosClient.post("/Authen/Login", {
        keyword: email,
        password: password,
      });
      console.log("AuthService: Login response received:", response);
      console.log("AuthService: Response data:", response.data);
      // Không lưu token ở đây, để component xử lý
      return response;
    } catch (error) {
      console.error("AuthService: Login API Error:", error);
      throw error;
    }
  },
  register: async (email, password) => {
    try {
      const response = await axiosClient.post("/Authen/register", {
        email: email,
        password: password,
      });
      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  getAll: async () => {
    try {
      const response = await axiosClient.get("/Account/GetAll"); // ví dụ endpoint GET
      return response.data;
    } catch (error) {
      console.error(" API Error:", error.message);
      throw error;
    }
  },
  verifyOtp: async (email, otp) => {
    try {
      const response = await axiosClient.post("/Authen/verify-otp", {
        email: email,
        otpCode: otp,
      });
    
      return response.data;
    } catch (error) {
      console.error("OTP Verify Error:", error);
      throw error;
    }
  },
  logout: async () => {
    try {
      await axiosClient.post("/Authen/logout");
    } catch (err) {
      console.log(" Logout Error:", err);
      throw err;
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      console.log("AuthService: Making update profile request...");
      console.log("Profile data:", profileData);
      
      const response = await axiosClient.post("/Account/Update", {
        accountId: profileData.accountId,
        roleId: profileData.roleId,
        accountName: profileData.accountName,
        password: profileData.password || "", // Giữ nguyên password cũ nếu không thay đổi
        fullName: profileData.fullName,
        email: profileData.email,
        gender: profileData.gender,
        address: profileData.address,
        phoneNumber: profileData.phoneNumber,
        dateOfBirth: profileData.dateOfBirth
      });
      
      console.log("AuthService: Update profile response:", response);
      return response;
    } catch (error) {
      console.error("AuthService: Update profile API Error:", error);
      throw error;
    }
  },
  getUserByName: async(accountName) =>{
    try{
      const response = await axiosClient.get(`/Account/GetAccountByName?accview=${accountName}`);
      return response.data;
    }catch(error){
      console.error("AuthService: Get user name API Error:", error);
      throw error;
    }
  }
};

export default authService;
