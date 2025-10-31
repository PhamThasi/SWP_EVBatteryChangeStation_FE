import axiosClient from "./axiosClient";

const subcriptionService = {
  getSubscriptions: async () => {
    // eslint-disable-next-line no-useless-catch
    try {
      const response = await axiosClient.get("/Subscription/SelectAll");
      return response.data;
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      throw error;
    }
  },
  createSubscription: async (subscription) => {
    // eslint-disable-next-line no-useless-catch
    try {
      const response = await axiosClient.post("/Subscription/Create", subscription);
      return response.data;
    } catch (error) {
      console.error("Error creating subscription:", error);
      throw error;  
    }
  },
};

export default subcriptionService;
