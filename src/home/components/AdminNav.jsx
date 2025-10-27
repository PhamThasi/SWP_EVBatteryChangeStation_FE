import React, { useEffect, useState } from "react";
import "./AdminNav.css";
import { Link, useNavigate } from "react-router-dom";

const AdminNav = () => {
  const navigate = useNavigate();
  const [isSidebar, setIsSidebar] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // switch to sidebar after scrolling 100px
      setIsSidebar(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`admin-nav ${isSidebar ? "sidebar" : "topbar"}`}>
      <div
        className="navbar-logo"
        onClick={() => navigate("/admim")}
      >
        EV Swap
      </div>

      <ul className="navbar-links">
        <li><Link to="/admin">Dashboard</Link></li>
        <li><Link to="/admin/accounts">Accounts</Link></li>
        <li><Link to="/admin/roles">Roles</Link></li>
        <li><Link to="/admin/stations">Stations</Link></li>
        <li><Link to="/admin/subscriptions">Subscriptions</Link></li>
      </ul>
    </nav>
  );
};

export default AdminNav;
