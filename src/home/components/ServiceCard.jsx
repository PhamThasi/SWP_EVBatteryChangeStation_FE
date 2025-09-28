import React from "react";
import "./ServiceCard.css";

const ServiceCard = ({ title, content }) => {
  return (
    <div className="service-card">
      <h4>{title}</h4>
      <p>{content}</p>
    </div>
  );
};

export default ServiceCard;
