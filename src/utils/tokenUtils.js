// Utility functions for JWT token handling
import { jwtDecode } from "jwt-decode";

export const tokenUtils = {
  // ==================== CORE TOKEN FUNCTIONS ====================

  // Decode token and return raw token data
  decodeToken: (token) => {
    try {
      const decoded = jwtDecode(token);
      console.log("Decoded token:", decoded);
      return decoded;
    } catch (error) {
      console.error("Token decode error:", error);
      return null;
    }
  },

  // Get token from localStorage
  getToken: () => {
    return localStorage.getItem("token");
  },

  // ==================== USER DATA STORAGE ====================

  // Get user data from localStorage
  getUserData: () => {
    try {
      const userData = localStorage.getItem("user");
      console.log("User data from localStorage:", userData);
      if (userData) {
        return JSON.parse(userData);
      }
      return null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  },

  // Save user data to localStorage
  saveUserData: (userData) => {
    try {
      console.log("Attempting to save user data to localStorage:", userData);
      const jsonString = JSON.stringify(userData);
      console.log("JSON string to save:", jsonString);

      localStorage.setItem("user", jsonString);

      // Verify data was saved
      const savedData = localStorage.getItem("user");
      console.log("Data retrieved from localStorage after save:", savedData);

      if (savedData) {
        console.log("User data saved to localStorage successfully");
        return true;
      } else {
        console.error("Failed to verify data in localStorage");
        return false;
      }
    } catch (error) {
      console.error("Error saving user data:", error);
      return false;
    }
  },

  // Clear user data (for logout)
  clearUserData: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    console.log("User data cleared from localStorage");
  },

  // ==================== DATA MAPPING FUNCTIONS ====================

  // Map token data to user profile structure
  mapTokenToUserProfile: (tokenData) => {
    const mappedProfile = {
      accountId: tokenData.accountId || tokenData.sub,
      accountName: tokenData.accountName || tokenData.name,
      email: tokenData.email,
      fullName: tokenData.fullName || tokenData.name,
      name: tokenData.fullName || tokenData.name, // Thêm field name cho component
      gender: tokenData.gender,
      address: tokenData.address,
      phoneNumber: tokenData.phoneNumber,
      dateOfBirth: tokenData.dateOfBirth,
      status: tokenData.status,
      roleId: tokenData.roleId,
      role: tokenData.role || "User", // Thêm field role cho component
      createDate: tokenData.createDate,
      updateDate: tokenData.updateDate,
    };

    return mappedProfile;
  },

  // Map API response data to user profile structure
  mapApiResponseToUserProfile: (apiData) => {
    const mappedProfile = {
      accountId: apiData.accountId,
      accountName: apiData.accountName,
      email: apiData.email,
      fullName: apiData.fullName,
      name: apiData.accountName, // Thêm field name cho component
      gender: apiData.gender,
      address: apiData.address,
      phoneNumber: apiData.phoneNumber,
      dateOfBirth: apiData.dateOfBirth,
      status: apiData.status,
      roleId: apiData.roleId,
      role: apiData.role || "User",
      createDate: apiData.createDate,
      updateDate: apiData.updateDate,
    };

    return mappedProfile;
  },

  // ==================== LOGIN FLOW FUNCTIONS ====================

  // Process token after login - decode JWT → lấy name → gọi API → lưu data đầy đủ
  processLoginToken: async (token) => {
    try {
      console.log("Processing login token...");

      // Decode token để lấy name
      const decoded = tokenUtils.decodeToken(token);
      if (!decoded) return null;

      const accountName = decoded.name;
      if (!accountName) {
        console.error("No account name found in token");
        return null;
      }

      console.log("Account name from token:", accountName);

      // Gọi API để lấy data đầy đủ
      const apiData = await tokenUtils.fetchUserDataFromAPI();

      if (apiData) {
        console.log(
          "API data received and already saved to localStorage:",
          apiData
        );
        console.log("Login token processed successfully");
        return apiData;
      } else {
        console.error("Failed to fetch user data from API");
        return null;
      }
    } catch (error) {
      console.error("Error processing login token:", error);
      return null;
    }
  },

  // ==================== API INTEGRATION FUNCTIONS ====================

  // Get account name from token
  getAccountNameFromToken: () => {
    try {
      const token = tokenUtils.getToken();
      if (!token) return null;

      const decoded = tokenUtils.decodeToken(token);
      return decoded?.name || null;
    } catch (error) {
      console.error("Error getting account name from token:", error);
      return null;
    }
  },

  // Fetch user data from API using token
  fetchUserDataFromAPI: async () => {
    try {
      const accountName = tokenUtils.getAccountNameFromToken();
      if (!accountName) {
        console.error("No account name found in token");
        return null;
      }

      console.log("Fetching user data for account:", accountName);

      // Import authService dynamically để tránh circular dependency
      const { default: authService } = await import("@/api/authService");

      // Gọi API để lấy thông tin user đầy đủ
      const response = await authService.getUserByName(accountName);

      if (response && response.data) {
        console.log("User data from API:", response.data);

        //  FIX: handle array response
        const apiUser = Array.isArray(response.data)
          ? response.data[0]
          : response.data;

        // Map dữ liệu
        const userProfile = tokenUtils.mapApiResponseToUserProfile(apiUser);

        // Lưu vào localStorage
        tokenUtils.saveUserData(userProfile);


        return userProfile;
      }

      return null;
    } catch (error) {
      console.error("Error fetching user data from API:", error);
      return null;
    }
  },

  // ==================== UTILITY FUNCTIONS ====================

  // Check if token is valid (not expired)
  isTokenValid: () => {
    try {
      const token = tokenUtils.getToken();
      if (!token) return false;

      const decoded = tokenUtils.decodeToken(token);
      if (!decoded) return false;

      // Check if token has expiration time
      if (decoded.exp) {
        const currentTime = Math.floor(Date.now() / 1000);
        if (decoded.exp < currentTime) {
          console.log("Token has expired");
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error("Error checking token validity:", error);
      return false;
    }
  },

  // Check if user is logged in
  isLoggedIn: () => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    const isValid = tokenUtils.isTokenValid();
    return !!(token && userData && isValid);
  },

  // Auto login using existing token (for seamless re-login)
  autoLogin: async () => {
    try {
      console.log("Attempting auto login...");
      
      const token = tokenUtils.getToken();
      if (!token) {
        console.log("No token found");
        return false;
      }

      // Check if token is valid
      if (!tokenUtils.isTokenValid()) {
        console.log("Token is invalid or expired");
        tokenUtils.clearUserData();
        return false;
      }

      // Check if user data exists
      let userData = tokenUtils.getUserData();
      
      // If no user data or incomplete, fetch from API
      if (!userData || !userData.email || !userData.fullName) {
        console.log("User data missing or incomplete, fetching from API...");
        userData = await tokenUtils.fetchUserDataFromAPI();
      } else {
        // Even if we have cached data, refresh it to ensure it's up to date
        console.log("Refreshing user data from API...");
        const refreshedData = await tokenUtils.fetchUserDataFromAPI();
        if (refreshedData) {
          userData = refreshedData;
        }
      }

      if (userData) {
        console.log("Auto login successful:", userData);
        return userData;
      }

      return false;
    } catch (error) {
      console.error("Error during auto login:", error);
      return false;
    }
  },

  // Get user profile - chỉ lấy data từ localStorage
  getUserProfile: async (forceRefresh = false) => {
    try {
      // Nếu force refresh, gọi API để lấy data mới
      if (forceRefresh) {
        console.log("Force refresh - fetching fresh data from API...");
        const apiData = await tokenUtils.fetchUserDataFromAPI();
        if (apiData) {
          return apiData;
        }
      }

      // Lấy data từ localStorage
      const cachedData = tokenUtils.getUserData();
      if (cachedData && cachedData.email && cachedData.fullName) {
        console.log("Using cached user data from localStorage");
        return cachedData;
      }

      // Nếu không có data trong localStorage, gọi API
      console.log("No cached data found, fetching from API...");
      const apiData = await tokenUtils.fetchUserDataFromAPI();

      if (apiData) {
        return apiData;
      }

      console.error("No user data available");
      return null;
    } catch (error) {
      console.error("Error getting user profile:", error);
      return null;
    }
  },
};

export default tokenUtils;
