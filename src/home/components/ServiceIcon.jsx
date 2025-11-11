// src/pages/Home/ServiceIcon.jsx
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const ServiceIcon = ({ icon, title, desc, faIcon }) => {
  return (
    <div className="service-icon-card">
      <div className="icon-wrapper">
        <img src={icon} alt={title} />
        <FontAwesomeIcon icon={faIcon} className="fa-overlay" />
      </div>
      <h5>{title}</h5>
      <p className="tooltip">{desc}</p>
    </div>
  );
};

export default ServiceIcon;