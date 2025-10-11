import { useState } from "react";
import "./App.css";
import Button from "./components/button";
import AuthLayout from "./components/AuthLayout/AuthLayout";
import SignIn from "./auth/components/signIn/signIn";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import SignUp from "./auth/components/signUp/signUp";
import NavBar from "./home/components/NavBar";
import HomeFrame from "./home/components/HomeFrame";

import HomePage from "./home/page/HomePage";
import ServiceCard from "./home/components/ServiceCard";
import SideBarApp from "./users/components/side-bar-form/SideBar";
import ProfileCar from "./users/components/profile-car/profileCar";
import { User } from "lucide-react";
import UserLayout from "./users/Layout/UserLayout";
import ModalForm from "./components/modalForm/ModalForm";
// debug
// import tramsac_evt from "./assets/tramsac_evt.jpg"
function App() {
  const route = createBrowserRouter([
    {
      path: "/login",
      element: (
        <AuthLayout>
          {/* <SignUp/> */}
          <SignIn />
          {/* <SignUp/> */}
        </AuthLayout>
      ),
    },
    {
      path: "/signup",
      element: (
        <AuthLayout>
          <SignUp />
        </AuthLayout>
      ),
    },
    {
      path: "/",
      element: (
        <div>
          <HomePage />
        </div>
      ),
    },
    {
      path: "/userPage",
      element: (
        <div>
          <SideBarApp />
        </div>
      ),
    },
    {
      path: "/profileCar",
      element: <UserLayout />,
      children: [
        { path: "profileCar", element: <ProfileCar /> },
        // sau này thêm: history, maintenance, support...
      ],
    },
    {
      path: "/profileCar",
      element: <UserLayout />,
      children: [
        { path: "profileCar", element: <ProfileCar /> },
        // sau này thêm: history, maintenance, support...
      ],
    },
    {
      path: "/debugComponent",
      element: (
        <div>
          <ModalForm />
        </div>
      ),
    },
  ]);
  return (
    <div>
      <RouterProvider router={route}></RouterProvider>
    </div>
  );
}

export default App;
