import React from "react";
import "./ServiceCard.css";

const ServiceCard = ({ image, title, children }) => {
  return (
    <div className="service-card">
      {image && <img src={image} alt="" />}
      <h4>{title}</h4>
      {children}
    </div>
  );
};

export default ServiceCard;
