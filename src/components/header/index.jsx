import React from "react";
import './style.css';

const Navbar = () =>{
  return(
    <div className="header">
      <a className="logo" href="#">Logo</a>

      <nav className="navbar">
        <a href="#">Trang chủ</a>
        <a href="#">Thông tin Pin xe</a>
        <a href="#">Hỏi và đáp</a>
        <a href="#">Điều khoản và dịch vụ</a>
        <a href="#">Gói Pin</a>
      </nav>
    </div>
  );
}
export default Navbar;