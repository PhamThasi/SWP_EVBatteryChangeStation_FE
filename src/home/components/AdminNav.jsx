import React, { useEffect, useState } from "react";
import "./AdminNav.css";
import { Link } from "react-router-dom";

const AdminNav = () => {
  const [isSidebar, setIsSidebar] = useState(false);

  

  return (
    <nav className={`admin-nav ${isSidebar ? "sidebar" : "topbar"}`}>
      

      <ul className="navbar-links">
        <li><Link to="/admin/schedule">Schedule</Link></li>
        <li><Link to="/admin/battery">Battery</Link></li>
        <li><Link to="/admin/accounts">Accounts</Link></li>
        <li><Link to="/admin/roles">Roles</Link></li>
        <li><Link to="/admin/stations">Stations</Link></li>
        <li><Link to="/admin/subscriptions">Subscriptions</Link></li>
      </ul>
    </nav>
  );
};

export default AdminNav;
