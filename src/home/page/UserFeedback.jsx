import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import tokenUtils from "@/utils/tokenUtils";
import feedbackService from "@/api/feedbackService";
import bookingService from "@/api/bookingService";
import authService from "@/api/authService";
import { MessageSquare, Star } from "lucide-react";
import FeedbackCard from "../components/feedback/FeedbackCard";
import FeedbackFormModal from "../components/feedback/FeedbackFormModal";

const UserFeedback = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState("my"); // "my" or "all"
  const [allFeedbacks, setAllFeedbacks] = useState([]);
  const [myFeedbacks, setMyFeedbacks] = useState([]);
  const [approvedBookings, setApprovedBookings] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  // Check authentication
  useEffect(() => {
    const checkAuth = () => {
      const loggedIn = tokenUtils.isLoggedIn();
      if (!loggedIn) {
        navigate("/login");
        return;
      }
      const user = tokenUtils.getUserData();
      setUserData(user);
    };
    checkAuth();
  }, [navigate]);

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

  // Fetch all feedbacks (for "all" tab)
  useEffect(() => {
    const fetchAllFeedbacks = async () => {
      if (!userData) return;
      try {
        setLoading(true);
        const response = await feedbackService.getAllFeedbacks();
        const feedbacks = response?.data?.data || response?.data || response || [];
        const feedbacksArray = Array.isArray(feedbacks) ? feedbacks : [];

        // Merge with accounts to get fullName
        const mergedFeedbacks = feedbacksArray.map((fb) => {
          const account = accounts.find((acc) => acc.accountId === fb.accountId);
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
    if (userData && accounts.length > 0) {
      fetchAllFeedbacks();
    }
  }, [userData, accounts]);

  // Fetch user's own feedbacks
  useEffect(() => {
    const fetchMyFeedbacks = async () => {
      if (!userData?.accountId) return;
      try {
        const response = await feedbackService.getFeedbackByAccountId(
          userData.accountId
        );
        const feedbacks = response?.data?.data || response?.data || response || [];
        const feedbacksArray = Array.isArray(feedbacks) ? feedbacks : [];

        // Merge with accounts to get fullName
        const mergedFeedbacks = feedbacksArray.map((fb) => {
          const account = accounts.find((acc) => acc.accountId === fb.accountId);
          return {
            ...fb,
            fullName:
              account?.fullName ||
              fb.fullName ||
              fb.accountName ||
              userData.fullName ||
              "Bạn",
          };
        });

        setMyFeedbacks(mergedFeedbacks);
      } catch (err) {
        console.error("Error fetching my feedbacks:", err);
        setMyFeedbacks([]);
      }
    };
    if (userData && accounts.length > 0) {
      fetchMyFeedbacks();
    }
  }, [userData, accounts]);

  // Fetch approved bookings
  useEffect(() => {
    const fetchApprovedBookings = async () => {
      if (!userData?.accountId) return;
      try {
        const response = await bookingService.getUserBookings(userData.accountId);
        const bookings = response?.data || response || [];
        // Filter only approved bookings
        const approved = bookings.filter(
          (b) => b.isApproved?.toLowerCase() === "approved"
        );
        setApprovedBookings(approved);
      } catch (err) {
        console.error("Error fetching approved bookings:", err);
        setApprovedBookings([]);
      }
    };
    if (userData) {
      fetchApprovedBookings();
    }
  }, [userData]);

  // Get current feedbacks based on active tab
  const currentFeedbacks = useMemo(() => {
    return activeTab === "my" ? myFeedbacks : allFeedbacks;
  }, [activeTab, myFeedbacks, allFeedbacks]);

  // Handle feedback submission
  const handleFeedbackSuccess = () => {
    setShowFeedbackForm(false);
    // Refresh feedbacks
    if (userData) {
      feedbackService
        .getFeedbackByAccountId(userData.accountId)
        .then((response) => {
          const feedbacks =
            response?.data?.data || response?.data || response || [];
          const feedbacksArray = Array.isArray(feedbacks) ? feedbacks : [];
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
                userData.fullName ||
                "Bạn",
            };
          });
          setMyFeedbacks(mergedFeedbacks);
        });
      feedbackService.getAllFeedbacks().then((response) => {
        const feedbacks =
          response?.data?.data || response?.data || response || [];
        const feedbacksArray = Array.isArray(feedbacks) ? feedbacks : [];
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
      });
    }
  };

  if (!userData) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-16 px-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-xl">Đang kiểm tra đăng nhập...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600">
            <MessageSquare className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Phản Hồi Của Tôi
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Quản lý và chia sẻ phản hồi của bạn về dịch vụ đổi pin
          </p>
        </div>

        {/* Tabs and Create Feedback Button */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            {/* Tabs */}
            <div className="flex gap-2 bg-white rounded-lg p-1 shadow-md">
              <button
                onClick={() => setActiveTab("my")}
                className={`px-6 py-3 rounded-lg font-semibold text-lg transition-all ${
                  activeTab === "my"
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Feedback của tôi
              </button>
              <button
                onClick={() => setActiveTab("all")}
                className={`px-6 py-3 rounded-lg font-semibold text-lg transition-all ${
                  activeTab === "all"
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Feedback khác
              </button>
            </div>

            {/* Create Feedback Button */}
            {approvedBookings.length > 0 && (
              <button
                onClick={() => setShowFeedbackForm(true)}
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg font-semibold text-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-md flex items-center gap-2"
              >
                <Star className="w-5 h-5" />
                Tạo phản hồi mới
              </button>
            )}
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
            {currentFeedbacks.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-xl">
                  {activeTab === "my"
                    ? "Bạn chưa có phản hồi nào"
                    : "Chưa có phản hồi nào"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {currentFeedbacks.map((feedback) => (
                  <FeedbackCard
                    key={feedback.feedbackId}
                    feedback={feedback}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Feedback Form Modal */}
        {showFeedbackForm && (
          <FeedbackFormModal
            bookings={approvedBookings}
            accountId={userData?.accountId}
            onClose={() => setShowFeedbackForm(false)}
            onSuccess={handleFeedbackSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default UserFeedback;

