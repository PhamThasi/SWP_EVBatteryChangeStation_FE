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
import UserFeedback from "./home/page/UserFeedback";
import BatteryManagement from "./home/page/BatteryManagement";
import StaffBatteryManagement from "./home/page/StaffBatteryManagement";
import AdminCarManagement from "./home/page/AdminCarManagement";
import BookingForm from "./users/components/booking-form/BookingForm";
import BookingPage from "./users/components/booking-page/BookingPage";
import StaffLayout from "./home/components/StaffLayout";
import SwappingHistory from "./users/components/history-swaping/swapping";
import Feedback from "./home/page/FeedBack";
import SwappingManagement from "./home/page/SwappingTransaction";
import ForgotPassword from "./auth/components/otp/ForgotPassword";
import StaffSupportPage from "./home/page/StaffSupportPage";
import SuccessPage from "./home/page/Payment-success";
import Payment from "./home/page/Payment";
import ToastContainer from "./components/notification/ToastContainer";
import FailedPage from "./home/page/Pyament-failed";
import RevenueReport from "./home/page/Report";

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
          <SignIn />
        </AuthLayout>
      ),
    },
    {
      path: "/forgot-password",
      element: (
        <AuthLayout>
          <ForgotPassword />
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
        { path: "feedback", element: <Feedback/> },
      ],
    },
    {
      path: "/userPage",
      element: <UserLayout />,
      children: [
        { index: true, element: <UserDashboard /> },
        { path: "booking", element: <BookingPage /> },
        { path: "subscriptions", element: <Subscriptions /> },
        { path: "profileCar", element: <ProfileCar /> },
        { path: "userProfile", element: <UserProfile /> },
        { path: "supportRequest", element: <SupportRequest /> },
        { path: "userfeedback", element: <UserFeedback /> },
        { path: "stations", element: <Stations /> },
        { path: "payment", element: <Payment /> },
        { path: "swapping-history", element: <SwappingHistory /> },
        // sau này thêm: maintenance, support...
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
        {path: "", element: <RevenueReport/>},
        { path: "accounts", element: <AccountManagement /> },
        { path: "roles", element: <RoleManagement /> },
        { path: "stations", element: <StationManagement /> },
        { path: "subscriptions", element: <AdminSubManage /> },
        { path: "cars", element: <AdminCarManagement /> },
        { path: "battery", element: <BatteryManagement /> },
      ],
    },
    {
      path: "/staff",
      element: <StaffLayout />,
      children: [
        { path: "/staff", element: <StaffSchedule/> },
        { path: "accounts", element: <AccountManagement /> },
        { path: "battery", element: <StaffBatteryManagement/> },
        { path: "Swapping", element: <SwappingManagement/> },
        { path: "feedback", element: <Feedback/> },        
        { path: "support", element: <StaffSupportPage/> },
      ],
    },
    {
      path: "/payment-success",
      element: (
        <SuccessPage/>
      ),
    },
    {
      path: "/payment-failed",
      element: (
        <FailedPage/>
      ),
    },
  ]);
  return (
    <div>
      <RouterProvider router={route}></RouterProvider>
      <ToastContainer />
    </div>
  );
}

export default App;
