import React from "react";
import "./NavBar.css";

const NavBar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">EV Swap</div>
      <ul className="navbar-links">
        <li><a href="#">Trang chủ</a></li>
        <li><a href="#">Giới thiệu</a></li>
        <li><a href="#">Gói dịch vụ</a></li>
        <li><a href="#">Trạm gần nhất</a></li>
        <li><a href="#">Liên hệ</a></li>
      </ul>
    </nav>
  );
};

export default NavBar;
