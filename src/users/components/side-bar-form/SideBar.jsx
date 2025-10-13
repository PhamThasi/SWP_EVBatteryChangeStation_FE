import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
const SideBarApp = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [active, setActive] = useState("");
  const [menus, setMenus] = useState([
    {
      header: "THÔNG TIN XE",
      items: [{ icon: "", label: "Xe của tôi", path: "/userPage/profileCar" }],
    },
    {
      header: "ĐẶT HÀNG VÀ DỊCH VỤ",
      items: [
        { icon: "", label: "Lịch sử giao dịch", path: "/history" },
        { icon: "", label: "Bảo dưỡng - Sửa chữa", path: "/maintenance" },
        { icon: "", label: "Thuê Pin", path: "/battery-rental" },
        { icon: "", label: "Lịch sử Sạc Pin", path: "/charging-history" },
      ],
    },
    {
      header: "TÀI KHOẢN",
      items: [
        { icon: "", label: "Thông tin cá nhân", path: "/userPage/userProfile" },
        { icon: "", label: "Yêu cầu hỗ trợ", path: "/support" },
        { icon: "", label: "Liên hệ", path: "/contact" },
      ],
    },
    {
      header: null,
      items: [{ icon: "", label: "Đăng xuất", path: "/logout" }],
    },
  ]);
  useEffect(()=>{
    return()=>{
      
    }
  },[])

  return (
    <div className="min-h-screen bg-gray-100 p-4 font-sans">
      {/* Button mở sidebar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-6 left-6 z-50 p-4 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors text-2xl"
      >
        {isOpen ? "✕" : "☰"}
      </button>

      {/* Overlay (nền tối sau khi mở menu) */}
      {/* {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40"
          onClick={() => setIsOpen(false)}
        />
      )} */}

      {/* Sidebar chính */}
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

          {/* Danh sách các section */}
          {menus.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-8">
              {section.header && (
                <h3 className="text-md font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">
                  {section.header}
                </h3>
              )}

              <div className="space-y-2">
                {section.items.map((item, itemIndex) => (
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
                ))}
              </div>

              {/* Divider giữa các nhóm menu */}
              {sectionIndex < menus.length - 1 && (
                <hr className="mt-8 border-gray-300" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Nội dung chính (demo) */}
      {/* <div className="ml-16 mt-16">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Ứng dụng của tôi
        </h1>
        <p className="text-gray-600">
          Nhấn vào nút menu ở góc trên bên trái để mở sidebar to hơn.
        </p>
      </div> */}
    </div>
  );
};

export default SideBarApp;
