import axiosClient from "./axiosClient";

const subcriptionService = {
  getSubscriptions: async () => {
    try {
      const response = await axiosClient.get("/Subscription/SelectAll");
      return response.data;
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      throw error;
    }
  },
  
  // Lấy chỉ các subscriptions đang active (dùng cho user)
  getActiveSubscriptions: async () => {
    try {
      const response = await axiosClient.get("/Subscription/SelectAll");
      const allSubscriptions = response.data?.data || [];
      // Filter chỉ lấy subscriptions có isActive === true
      return {
        ...response.data,
        data: allSubscriptions.filter((sub) => sub.isActive === true),
      };
    } catch (error) {
      console.error("Error fetching active subscriptions:", error);
      throw error;
    }
  },
  
  createSubscription: async (subscription) => {
    try {
      const response = await axiosClient.post("/Subscription/Create", subscription);
      return response.data;
    } catch (error) {
      console.error("Error creating subscription:", error);
      throw error;
    }
  },
  
  updateSubscription: async (subscriptionId, subscription) => {
    try {
      const response = await axiosClient.put(`/Subscription/Update/${subscriptionId}`, subscription);
      return response.data;
    } catch (error) {
      console.error("Error updating subscription:", error);
      throw error;
    }
  },
  
  deleteSubscription: async (subscriptionId) => {
    try {
      const response = await axiosClient.delete(`/Subscription/SoftDelete/${subscriptionId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting subscription:", error);
      throw error;
    }
  },

  // Lấy gói subscription đang active của user hiện tại (từ JWT token)
  getMySubscription: async () => {
    try {
      const response = await axiosClient.get("/Subscription/my");
      return response.data; // { data: { subscriptionId, endDate, remainingSwaps, isActive, ... } } hoặc null
    } catch (error) {
      // Nếu 404 hoặc không có gói, trả về null thay vì throw
      if (error?.response?.status === 404) {
        return { data: null };
      }
      console.error("Error fetching my subscription:", error);
      throw error;
    }
  },
};

export default subcriptionService;
