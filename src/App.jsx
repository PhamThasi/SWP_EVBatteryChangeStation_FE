import { useState } from "react";
import Dashboard from "./components/dashboard";
import "./App.css";
import Headers from "./components/header";
import Button from "./components/button";
import AuthLayout from "./components/AuthLayout/AuthLayout";
import SignIn from "./auth/components/signIn/signIn";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import SignUp from "./auth/components/signUp/signUp";
import NavBar from "./home/components/NavBar";
import HomeFrame from "./home/components/HomeFrame";

function App() {
  const route = createBrowserRouter([
    {
      path: "/",
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
      path: "/homepage",
      element: (
        <div>
          <NavBar/>
          <HomeFrame/>
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
