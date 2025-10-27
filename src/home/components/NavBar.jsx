import "./NavBar.css";
import logo from "./../../assets/logo.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { to: "/", label: "Trang chủ" },
    { to: "/about", label: "Giới thiệu" },
    { to: "/subscriptions", label: "Gói dịch vụ" },
    { to: "/stations", label: "Trạm gần nhất" },
    { to: "/contact", label: "Liên hệ" },
  ];

  const solid = pathname !== "/"; // <= khác home thì dùng nền sáng

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
        <Link className="nv-login" to="/login">Đăng nhập</Link>
      </div>
    </nav>
  );
}
