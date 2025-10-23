import React from "react";
import { Outlet } from "react-router-dom";

const BaseLayout = ({ NavComponent }) => {
  return (
    <div className="layout">
      {NavComponent && <NavComponent />}
      <div className="layout-content">
        <Outlet />
      </div>
    </div>
  );
};

export default BaseLayout;
