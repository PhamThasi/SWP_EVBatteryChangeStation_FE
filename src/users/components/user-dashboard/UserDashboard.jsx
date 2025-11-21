import React, { useEffect, useState } from "react";
// Đã thêm Star cho nút Phản hồi
import { Battery, Car, Calendar, MapPin, TrendingUp, Star } from "lucide-react"; 
import bookingService from "@/api/bookingService";
import feedbackService from "@/api/feedbackService";
import tokenUtils from "@/utils/tokenUtils";
import Feedback from "./../feedback/Feedback";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [refreshingFeedbacks, setRefreshingFeedbacks] = useState(false);

  // =================== FETCH DATA ===================
  useEffect(() => {
    const loadUserDashboard = async () => {
      const userData = tokenUtils.getUserData();
      if (!userData) return;
      setUser(userData);

      try {
        const [userBookings, allFeedbacks] =
          await Promise.all([
            bookingService.getUserBookings(userData.accountId),
            feedbackService.getAllFeedbacks(),
          ]);

        // Unwrap common API shapes
        const userBookingsArr = Array.isArray(userBookings)
          ? userBookings
          : userBookings?.data || userBookings?.Data || [];
        const allFeedbacksArr = Array.isArray(allFeedbacks)
          ? allFeedbacks
          : allFeedbacks?.data?.data || allFeedbacks?.data || [];

        const myFeedbacks = Array.isArray(allFeedbacksArr)
          ? allFeedbacksArr.filter((f) => f.accountId === userData.accountId)
          : [];

        setBookings(Array.isArray(userBookingsArr) ? userBookingsArr : []);
        setFeedbacks(myFeedbacks);
      } catch (err) {
        console.error("Error loading dashboard:", err);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    loadUserDashboard();
  }, []);

  // Refresh feedbacks only
  const refreshUserFeedbacks = async (accountId) => {
    if (!accountId) return;
    try {
      setRefreshingFeedbacks(true);
      const allFeedbacks = await feedbackService.getAllFeedbacks();
      const allFeedbacksArr = Array.isArray(allFeedbacks)
        ? allFeedbacks
        : allFeedbacks?.data?.data || allFeedbacks?.data || [];
      const myFeedbacks = Array.isArray(allFeedbacksArr)
        ? allFeedbacksArr.filter((f) => f.accountId === accountId)
        : [];
      setFeedbacks(myFeedbacks);
    } catch (err) {
      console.error("Error refreshing feedbacks:", err);
    } finally {
      setRefreshingFeedbacks(false);
    }
  };

  // =================== CHECK CONDITION ===================
  const canFeedback = (booking) => {
    if (!booking.dateTime) return false;

    const now = new Date();
    const bookingDate = new Date(booking.dateTime);
    const diffHours = (now - bookingDate) / (1000 * 60 * 60);
      const over10Hours = diffHours >= 10;

    const isExpiredStatus =
      booking.status === "Hết hạn" || booking.statusDisplay === "Hết hạn" || booking.isExpiredStatus === true;
    const isInactive = booking.status !== "Hoạt động" && booking.status !== true;

    const hasFeedback = feedbacks.some((f) => f.bookingId === booking.bookingId);

    // Có thể đánh giá nếu quá 10 tiếng HOẶC Hết hạn/Không hoạt động VÀ chưa có đánh giá
    return (over10Hours || isExpiredStatus || isInactive) && !hasFeedback;
  };

  const isExpiredOrInactive = (booking) => {
    if (!booking.dateTime) return false;
    const now = new Date();
    const bookingDate = new Date(booking.dateTime);
    const diffHours = (now - bookingDate) / (1000 * 60 * 60);
    const over10Hours = diffHours >= 10;
    const isExpiredStatus =
      booking.status === "Hết hạn" || booking.statusDisplay === "Hết hạn" || booking.isExpiredStatus === true;
    const isInactive = booking.status !== "Hoạt động" && booking.status !== true;
    return over10Hours || isExpiredStatus || isInactive;
  };

  // =================== FORMATTERS & BADGES ===================
  const formatDateTime = (value) => {
    if (!value) return "-";
    try {
      // Hiển thị đầy đủ cả giờ, phút, ngày, tháng, năm
      return new Date(value).toLocaleString("vi-VN", {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).replace(',', ' -'); // Ví dụ: "14:44 - 03/11/2025"
    } catch {
      return String(value);
    }
  };

  const formatDate = (value) => {
    if (!value) return "-";
    try {
      return new Date(value).toLocaleDateString("vi-VN");
    } catch {
      return String(value);
    }
  };

  const getStatusBadgeClass = (status) => {
    const normalized = (status === true ? "Hoạt động" : status === false ? "Không hoạt động" : status) || "";
    if (["Completed", "Hoạt động", "Đã hoàn tất"].includes(normalized)) {
      return "bg-green-100 text-green-700";
    }
    if (["Hết hạn", "Cancelled", "Đã hủy"].includes(normalized)) {
      return "bg-red-100 text-red-700";
    }
    return "bg-yellow-100 text-yellow-700";
  };

  const getStatusDisplay = (status) => {
    const normalized = (status === true ? "Hoạt động" : status === false ? "Không hoạt động" : status) || "";
    if (normalized === true) return "Hoạt động";
    if (normalized === false) return "Không hoạt động";
    return normalized || "Chờ xử lý";
  }

  // =================== RENDER ===================
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin h-16 w-16 border-4 border-orange-400 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const validBookings = Array.isArray(bookings) ? bookings : [];

  const totalBookings = validBookings.length;
  const totalStationsVisited = new Set(
    validBookings.map((b) => b.stationName)
  ).size;
  const totalSpent = validBookings.reduce(
    (sum, b) => sum + (b.totalPrice || 0),
    0
  );

  const chartData = Array.from({ length: 12 }, (_, i) => ({
    month: `${i + 1}`,
    swaps: validBookings.filter(
      (b) => new Date(b.dateTime).getMonth() === i
    ).length,
  }));

  // Lọc danh sách booking cần đánh giá
  const bookingsToReview = validBookings
    .filter((b) => isExpiredOrInactive(b) && !feedbacks.some((f) => f.bookingId === b.bookingId));

  // Những booking sắp tới: isApproved = "Pending"
  const upcomingBookings = validBookings
    .filter((b) => String(b.isApproved || b.isApprove || "").toLowerCase() === "pending")
    .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Tiêu đề chính: Tăng lên 4XL theo yêu cầu */}
      <h1 className="text-4xl font-extrabold text-orange-700 mb-8">
        Xin chào, {user?.fullName || "User"} 👋
      </h1>

      {/* =================== THỐNG KÊ CARD =================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <DashboardCard
          title="Tổng số lần đổi pin"
          value={totalBookings}
          icon={<Battery className="text-blue-600" />}
        />
        <DashboardCard
          title="Số trạm từng đến"
          value={totalStationsVisited}
          icon={<MapPin className="text-purple-600" />}
        />
        <DashboardCard
          title="Tổng chi tiêu (VNĐ)"
          value={totalSpent.toLocaleString("vi-VN")}
          icon={<TrendingUp className="text-red-500" />}
        />
      </div>

      {/* =================== BIỂU ĐỒ =================== */}
      {/* Tiêu đề phần: Tăng lên 2XL theo yêu cầu */}
      <div className="bg-white shadow-xl rounded-xl p-8 mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Biểu đồ số lượt đổi pin trong năm
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} />
            <YAxis />
            <Tooltip 
                formatter={(value) => [`${value} lượt`, 'Số lượt đổi pin']} 
                labelFormatter={(label) => `Tháng ${label}`}
            />
            <Line
              type="monotone"
              dataKey="swaps"
              stroke="#f97316" // Cam chủ đạo
              strokeWidth={4}
              dot={{ r: 6, fill: "#f97316" }}
              activeDot={{ r: 8, stroke: "#f97316", strokeWidth: 2, fill: '#fff' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* =================== BOOKINGS CHƯA ĐÁNH GIÁ (Cải tiến giao diện) =================== */}
      <div className="bg-white shadow-xl rounded-xl p-8 mb-12">
        <div className="flex items-center justify-between mb-6">
          {/* Tiêu đề phần: Tăng lên 2XL theo yêu cầu */}
          <h2 className="text-2xl font-bold text-gray-800">
            Các booking chưa đánh giá
          </h2>
          {refreshingFeedbacks && (
            <span className="text-sm text-gray-400">Đang làm mới...</span>
          )}
        </div>

        {bookingsToReview.length === 0 ? (
          <div className="text-2xl text-green-600 bg-green-50 p-4 rounded-lg border border-green-200">
            ✅ Bạn đã đánh giá tất cả các booking cần thiết.
          </div>
        ) : (
          <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg">
            {bookingsToReview.map((b) => (
              <div 
                key={b.bookingId} 
                className="py-5 px-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between hover:bg-gray-50 transition duration-150"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-1">
                    {/* Tăng kích cỡ ID booking/Tên trạm */}
                    <span className="text-lg font-bold text-gray-800 truncate">{b.stationName}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(b.status)}`}>
                      {getStatusDisplay(b.status)}
                    </span>
                  </div>
                  
                  {/* Thông tin chi tiết - Dùng màu xám nhạt và bố cục gọn */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1 text-xl text-gray-600 mt-2">
                    <p className="flex items-center gap-1">
                        <span className="text-gray-400">Ngày giờ:</span> {formatDateTime(b.dateTime)}
                    </p>
                    <p className="flex items-center gap-1 truncate">
                        <span className="text-gray-400">Ghi chú:</span> {b.notes?.trim() || "-"}
                    </p>
                    <p className="flex items-center gap-1">
                        <span className="text-gray-400">Ngày tạo:</span> {formatDate(b.createdAt || b.createdDate || b.createDate || b.created || b.createdTime)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setSelectedBooking(b);
                      setShowFeedback(true);
                    }}
                    disabled={!isExpiredOrInactive(b)}
                    // Nút Phản hồi được cải tiến: màu cam nổi bật, có icon Star
                    className={`flex items-center gap-1 px-4 py-2 rounded-full text-xl font-medium transition shadow-md ${
                      isExpiredOrInactive(b)
                        ? "bg-orange-500 text-white hover:bg-orange-600"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}
                    title={
                      isExpiredOrInactive(b)
                        ? "Gửi phản hồi"
                        : "Bạn chỉ có thể đánh giá khi lịch đã hết hạn hoặc không hoạt động"
                    }
                  >
                    <Star className="w-4 h-4" /> 
                    Gửi phản hồi
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* =================== HOẠT ĐỘNG GẦN ĐÂY =================== */}
      <div className="bg-white shadow-xl rounded-xl p-8 mb-12">
        {/* Tiêu đề phần: Tăng lên 2XL theo yêu cầu */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Hoạt động gần đây (5 lần gần nhất)
        </h2>
        {validBookings.slice(0, 5).map((b) => (
          <div
            key={b.bookingId}
            className="border-b py-4 flex justify-between items-center text-2xl text-gray-700 hover:bg-gray-50 px-2 -mx-2 rounded transition"
          >
            <div className="flex flex-col">
              <p className="font-semibold text-gray-800">{b.stationName}</p>
              <p className="text-xl text-gray-500 mt-1">
                <span className="text-gray-400">Thời gian: </span>
                {formatDateTime(b.dateTime)}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(b.status)}`}
              >
                {getStatusDisplay(b.status)}
              </span>

              {/* Nút phản hồi trong hoạt động gần đây */}
              {canFeedback(b) && (
                <button
                  onClick={() => {
                    setSelectedBooking(b);
                    setShowFeedback(true);
                  }}
                  className="flex items-center gap-1 bg-orange-100 text-orange-600 px-3 py-1.5 text-xs rounded-full hover:bg-orange-200 transition"
                >
                  <Star className="w-3 h-3" />
                  Gửi phản hồi
                </button>
              )}
            </div>
          </div>
        ))}
        {validBookings.length === 0 && (
             <p className="text-gray-500 text-sm">Chưa có hoạt động đổi pin nào.</p>
        )}
      </div>

      {/* =================== NHỮNG BOOKING SẮP TỚI =================== */}
      <div className="bg-white shadow-xl rounded-xl p-8">
        {/* Tiêu đề phần: Tăng lên 2XL theo yêu cầu */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Những booking sắp tới
        </h2>
        {upcomingBookings.length === 0 ? (
          <p className="text-gray-500">Không có booking đang chờ duyệt.</p>
        ) : (
          <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg">
            {upcomingBookings.map((b) => (
              <div
                key={b.bookingId}
                className="py-4 px-4 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between hover:bg-gray-50 transition"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-800">{b.stationName}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                      Đang chờ duyệt
                    </span>
                  </div>
                  <p className="text-gray-600 mt-1">
                    <span className="text-gray-400">Thời gian: </span>
                    {formatDateTime(b.dateTime)}
                  </p>
                  {b.notes && (
                    <p className="text-gray-600 mt-1 truncate">
                      <span className="text-gray-400">Ghi chú: </span>{b.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* =================== FEEDBACK MODAL =================== */}
      {showFeedback && selectedBooking && (
        <Feedback
          booking={selectedBooking}
          accountId={user.accountId}
          onClose={() => {
            setShowFeedback(false);
            setSelectedBooking(null);
          }}
          onSuccess={() => {
            setShowFeedback(false);
            setSelectedBooking(null);
            refreshUserFeedbacks(user.accountId);
          }}
        />
      )}
    </div>
  );
};

// =================== CARD COMPONENT (Cải tiến giao diện) ===================
const DashboardCard = ({ title, value, icon }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm mb-1">{title}</p>
        {/* Giá trị thống kê: Tăng lên 4XL theo yêu cầu */}
        <h2 className="text-4xl font-extrabold text-orange-600">{value}</h2>
      </div>
      <div className={`p-4 rounded-full bg-gray-100 ${icon.props.className.includes('blue') ? 'bg-blue-50' : icon.props.className.includes('green') ? 'bg-green-50' : icon.props.className.includes('purple') ? 'bg-purple-50' : 'bg-red-50'}`}>
        {React.cloneElement(icon, { className: `${icon.props.className} w-7 h-7` })}
      </div>
    </div>
  </div>
);

export default UserDashboard;