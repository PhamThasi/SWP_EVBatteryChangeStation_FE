import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Car, 
  History, 
  Settings, 
  Battery, 
  MessageCircle, 
  User, 
  Calendar,
  MapPin,
  TrendingUp,
  Shield
} from "lucide-react";
import tokenUtils from "@/utils/tokenUtils";

const UserDashboard = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Get user data from localStorage (decoded from token)
    const userDataFromStorage = tokenUtils.getUserData();
    if (userDataFromStorage) {
      setUserData(userDataFromStorage);
      console.log("User data loaded:", userDataFromStorage);
    }
  }, []);

  // Mock data - replace with actual data from API
  const userStats = {
    totalSwaps: 24,
    totalSavings: 1250000,
    batteryHealth: 95,
    nextService: "2024-02-15"
  };

  const recentActivities = [
    { id: 1, type: "swap", location: "Trạm VinFast Cầu Giấy", time: "2 giờ trước", status: "completed" },
    { id: 2, type: "maintenance", location: "Trung tâm bảo dưỡng", time: "1 ngày trước", status: "scheduled" },
    { id: 3, type: "rental", location: "Thuê pin dài hạn", time: "3 ngày trước", status: "active" }
  ];

  const quickActions = [
    {
      title: "Đổi Pin",
      description: "Tìm trạm đổi pin gần nhất",
      icon: <Battery className="w-8 h-8" />,
      path: "/stations",
      color: "bg-blue-500"
    },
    {
      title: "Bảo Dưỡng",
      description: "Đặt lịch bảo dưỡng xe",
      icon: <Settings className="w-8 h-8" />,
      path: "/maintenance",
      color: "bg-green-500"
    },
    {
      title: "Thuê Pin",
      description: "Đăng ký thuê pin",
      icon: <Shield className="w-8 h-8" />,
      path: "/battery-rental",
      color: "bg-purple-500"
    },
    {
      title: "Hỗ Trợ",
      description: "Liên hệ hỗ trợ khách hàng",
      icon: <MessageCircle className="w-8 h-8" />,
      path: "/userPage/supportRequest",
      color: "bg-orange-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Chào mừng trở lại{userData?.fullName ? `, ${userData.fullName}` : ''}!
        </h1>
        <p className="text-gray-600">
          Quản lý xe điện và dịch vụ của bạn một cách dễ dàng
        </p>
        {userData && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Tài khoản:</strong> {userData.accountName || userData.email}
            </p>
            <p className="text-sm text-blue-800">
              <strong>Email:</strong> {userData.email}
            </p>
            {userData.roleId && (
              <p className="text-sm text-blue-800">
                <strong>Vai trò:</strong> {userData.roleId === "ae25395f-c7ec-42ab-92e3-f63bf97c38b2" ? "Staff" : "User"}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng số lần đổi pin</p>
              <p className="text-2xl font-bold text-gray-900">{userStats.totalSwaps}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Battery className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tiết kiệm được</p>
              <p className="text-2xl font-bold text-gray-900">
                {userStats.totalSavings.toLocaleString('vi-VN')}đ
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tình trạng pin</p>
              <p className="text-2xl font-bold text-gray-900">{userStats.batteryHealth}%</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Car className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Bảo dưỡng tiếp theo</p>
              <p className="text-lg font-bold text-gray-900">
                {new Date(userStats.nextService).toLocaleDateString('vi-VN')}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Thao tác nhanh</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.path}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 group"
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-full ${action.color} text-white group-hover:scale-110 transition-transform duration-200`}>
                  {action.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{action.title}</h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Hoạt động gần đây</h2>
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-100 rounded-full">
                  {activity.type === "swap" && <Battery className="w-5 h-5 text-blue-600" />}
                  {activity.type === "maintenance" && <Settings className="w-5 h-5 text-green-600" />}
                  {activity.type === "rental" && <Shield className="w-5 h-5 text-purple-600" />}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{activity.location}</p>
                  <p className="text-sm text-gray-600">{activity.time}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                activity.status === "completed" 
                  ? "bg-green-100 text-green-800" 
                  : activity.status === "scheduled"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-blue-100 text-blue-800"
              }`}>
                {activity.status === "completed" ? "Hoàn thành" : 
                 activity.status === "scheduled" ? "Đã lên lịch" : "Đang hoạt động"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Links */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/userPage/profileCar"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 group"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gray-100 rounded-full group-hover:bg-blue-100 transition-colors duration-200">
              <Car className="w-6 h-6 text-gray-600 group-hover:text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Thông tin xe</h3>
              <p className="text-sm text-gray-600">Xem chi tiết xe của bạn</p>
            </div>
          </div>
        </Link>

        <Link
          to="/userPage/userProfile"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 group"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gray-100 rounded-full group-hover:bg-green-100 transition-colors duration-200">
              <User className="w-6 h-6 text-gray-600 group-hover:text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Thông tin cá nhân</h3>
              <p className="text-sm text-gray-600">Cập nhật thông tin tài khoản</p>
            </div>
          </div>
        </Link>

        <Link
          to="/history"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 group"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gray-100 rounded-full group-hover:bg-purple-100 transition-colors duration-200">
              <History className="w-6 h-6 text-gray-600 group-hover:text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Lịch sử giao dịch</h3>
              <p className="text-sm text-gray-600">Xem lịch sử đổi pin và dịch vụ</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default UserDashboard;
