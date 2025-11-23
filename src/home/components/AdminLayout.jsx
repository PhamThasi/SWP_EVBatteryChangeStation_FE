import React from "react";
import { Outlet } from "react-router-dom";
import AdminNav from "./AdminNav";

const AdminLayout = () => {
  return (
    <div className="admin-layout">
      <AdminNav />
      <div className="admin-content">
        <h1>Xin chào Admin</h1>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
