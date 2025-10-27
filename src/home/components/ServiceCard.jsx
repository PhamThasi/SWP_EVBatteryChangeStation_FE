// src/home/components/ServiceCard.jsx
import React from "react";
import "./ServiceCard.css";
import { useLocation } from "react-router-dom";

/**
 * Props:
 * - image, title, children: nội dung
 * - onAction?: function - hành động khi click
 * - enableAction?: boolean - ép bật/tắt click (nếu không truyền, tự guard theo route)
 *
 * Hành vi:
 * - Ở "/" (Home/HomePage) => mặc định KHÔNG click
 * - Ở trang khác (vd: /subscriptions) => mặc định CHO phép click
 * - Overlay “Mua ngay” chỉ xuất hiện khi có thể click (hover) & KHÔNG lộ thiên
 */
const ServiceCard = ({ image, title, children, onAction, enableAction }) => {
  const { pathname } = useLocation();
  const canClickByRoute = pathname !== "/"; // tắt ở Home
  const canClick = typeof enableAction === "boolean" ? enableAction : canClickByRoute;

  const handleClick = () => {
    if (canClick && typeof onAction === "function") onAction();
  };

  return (
    <div
      className={`service-card ${canClick ? "is-clickable" : ""}`}
      onClick={handleClick}
    >
      {image && <img src={image} alt="" />}
      <h4>{title}</h4>
      {children}

      {/* Overlay hint “Mua ngay” (ẩn, chỉ hiện khi hover, và chỉ khi canClick) */}
      {canClick && (
        <>
          <div className="sc-overlay-scrim" />
          <div className="sc-overlay-buy">Mua ngay</div>
        </>
      )}
    </div>
  );
};

export default ServiceCard;
