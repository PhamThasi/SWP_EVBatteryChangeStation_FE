import React from "react";
import { SocialIcon } from "react-social-icons";
import "./footer.css";
const Footer = () => {
  return <div className="footer-container">
    <div className="footer-block">
        <p>© 2025 Trạm chuyển đổi pin GenKi. Tất cả các quyền được bảo lưu.</p>
        <div className="footer-item-icon">
            <SocialIcon url="https://www.facebook.com/"></SocialIcon>
            <SocialIcon url="https://www.youtube.com/"></SocialIcon>
            <SocialIcon url="https://www.instagram.com/"></SocialIcon>
        </div>
    </div>
  </div>;
};

export default Footer;
