// Utility functions for JWT token handling
import { jwtDecode } from "jwt-decode";

export const tokenUtils = {
  // Decode token and return user data
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

  // Get user data from localStorage
  getUserData: () => {
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        return JSON.parse(userData);
      }
      return null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  },

  // Get token from localStorage
  getToken: () => {
    return localStorage.getItem("token");
  },

  // Check if user is logged in
  isLoggedIn: () => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    return !!(token && userData);
  },

  // Clear user data (for logout)
  clearUserData: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  // Map token data to your user structure
  mapTokenToUserProfile: (tokenData) => {
    return {
      accountId: tokenData.accountId || tokenData.sub,
      accountName: tokenData.accountName || tokenData.name,
      email: tokenData.email,
      fullName: tokenData.fullName || tokenData.name,
      gender: tokenData.gender,
      address: tokenData.address,
      phoneNumber: tokenData.phoneNumber,
      dateOfBirth: tokenData.dateOfBirth,
      status: tokenData.status,
      roleId: tokenData.roleId,
      createDate: tokenData.createDate,
      updateDate: tokenData.updateDate
    };
  }
};

export default tokenUtils;
