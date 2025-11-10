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
        <li>
          <Link to="/staff">Schedule</Link>
        </li>
        <li>
          <Link to="/staff/battery">Battery</Link>
        </li>
        <li>
          <Link to="/staff/feedback">FeedBack</Link>
        </li>
        <li>
          <Link to="/staff/swapping">Swapping</Link>
        </li>
        <li>
          <Link to="/staff/support">Support</Link>
        </li>
        <li>
          <Link to="#" onClick={handleLogout}>Logout</Link>
        </li>
      </ul>
    </nav>
  );
};

export default StaffNav;
