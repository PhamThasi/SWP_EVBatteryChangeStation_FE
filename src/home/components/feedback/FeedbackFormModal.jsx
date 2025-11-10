import React, { useState } from "react";
import { Star } from "lucide-react";
import feedbackService from "@/api/feedbackService";

const FeedbackFormModal = ({ bookings, accountId, onClose, onSuccess }) => {
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBookingId) {
      alert("Vui lòng chọn một booking!");
      return;
    }
    if (!comment.trim()) {
      alert("Vui lòng nhập phản hồi!");
      return;
    }

    try {
      setLoading(true);
      await feedbackService.createFeedback({
        bookingId: selectedBookingId,
        accountId: accountId,
        rating,
        comment: comment.trim(),
      });
      alert("Cảm ơn bạn đã gửi phản hồi!");
      onSuccess();
    } catch (err) {
      console.error("Error submitting feedback:", err);
      alert("Gửi phản hồi thất bại! Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Star className="w-8 h-8 text-orange-500" />
              Tạo phản hồi mới
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-200 w-10 h-10 rounded-full flex items-center justify-center transition-colors text-3xl"
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Select Booking */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2 text-lg">
              Chọn booking đã được xác nhận <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedBookingId}
              onChange={(e) => setSelectedBookingId(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-lg"
            >
              <option value="">-- Chọn booking --</option>
              {bookings.map((booking) => (
                <option key={booking.bookingId} value={booking.bookingId}>
                  {booking.dateTime
                    ? new Date(booking.dateTime).toLocaleString("vi-VN", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "N/A"}{" "}
                  - Trạm {booking.stationId || "N/A"}
                </option>
              ))}
            </select>
          </div>

          {/* Rating Stars */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2 text-lg">
              Đánh giá <span className="text-red-500">*</span>
            </label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-5xl transition-all ${
                    star <= rating
                      ? "text-yellow-400 scale-110"
                      : "text-gray-300 hover:text-yellow-300"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
            <p className="text-center text-gray-600 mt-2">{rating} sao</p>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2 text-lg">
              Phản hồi của bạn <span className="text-red-500">*</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              rows={5}
              placeholder="Chia sẻ trải nghiệm của bạn..."
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none text-lg"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all text-lg"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-60 text-lg"
            >
              {loading ? "Đang gửi..." : "Gửi phản hồi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackFormModal;

