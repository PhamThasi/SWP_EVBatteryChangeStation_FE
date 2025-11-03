import React, { useEffect, useState } from "react";
import { Battery, Car, Calendar, MapPin, TrendingUp } from "lucide-react";
import bookingService from "@/api/bookingService";
import carService from "@/api/carService";
import stationService from "@/api/stationService";
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
  const [cars, setCars] = useState([]);
  const [stations, setStations] = useState([]);
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
        const [userBookings, allCars, stationList, allFeedbacks] =
          await Promise.all([
            bookingService.getUserBookings(userData.accountId),
            carService.getAllCars(),
            stationService.getStationList(),
            feedbackService.getAllFeedbacks(),
          ]);

        // Unwrap common API shapes
        const userBookingsArr = Array.isArray(userBookings)
          ? userBookings
          : userBookings?.data || userBookings?.Data || [];
        const allFeedbacksArr = Array.isArray(allFeedbacks)
          ? allFeedbacks
          : allFeedbacks?.data?.data || allFeedbacks?.data || [];

        const myCars = allCars.filter(
          (c) => c.accountId === userData.accountId
        );
        const myFeedbacks = Array.isArray(allFeedbacksArr)
          ? allFeedbacksArr.filter((f) => f.accountId === userData.accountId)
          : [];

        setCars(myCars);
        setBookings(Array.isArray(userBookingsArr) ? userBookingsArr : []);
        setStations(stationList);
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
  const totalCars = cars.length;
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

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-orange-600 mb-6">
        Xin chào, {user?.fullName || "User"} 👋
      </h1>

      {/* =================== THỐNG KÊ CARD =================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <DashboardCard
          title="Tổng số lần đổi pin"
          value={totalBookings}
          icon={<Battery className="text-blue-500" />}
        />
        <DashboardCard
          title="Xe đã liên kết"
          value={totalCars}
          icon={<Car className="text-green-500" />}
        />
        <DashboardCard
          title="Số trạm từng đến"
          value={totalStationsVisited}
          icon={<MapPin className="text-purple-500" />}
        />
        <DashboardCard
          title="Tổng chi tiêu (VNĐ)"
          value={totalSpent.toLocaleString("vi-VN")}
          icon={<TrendingUp className="text-orange-500" />}
        />
      </div>

      {/* =================== BIỂU ĐỒ =================== */}
      <div className="bg-white shadow rounded-lg p-6 mb-10">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Biểu đồ số lượt đổi pin trong năm
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="swaps"
              stroke="#f97316"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* =================== HOẠT ĐỘNG GẦN ĐÂY =================== */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Hoạt động gần đây
        </h2>
        {validBookings.slice(0, 5).map((b) => (
          <div
            key={b.bookingId}
            className="border-b py-3 flex justify-between items-center text-sm text-gray-700"
          >
            <div>
              <p className="font-medium">{b.stationName}</p>
              <p className="text-xs text-gray-500">
                {new Date(b.dateTime).toLocaleDateString("vi-VN")}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`font-medium ${
                  b.status === "Completed"
                    ? "text-green-600"
                    : "text-yellow-600"
                }`}
              >
                {b.status}
              </span>

              {canFeedback(b) && (
                <button
                  onClick={() => {
                    setSelectedBooking(b);
                    setShowFeedback(true);
                  }}
                  className="bg-orange-100 text-orange-600 px-3 py-1 text-xs rounded-full hover:bg-orange-200 transition"
                >
                  Gửi phản hồi
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* =================== BOOKINGS CHƯA ĐÁNH GIÁ =================== */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Các booking chưa đánh giá
          </h2>
          {refreshingFeedbacks && (
            <span className="text-xs text-gray-400">Đang làm mới...</span>
          )}
        </div>
        {validBookings.filter((b) => isExpiredOrInactive(b) && !feedbacks.some((f) => f.bookingId === b.bookingId)).length === 0 ? (
          <div className="text-sm text-gray-500">Bạn đã đánh giá tất cả các booking.</div>
        ) : (
          <div className="divide-y">
            {validBookings
              .filter((b) => isExpiredOrInactive(b) && !feedbacks.some((f) => f.bookingId === b.bookingId))
              .map((b) => (
                <div key={b.bookingId} className="py-3 flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="font-medium text-gray-800 truncate">{b.stationName}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(b.dateTime).toLocaleString("vi-VN")} · Trạng thái: {b.status}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedBooking(b);
                      setShowFeedback(true);
                    }}
                    disabled={!isExpiredOrInactive(b)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                      isExpiredOrInactive(b)
                        ? "bg-orange-100 text-orange-600 hover:bg-orange-200"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                    title={
                      isExpiredOrInactive(b)
                        ? "Gửi phản hồi"
                        : "Bạn chỉ có thể đánh giá khi lịch đã hết hạn hoặc không hoạt động"
                    }
                  >
                    Gửi phản hồi
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* =================== LỊCH BẢO DƯỠNG =================== */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          Bảo dưỡng sắp tới
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Lần gần nhất: 10/10/2025</p>
            <p className="text-sm text-gray-600">Kế tiếp: 10/12/2025</p>
          </div>
          <Calendar className="text-purple-500 w-8 h-8" />
        </div>
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

// =================== CARD COMPONENT ===================
const DashboardCard = ({ title, value, icon }) => (
  <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <h2 className="text-2xl font-bold text-gray-800">{value}</h2>
      </div>
      <div className="p-3 bg-gray-100 rounded-full">{icon}</div>
    </div>
  </div>
);

export default UserDashboard;
