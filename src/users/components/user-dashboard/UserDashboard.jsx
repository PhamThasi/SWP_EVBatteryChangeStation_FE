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

        const myCars = allCars.filter(
          (c) => c.accountId === userData.accountId
        );
        const myFeedbacks = Array.isArray(allFeedbacks)
          ? allFeedbacks.filter((f) => f.accountId === userData.accountId)
          : [];

        setCars(myCars);
        setBookings(Array.isArray(userBookings) ? userBookings : []);
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

  // =================== CHECK CONDITION ===================
  const canFeedback = (booking) => {
    if (!booking.dateTime) return false;

    const now = new Date();
    const bookingDate = new Date(booking.dateTime);
    const diffHours = (now - bookingDate) / (1000 * 60 * 60);
    const over1Hour = diffHours >= 1;

    const isInactive =
      booking.status !== "Hoạt động" && booking.status !== true;

    const hasFeedback = feedbacks.some(
      (f) => f.bookingId === booking.bookingId
    );

    return (over1Hour || isInactive) && !hasFeedback;
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
