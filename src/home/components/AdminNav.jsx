import React from "react";
import "./NavBar.css";
import { Link, useNavigate } from "react-router-dom";

const AdminNav = () => {
  const navigate = useNavigate();
  return (
    <nav className="navbar">
      <div className="navbar-logo" onClick={() => navigate("/adminpage")}>EV Swap</div>
      <ul className="navbar-links">
        <li><Link to="/admin/dashboard">Dashboard</Link></li>
        <li><Link to="/admin/accounts">Account Management</Link></li>
        <li><a href="#">Kho hang</a></li>
        <li><a href="#">Danh sach khach hang</a></li>
        <li><a href="#">Lich hen</a></li>
      </ul>
    </nav>
  );
};

export default AdminNav;
