import React from "react";
import { Star, User } from "lucide-react";
import { formatDateTime } from "@/utils/dateFormat";

const FeedbackCard = ({ feedback }) => {
  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all p-6 border border-gray-100">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-lg">
              {feedback.fullName || feedback.accountName || "Khách hàng"}
            </p>
            <p className="text-sm text-gray-500">
              {formatDateTime(feedback.createDate)}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-4">{renderStars(feedback.rating || 5)}</div>

      <p className="text-gray-700 leading-relaxed">
        {feedback.comment || "Không có bình luận"}
      </p>
    </div>
  );
};

export default FeedbackCard;

