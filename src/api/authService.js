import axiosClient from "./axiosClient";

const authService = {
  // ---------------- LOGIN ----------------
  login: async (email, password) => {
    try {
      console.log("AuthService: Making login request...");
      const response = await axiosClient.post("/Authen/Login", {
        keyword: email,
        password: password,
      });
      console.log("AuthService: Login response:", response.data);
      return response;
    } catch (error) {
      console.error("AuthService: Login API Error:", error);
      throw error;
    }
  },

  // ---------------- REGISTER ----------------
  register: async (email, password) => {
    try {
      const response = await axiosClient.post("/Authen/register", {
        email: email,
        password: password,
      });
      return response.data;
    } catch (error) {
      console.error("Register Error:", error);
      throw error;
    }
  },

  // ---------------- GET ALL USERS ----------------
  getAll: async () => {
    try {
      const response = await axiosClient.get("/Account/GetAll");
      return response.data;
    } catch (error) {
      console.error("GetAll Error:", error.message);
      throw error;
    }
  },

  // ---------------- VERIFY OTP ----------------
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

  // ---------------- FORGOT PASSWORD FLOW ----------------
  sendForgotOtp: async (email) => {
    try {
      const response = await axiosClient.post("/Authen/forgot-password/send-otp", {
        email,
      });
      return response.data;
    } catch (error) {
      console.error("Send Forgot OTP Error:", error);
      throw error;
    }
  },

  verifyForgotOtp: async (email, otp) => {
    try {
      const response = await axiosClient.post("/Authen/forgot-password/verify-otp", {
        email,
        otpCode: otp,
      });
      return response.data;
    } catch (error) {
      console.error("Verify Forgot OTP Error:", error);
      throw error;
    }
  },

  resetPassword: async (email, newPassword) => {
    try {
      const response = await axiosClient.post("/Authen/forgot-password/reset", {
        email,
        newPassword,
      });
      return response.data;
    } catch (error) {
      console.error("Reset Password Error:", error);
      throw error;
    }
  },

  // ---------------- LOGOUT ----------------
  logout: async () => {
    try {
      await axiosClient.post("/Authen/logout");
    } catch (err) {
      console.error("Logout Error:", err);
      throw err;
    }
  },

  // ---------------- SOFT DELETE ACCOUNTS ----------------
  softDeleteAccounts: async (encode) => {
    try {
      // Use DELETE with query param `encode`: /Account/SoftDelete?encode=...
      const response = await axiosClient.delete("/Account/SoftDelete", {
        params: { encode },
      });
      return response.data ?? response;
    } catch (error) {
      console.error("SoftDelete Accounts Error:", error);
      throw error;
    }
  }, 

  // ---------------- UPDATE PROFILE ----------------
  updateProfile: async (profileData) => {
    try {
      console.log("AuthService: Making update profile request...");

      // ✅ tạo payload mà không bắt buộc phải có password
      const payload = {
        accountId: profileData.accountId,
        roleId: profileData.roleId || "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        accountName: profileData.accountName,
        fullName: profileData.fullName || "",
        email: profileData.email || "",
        gender: profileData.gender || "",
        address: profileData.address || "",
        phoneNumber: profileData.phoneNumber || "",
        stationId: profileData.stationId || null,
        status: profileData.status ?? true,
        dateOfBirth: profileData.dateOfBirth
          ? new Date(profileData.dateOfBirth).toISOString().split("T")[0]
          : null,
        updateDate: new Date().toISOString(),
      };

      // ✅ chỉ thêm password khi có
      if (profileData.password && profileData.password.trim() !== "") {
        payload.password = profileData.password;
      }

      console.log("🟢 Payload gửi BE:", payload);

      const response = await axiosClient.put("/Account/Update", payload);
      console.log("✅ Update profile response:", response);
      return response;
    } catch (error) {
      console.error("❌ AuthService: Update profile API Error:", error);
      throw error;
    }
  }, 

  // ---------------- CREATE ACCOUNT ----------------
  createAccount: async (accountData) => {
    try {
      const payload = {
        roleId: accountData.roleId,
        accountName: accountData.accountName,
        password: accountData.password,
        fullName: accountData.fullName,
        email: accountData.email,
        gender: accountData.gender,
        address: accountData.address,
        phoneNumber: accountData.phoneNumber,
        createDate: accountData.createDate
          ? new Date(accountData.createDate).toISOString()
          : new Date().toISOString(),
        dateOfBirth: accountData.dateOfBirth
          ? new Date(accountData.dateOfBirth).toISOString().split("T")[0]
          : null,
        stationId: accountData.stationId || null,
        status: accountData.status ?? true,
      };

      const response = await axiosClient.post("/Account/Create", payload);
      return response.data ?? response;
    } catch (error) {
      console.error("Create Account Error:", error);
      throw error;
    }
  },

  // ---------------- GET USER BY NAME ----------------
  getUserByName: async (accountName) => {
    try {
      const response = await axiosClient.get(
        `/Account/GetAccountByName?accview=${accountName}`
      );
      return response.data;
    } catch (error) {
      console.error("GetUserByName Error:", error);
      throw error;
    }
  },
  
};

export default authService;
