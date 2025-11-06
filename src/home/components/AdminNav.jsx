import React, { useState } from "react";
import "./AdminNav.css";
import { Link, useNavigate } from "react-router-dom";
import authService from "@/api/authService";
import tokenUtils from "@/utils/tokenUtils";

const AdminNav = () => {
  const [isSidebar] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.logout();
      tokenUtils.clearUserData();
      navigate("/login");
    } catch (err) {
      console.log("Logout error:", err);
      tokenUtils.clearUserData();
      navigate("/login");
    }
  };
  

  return (
    <nav className={`admin-nav ${isSidebar ? "sidebar" : "topbar"}`}>
      

      <ul className="navbar-links">
        <li><Link to="/admin">Schedule</Link></li>
        <li><Link to="/admin/battery">Battery</Link></li>
        <li><Link to="/admin/accounts">Accounts</Link></li>
        <li><Link to="/admin/roles">Roles</Link></li>
        <li><Link to="/admin/stations">Stations</Link></li>
        <li><Link to="/admin/subscriptions">Subscriptions</Link></li>
        <li><Link to="#" onClick={handleLogout} >Logout</Link></li>
      </ul>
    </nav>
  );
};

export default AdminNav;
