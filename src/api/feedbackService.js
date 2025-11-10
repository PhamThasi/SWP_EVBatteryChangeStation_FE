// src/api/feedbackService.js
import axiosClient from "./axiosClient";

const feedbackService = {
  getAllFeedbacks: async () => {
    try {
      const res = await axiosClient.get("/FeedBack/SelectAll");
      return res.data;
    } catch (error) {
      console.error("❌ Error fetching all feedbacks:", error);
      throw error;
    }
  },

  getFeedbackById: async (id) => {
    try {
      const res = await axiosClient.get(`/FeedBack/Select/${id}`);
      return res.data;
    } catch (error) {
      console.error("❌ Error fetching feedback:", error);
      throw error;
    }
  },

  createFeedback: async ({ bookingId, accountId, rating, comment }) => {
    try {
      const res = await axiosClient.post("/FeedBack/Create", {
        bookingId,
        accountId,
        rating,
        comment,
      });
      return res.data;
    } catch (error) {
      console.error("❌ Error creating feedback:", error);
      throw error;
    }
  },

  updateFeedback: async (id, data) => {
    try {
      const res = await axiosClient.put(`/FeedBack/Update/${id}`, data);
      return res.data;
    } catch (error) {
      console.error("❌ Error updating feedback:", error);
      throw error;
    }
  },

  deleteFeedback: async (id) => {
    try {
      const res = await axiosClient.delete(`/FeedBack/HardDelete/${id}`);
      return res.data;
    } catch (error) {
      console.error("❌ Error deleting feedback:", error);
      throw error;
    }
  },
  getFeedbackByAccountId: async (id) => {
    try {
      const res = await axiosClient.get(`/FeedBack/SelectByAccount/${id}`);
      return res.data;
    } catch (error) {
      console.error("❌ Error fetching feedback:", error);
      throw error;
    }
  },

};

export default feedbackService;
