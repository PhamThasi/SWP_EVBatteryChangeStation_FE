import React from "react";
import "./NavBar.css";
import logo from "./../../assets/logo.png";
const NavBar = () => {
  return (
    <nav className="navbar">
      <ul className="navbar-links">
        <li>
          <a href="#">Trang chủ</a>
        </li>
        <li>
          <a href="#">Giới thiệu</a>
        </li>
        <li>
          <a href="#">Gói dịch vụ</a>
        </li>
        <li>
          <a href="#">Trạm gần nhất</a>
        </li>
        <li>
          <a href="#">Liên hệ</a>
        </li>
      </ul>
      <div className="navbar-logo">
        <img src={logo} alt="" />
      </div>
    </nav>
  );
};

export default NavBar;
