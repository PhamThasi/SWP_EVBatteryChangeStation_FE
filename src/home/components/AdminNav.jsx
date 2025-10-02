import React from "react";
import "./NavBar.css";

const AdminNav = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">EV Swap</div>
      <ul className="navbar-links">
        <li><a href="#">Trang chủ</a></li>
        <li><a href="#">Thong ke</a></li>
        <li><a href="#">Kho hang</a></li>
        <li><a href="#">Danh sach khach hang</a></li>
        <li><a href="#">Lich hen</a></li>
      </ul>
    </nav>
  );
};

export default AdminNav;
