import { useEffect } from "react";
import "./App.css";
import Button from "./components/button";
import AuthLayout from "./components/AuthLayout/AuthLayout";
import SignIn from "./auth/components/signIn/signIn";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import SignUp from "./auth/components/signUp/signUp";
import NavBar from "./home/components/NavBar";
import HomeFrame from "./home/components/HomeFrame";
import AdminLayout from "./home/components/AdminLayout";
import AdminDash from "./home/page/AdminDash";
import HomePage from "./home/page/HomePage";
import ServiceCard from "./home/components/ServiceCard";
import SideBarApp from "./users/components/side-bar-form/SideBar";
import ProfileCar from "./users/components/profile-car/profileCar";
import { User } from "lucide-react";
import UserLayout from "./users/Layout/UserLayout";
import ModalForm from "./components/modalForm/ModalForm";
import UserProfile from "./users/components/user-profile/UserProfile";
import SupportRequest from "./users/components/support-request/SupportRequest";
import UserDashboard from "./users/components/user-dashboard/UserDashboard";
// import authService from "./api/authService";
import AccountManagement from "./home/page/AccountManagement";
import TokenDebugger from "./components/debug/TokenDebugger";
import LoginDebugger from "./components/debug/LoginDebugger";
import OTPConfirmation from "./auth/components/otp/OTPConfirmation";
import MainLayout from "./home/layout/MainLayout";
import AboutUs from "./home/page/AboutUs";

import Subscriptions from "./home/page/Subscriptions";
import Stations from "./home/page/Stations";

import StaffSchedule from "./home/page/StaffSchedule";
import RoleManagement from "./home/page/RoleManagement";
import StationManagement from "./home/page/StationMangement";
import AdminSubManage from "./home/page/AdminSubManage";
import ContactUs from "./home/page/ContactUs";
import BatteryManagement from "./home/page/BatteryManagement";
import BookingForm from "./users/components/booking-form/BookingForm";
import BookingPage from "./users/components/booking-page/BookingPage";

// debug
// import tramsac_evt from "./assets/tramsac_evt.jpg"
function App() {
  useEffect(() => {
    // Test API call can be uncommented when needed
    // const testAPI = async () => {
    //   try {
    //     const data = await authService.register("hienngunguoi1234@gmail.com", "123456");
    //     console.log(data);
    //   } catch (error) {
    //     console.log(error);
    //   }
    // };
    // testAPI();
  }, []);
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
      path: "/verifyOtp",
      element: (
        <AuthLayout>
          <OTPConfirmation />
        </AuthLayout>
      ),
    },
    {
      path: "/",
      element: <MainLayout />,
      children: [
        { index: true, element: <HomePage /> },
        { path: "about", element: <AboutUs /> },
        { path: "subscriptions", element: <Subscriptions /> },
        { path: "stations", element: <Stations /> },
        { path: "contact", element: <ContactUs /> },
      ],
    },
    {
      path: "/userPage",
      element: <UserLayout />,
      children: [
        { index: true, element: <UserDashboard /> },
        { path: "booking", element: <BookingPage /> },
        { path: "profileCar", element: <ProfileCar /> },
        { path: "userProfile", element: <UserProfile /> },
        { path: "supportRequest", element: <SupportRequest /> },
        { path: "contact", element: <ContactUs /> },
        { path: "stations", element: <Stations /> },
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
    {
      path: "/debugToken",
      element: <TokenDebugger />,
    },
    {
      path: "/debugLogin",
      element: <LoginDebugger />,
    },
    {
      path: "/admin",
      element: <AdminLayout />,
      children: [
        {path: "schedule", element: <StaffSchedule/>},
        { path: "battery", element: <BatteryManagement/> },
        { path: "accounts", element: <AccountManagement /> },
        { path: "roles", element: <RoleManagement /> },
        { path: "stations", element: <StationManagement /> },
        { path: "subscriptions", element: <AdminSubManage /> },
      ],
    },
    // {
    //   path: "/staff",
    //   element: <StaffLayout />,
    //   children: [
    //     { path: "", element: <AdminDash /> },
    //     { path: "schedule", element: <StaffSchedule /> },
    //   ],
    // },
  ]);
  return (
    <div>
      <RouterProvider router={route}></RouterProvider>
    </div>
  );
}

export default App;
