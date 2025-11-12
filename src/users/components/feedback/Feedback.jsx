// src/components/Feedback.jsx
import React, { useState } from "react";
import feedbackService from "@/api/feedbackService";
import { notifySuccess, notifyError, notifyWarning } from "@/components/notification/notification";

const Feedback = ({ booking, accountId, onClose, onSuccess }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!comment.trim()) {
      notifyWarning("Vui lòng nhập phản hồi!");
      return;
    }
    try {
      setLoading(true);
      await feedbackService.createFeedback({
        bookingId: booking.bookingId,
        accountId: accountId,
        rating,
        comment,
      });
      notifySuccess("Cảm ơn bạn đã gửi phản hồi!");
      onSuccess?.(); // refresh dashboard
      onClose();
    } catch (err) {
      console.error("Error submitting feedback:", err);
      notifyError("Gửi phản hồi thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-[400px] p-6 animate-fadeIn">
        <h2 className="text-3xl font-semibold text-gray-800 mb-4">
          Đánh giá trải nghiệm tại {booking.stationName}
        </h2>

        {/* Rating stars */}
        <div className="flex justify-center mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              onClick={() => setRating(star)}
              className={`cursor-pointer text-3xl ${
                star <= rating ? "text-yellow-400" : "text-gray-300"
              }`}
            >
              ★
            </span>
          ))}
        </div>

        {/* Comment box */}
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Nhập phản hồi của bạn..."
          className="w-full border border-gray-300 rounded-md p-2 text-2xl mb-4 focus:ring-2 focus:ring-orange-400"
        />

        {/* Buttons */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-2 bg-gray-200 rounded-md text-xl hover:bg-gray-300"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-3 py-2 bg-orange-500 text-white rounded-md text-xl hover:bg-orange-600 disabled:opacity-60"
          >
            {loading ? "Đang gửi..." : "Gửi phản hồi"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
