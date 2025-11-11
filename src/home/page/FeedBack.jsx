import React, { useState, useEffect, useMemo } from "react";
import feedbackService from "@/api/feedbackService";
import authService from "@/api/authService";
import { MessageSquare, Filter } from "lucide-react";
import FeedbackCard from "../components/feedback/FeedbackCard";

const Feedback = () => {
  const [allFeedbacks, setAllFeedbacks] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination & Filter
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0); // 0 = all, 1-5 = specific rating
  const ITEMS_PER_PAGE = 5;

  // Fetch accounts to get fullName
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await authService.getAll();
        const accountsData = response?.data || response || [];
        setAccounts(Array.isArray(accountsData) ? accountsData : []);
      } catch (err) {
        console.error("Error fetching accounts:", err);
        setAccounts([]);
      }
    };
    fetchAccounts();
  }, []);

  // Fetch all feedbacks
  useEffect(() => {
    const fetchAllFeedbacks = async () => {
      try {
        setLoading(true);
        const response = await feedbackService.getAllFeedbacks();
        // Handle different response structures
        const feedbacks =
          response?.data?.data || response?.data || response || [];
        const feedbacksArray = Array.isArray(feedbacks) ? feedbacks : [];

        // Merge with accounts to get fullName
        const mergedFeedbacks = feedbacksArray.map((fb) => {
          const account = accounts.find(
            (acc) => acc.accountId === fb.accountId
          );
          return {
            ...fb,
            fullName:
              account?.fullName ||
              fb.fullName ||
              fb.accountName ||
              "Khách hàng",
          };
        });

        setAllFeedbacks(mergedFeedbacks);
      } catch (err) {
        console.error("Error fetching all feedbacks:", err);
        setError("Không thể tải danh sách phản hồi");
        setAllFeedbacks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAllFeedbacks();
  }, [accounts]);

  // Filter feedbacks by rating
  const filteredFeedbacks = useMemo(() => {
    if (selectedRating === 0) return allFeedbacks;
    return allFeedbacks.filter((fb) => fb.rating === selectedRating);
  }, [allFeedbacks, selectedRating]);

  // Pagination
  const totalPages = Math.ceil(filteredFeedbacks.length / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedFeedbacks = filteredFeedbacks.slice(startIndex, endIndex);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(0);
  }, [selectedRating]);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-16 px-6 mt-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600">
            <MessageSquare className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Phản Hồi Khách Hàng
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Chia sẻ trải nghiệm của bạn về dịch vụ đổi pin tại Genki Power
          </p>
        </div>

        {/* Filter by Rating */}
        <div className="mb-8 bg-white rounded-lg p-4 shadow-md">
          <div className="flex items-center gap-4 flex-wrap">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="font-semibold text-gray-700">
              Lọc theo đánh giá:
            </span>
            <button
              onClick={() => setSelectedRating(0)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedRating === 0
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Tất cả
            </button>
            {[5, 4, 3, 2, 1].map((rating) => (
              <button
                key={rating}
                onClick={() => setSelectedRating(rating)}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-1 ${
                  selectedRating === rating
                    ? "bg-yellow-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span className="text-yellow-400">★</span>
                {rating} sao
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 text-xl">Đang tải phản hồi...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 text-xl">{error}</p>
          </div>
        )}

        {/* Feedbacks Grid */}
        {!loading && !error && (
          <>
            {paginatedFeedbacks.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-xl">Chưa có phản hồi nào</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {paginatedFeedbacks.map((feedback) => (
                    <FeedbackCard
                      key={feedback.feedbackId}
                      feedback={feedback}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                      <div className="text-gray-600 text-lg">
                        Hiển thị{" "}
                        <span className="font-bold text-blue-600">
                          {startIndex + 1}
                        </span>{" "}
                        -{" "}
                        <span className="font-bold text-blue-600">
                          {Math.min(endIndex, filteredFeedbacks.length)}
                        </span>{" "}
                        trong tổng số{" "}
                        <span className="font-bold text-gray-900">
                          {filteredFeedbacks.length}
                        </span>{" "}
                        phản hồi
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 0}
                          className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-all font-medium"
                        >
                          ← Trước
                        </button>
                        <div className="flex gap-1">
                          {Array.from({ length: totalPages }, (_, i) => (
                            <button
                              key={i}
                              onClick={() => setCurrentPage(i)}
                              className={`px-4 py-2 rounded-lg transition-all font-medium ${
                                currentPage === i
                                  ? "bg-blue-600 text-white shadow-md"
                                  : "bg-white border border-gray-300 hover:bg-gray-50 text-gray-700"
                              }`}
                            >
                              {i + 1}
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage >= totalPages - 1}
                          className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-all font-medium"
                        >
                          Sau →
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Feedback;
