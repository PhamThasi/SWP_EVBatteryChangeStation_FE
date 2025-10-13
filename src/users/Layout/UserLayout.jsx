import React from "react";
import SideBarApp from "../components/side-bar-form/SideBar";
import { Outlet } from "react-router-dom";
import ProfileCar from "../components/profile-car/profileCar";
import UserProfile from "../components/user-profile/UserProfile";

const UserLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar cố định bên trái */}
      <div className="w-[10rem] bg-gradient-to-b from-white to-blue-50 shadow-xl">
        <SideBarApp />
      </div>

      {/* Content động ở bên phải */}
      <div className="flex-1 bg-white pl-12 overflow-auto">
        {/* <ProfileCar/>
        <UserProfile/> */}
        <Outlet />  
      </div>
    </div>
  );
};

export default UserLayout;
