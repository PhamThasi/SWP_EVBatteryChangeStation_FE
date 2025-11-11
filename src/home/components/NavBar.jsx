import "./NavBar.css";
import logo from "./../../assets/logo.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import tokenUtils from "@/utils/tokenUtils";

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check login status on mount and when pathname changes
  useEffect(() => {
    const checkLoginStatus = () => {
      const loggedIn = tokenUtils.isLoggedIn();
      setIsLoggedIn(loggedIn);
    };
    
    checkLoginStatus();
    // Re-check periodically (every 5 seconds) to handle external changes
    const interval = setInterval(checkLoginStatus, 5000);
    
    return () => clearInterval(interval);
  }, [pathname]);

  const links = [
    { to: "/", label: "Trang chủ" },
    { to: "/about", label: "Giới thiệu" },
    { to: "/subscriptions", label: "Gói dịch vụ" },
    { to: "/stations", label: "Trạm gần nhất" },
    { to: "/feedback", label: "Đánh giá" },
  ];

  const solid = pathname !== "/"; // <= khác home thì dùng nền sáng

  // Handle login button click
  const handleLoginClick = async (e) => {
    e.preventDefault();
    
    // If already logged in, auto-login and redirect
    if (isLoggedIn) {
      try {
        console.log("User already logged in, performing auto login...");
        const userData = await tokenUtils.autoLogin();
        
        if (userData) {
          const roleName = (userData.role || "").toLowerCase();
          const roleId = (userData.roleId || "").toLowerCase();
          const ADMIN_ROLE_ID = "98817ce2-3b59-49a9-81b6-ed2bf06ec72f";
          const STAFF_ROLE_ID = "25a09071-17a3-4a84-b6f2-33244fb374f2";
          // If admin (by name or roleId), go to admin schedule
          if (roleName === "admin" || roleId === ADMIN_ROLE_ID) {
            console.log("Auto login successful, admin detected. Redirecting to /admin/schedule...");
            navigate("/admin/schedule");
          } else if (roleName === "staff" || roleId === STAFF_ROLE_ID) {
            console.log("Auto login successful, staff detected. Redirecting to /staff...");
            navigate("/staff");
          } else {
            console.log("Auto login successful, redirecting to user page...");
            navigate("/userPage");
          }
        } else {
          // Token might be invalid, clear and redirect to login
          console.log("Auto login failed, redirecting to login page...");
          navigate("/login");
        }
      } catch (error) {
        console.error("Error during auto login:", error);
        navigate("/login");
      }
    } else {
      // Not logged in, go to login page
      navigate("/login");
    }
  };

  return (
    <nav className={`nv-navbar ${scrolled ? "is-scrolled" : ""} ${solid ? "is-solid" : ""}`}>
      <ul className="nv-links">
        {links.map((l) => (
          <li key={l.to}>
            <Link
              to={l.to}
              className={`nv-link ${pathname === l.to ? "is-active" : ""}`}
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>

      <div
        className="nv-logo"
        onClick={() => navigate("/")}
        style={{ cursor: "pointer" }}
      >
        <img src={logo} alt="Logo" />
      </div>

      <div className="nv-account">
        <a 
          className="nv-login" 
          href="/login"
          onClick={handleLoginClick}
          style={{ cursor: "pointer" }}
        >
          {isLoggedIn ? "Tài khoản" : "Đăng nhập"}
        </a>
      </div>
    </nav>
  );
}
