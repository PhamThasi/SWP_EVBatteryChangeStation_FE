import React, { useEffect, useState } from "react";
import "./NavBar.css";
import logo from "./../../assets/logo.png";

import { Link } from "react-router-dom";

const NavBar = () => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 700);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      {/* Links bên trái */}
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
      {/* Logo*/}
      <div className="navbar-logo">
        <img src={logo} alt="Logo" />
      </div>

      {/*  đăng nhập  */}
      <div className="navbar-account">
        {/* <a href="/SignIn" className="login-btn">Đăng nhập</a> */}
        <Link to="/login">Đăng nhập</Link>
      </div>
    </nav>
  );
};

export default NavBar;
