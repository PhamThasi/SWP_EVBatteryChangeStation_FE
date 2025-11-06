import React, { useEffect, useState } from "react";
import "./AdminNav.css";
import { Link, useNavigate } from "react-router-dom";

const StaffNav = () => {
  const navigate = useNavigate();
  
    const [isSidebar, setIsSidebar] = useState(false);

  

  return (
    <nav className={`admin-nav ${isSidebar ? "sidebar" : "topbar"} `}>
      

      <ul className="navbar-links">
        <li><Link to="/staff">Schedule</Link></li>
        <li><Link to="/staff/battery">Battery</Link></li>
        <li><Link to="/staff/feedback">FeedBack</Link></li>
        <li><Link to="/staff/swapping">Swapping</Link></li>
      </ul>
    </nav>
  );
};

export default StaffNav;
