import React, { useState } from "react";
import "./AdminNav.css";
import { Link, useNavigate } from "react-router-dom";
import authService from "@/api/authService";
import tokenUtils from "@/utils/tokenUtils";

const StaffNav = () => {
  const [isSidebar] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async (e) => {
    e.preventDefault(); // Prevent default link behavior
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
    <nav className={`admin-nav ${isSidebar ? "sidebar" : "topbar"} `}>
      <ul className="navbar-links">
        <h1 style={{ fontSize: "20px", fontWeight: "bold" }}>Xin chào staff</h1>
        <li>
          <Link to="/staff">Lịch đổi pin</Link>
        </li>
        <li>
          <Link to="/staff/battery">Quản lý pin</Link>
        </li>
        <li>
          <Link to="/staff/feedback">Phản hồi</Link>
        </li>
        <li>
          <Link to="/staff/swapping">Giao dịch đổi pin</Link>
        </li>
        <li>
          <Link to="/staff/support">Hỗ trợ</Link>
        </li>
        <li>
          <Link to="#" onClick={handleLogout}>
            Đăng xuất
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default StaffNav;
