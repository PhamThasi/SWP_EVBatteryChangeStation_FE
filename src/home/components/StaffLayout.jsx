import React from "react";
import { Outlet } from "react-router-dom";
import StaffNav from "./StaffNav";

const StaffLayout = () => {
  return (
    <div className="admin-layout">

      <StaffNav />
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
};

export default StaffLayout;
