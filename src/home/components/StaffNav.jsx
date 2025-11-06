import React, { useState } from "react";
import "./AdminNav.css";
import { Link } from "react-router-dom";

const StaffNav = () => {
  const [isSidebar] = useState(false);

  return (
    <nav className={`admin-nav ${isSidebar ? "sidebar" : "topbar"} `}>
      <ul className="navbar-links">
        <li>
          <Link to="/staff">Schedule</Link>
        </li>
        <li>
          <Link to="/staff/battery">Battery</Link>
        </li>
        <li>
          <Link to="/staff/feedback">FeedBack</Link>
        </li>
        <li>
          <Link to="/staff/swapping">Swapping</Link>
        </li>
        <li>
          <Link to="/staff/support">Support</Link>
        </li>
      </ul>
    </nav>
  );
};

export default StaffNav;
