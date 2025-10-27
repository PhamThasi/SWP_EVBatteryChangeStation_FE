import { Outlet } from "react-router-dom";
import NavBar from "./../components/NavBar";
import Footer from "./../components/footer/footer";

const LINKS = [
  { to: "/", label: "Trang chủ" },
  { to: "/about", label: "Giới thiệu" },
  { to: "/services", label: "Gói dịch vụ" },
  { to: "/stations", label: "Trạm gần nhất" },
  { to: "/contact", label: "Liên hệ" },
];

export default function MainLayout() {
  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <NavBar links={LINKS} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
