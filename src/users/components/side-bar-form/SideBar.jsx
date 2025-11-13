import authService from "@/api/authService";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import tokenUtils from "@/utils/tokenUtils";
const SideBarApp = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [active, setActive] = useState("");
  const navigate = useNavigate();
  const [islogout] = useState(true);
  const [menus] = useState([
    {
      header: "ĐẶT LỊCH ĐỔI PIN VÀ TÌM TRẠM",
      items: [
        { icon: "", label: "Đặt lịch", path: "/userPage/booking" },
        {icon: "", label: "Danh sách các dòng xe điện", path: "/userPage/profileCar"},
        { icon: "", label: "Trạm chuyển đổi pin", path: "/userPage/stations" },
      ],
    },
    {
      header: "ĐẶT HÀNG VÀ DỊCH VỤ",
      items: [
        { icon: "", label: "Các gói dịch vụ", path: "/userPage/subscriptions" },
        { icon: "", label: "Lịch sử giao dịch", path: "/userPage/swapping-history" },
      ],
    },
    {
      header: "TÀI KHOẢN",
      items: [
        { icon: "", label: "Bảng điều khiển", path: "/userPage" },
        { icon: "", label: "Thông tin cá nhân", path: "/userPage/userProfile" },
        { icon: "", label: "Yêu cầu hỗ trợ", path: "/userPage/supportRequest" },
        { icon: "", label: "Đánh giá", path: "/userPage/userfeedback" },
      ],
    },
    {
      header: null,
      items: [{ icon: "", label: "Đăng xuất", islogout }],
    },
  ]);
  useEffect(() => {
    return () => {};
  }, []);
  const handleLogout = async () => {
    //xoá token
    try {
      await authService.logout();
      tokenUtils.clearUserData();
      navigate("/login");
    } catch (err) {
      console.log("Logout error:", err);
      // Clear data even if API call fails
      tokenUtils.clearUserData();
      navigate("/login");
    }
  };
  return (
    <div className="min-h-screen bg-gray-100 p-4 font-sans">
      {/* Button mở sidebar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-6 left-6 z-50 p-4 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors text-2xl"
      >
        {isOpen ? "✕" : "☰"}
      </button>
      <div
        className={`fixed top-0 left-0 h-full w-full sm:w-[30rem] md:w-[35rem] lg:w-[40rem]
      bg-gradient-to-b from-white to-blue-50 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out
      ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-8 h-full overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-10 border-b border-gray-200 pb-4">
            <h2 className="text-4xl font-bold text-gray-800 tracking-tight">
              Menu
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-3xl text-gray-700 hover:text-blue-600 transition-colors"
            >
              ✕
            </button>
          </div>

          {menus.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-8">
              {section.header && (
                <h3 className="text-md font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">
                  {section.header}
                </h3>
              )}

              <div className="space-y-2">
                {section.items.map((item, itemIndex) =>
                  item.islogout ? (
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-4 px-5 py-4 text-left rounded-lg text-gray-700 text-lg font-medium hover:bg-blue-100 hover:text-blue-700 transition-all"
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  ) : (
                    <Link
                      key={itemIndex}
                      to={item.path}
                      onClick={() => {
                        setActive(item.path);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center gap-4 px-5 py-4 text-left rounded-lg text-gray-700 text-lg font-medium transition-all duration-150
  ${
    active === item.path
      ? "bg-blue-600 text-white shadow-md"
      : "hover:bg-blue-100 hover:text-blue-700"
  }`}
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  )
                )}
              </div>

              {/* Divider giữa các nhóm menu */}
              {sectionIndex < menus.length - 1 && (
                <hr className="mt-8 border-gray-300" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SideBarApp;
