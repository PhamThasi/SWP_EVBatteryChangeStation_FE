import React, { useEffect, useState } from "react";
import { Battery, Car, Calendar, MapPin, TrendingUp } from "lucide-react";
import bookingService from "@/api/bookingService";
import carService from "@/api/carService";
import stationService from "@/api/stationService";
import tokenUtils from "@/utils/tokenUtils";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [cars, setCars] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserDashboard = async () => {
      const userData = tokenUtils.getUserData();
      if (!userData) return;
      setUser(userData);

      try {
        const [userBookings, allCars, stationList] = await Promise.all([
          bookingService.getUserBookings(userData.accountId),
          carService.getAllCars(),
          stationService.getStationList(),
        ]);

        // lọc xe của user (nếu BE chưa có endpoint riêng)
        const myCars = allCars.filter((c) => c.accountId === userData.accountId);
        setCars(myCars);
        setBookings(userBookings);
        setStations(stationList);
      } catch (err) {
        console.error("Error loading user dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    loadUserDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin h-16 w-16 border-4 border-orange-400 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Tính toán thông tin tổng hợp
  const totalBookings = bookings.length;
  const totalCars = cars.length;
  const totalStationsVisited = new Set(bookings.map((b) => b.stationName)).size;
  const totalSpent = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  // Tạo dữ liệu biểu đồ (số lượt đổi pin theo tháng)
  const chartData = Array.from({ length: 12 }, (_, i) => ({
    month: `${i + 1}`,
    swaps: bookings.filter(
      (b) => new Date(b.dateTime).getMonth() === i
    ).length,
  }));

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-orange-600 mb-6">
        Xin chào, {user?.fullName || "User"} 👋
      </h1>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <DashboardCard title="Tổng số lần đổi pin" value={totalBookings} icon={<Battery className="text-blue-500" />} />
        <DashboardCard title="Xe đã liên kết" value={totalCars} icon={<Car className="text-green-500" />} />
        <DashboardCard title="Số trạm từng đến" value={totalStationsVisited} icon={<MapPin className="text-purple-500" />} />
        <DashboardCard title="Tổng chi tiêu (VNĐ)" value={totalSpent.toLocaleString("vi-VN")} icon={<TrendingUp className="text-orange-500" />} />
      </div>

      {/* Biểu đồ lượt đổi pin theo tháng */}
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
            <Line type="monotone" dataKey="swaps" stroke="#f97316" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Booking gần đây */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Hoạt động gần đây</h2>
        {bookings.slice(0, 5).map((b) => (
          <div key={b.bookingId} className="border-b py-3 flex justify-between text-sm text-gray-700">
            <span>{b.stationName}</span>
            <span>{new Date(b.dateTime).toLocaleDateString("vi-VN")}</span>
            <span className={`font-medium ${b.status === "Completed" ? "text-green-600" : "text-yellow-600"}`}>
              {b.status}
            </span>
          </div>
        ))}
      </div>

      {/* Thông tin lịch bảo dưỡng */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Bảo dưỡng sắp tới</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Lần gần nhất: 10/10/2025</p>
            <p className="text-sm text-gray-600">Kế tiếp: 10/12/2025</p>
          </div>
          <Calendar className="text-purple-500 w-8 h-8" />
        </div>
      </div>
    </div>
  );
};

// Reusable card component
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
