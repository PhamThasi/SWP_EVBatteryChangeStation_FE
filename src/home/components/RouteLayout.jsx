import { Outlet, useLocation } from "react-router-dom";
import AdminNav from "../components/AdminNav";
import NavBar from "../components/NavBar";

const RouteLayout =()=> {
    const location = useLocation();

    //role base nav bar
    const isAdminRoute = location.pathname.startsWith("/admin");
    const isHomeRoute = location.pathname.startsWith("/homepage");
    const isStaffRoute = location.pathname.startsWith("/staff");

    return(
        <div>
      {isAdminRoute && <AdminNav />}
      {isHomeRoute && <NavBar />}
      {isStaffRoute && <NavBar/>}

      <div className="page-content">
        <Outlet /> {/* Where child pages render */}
      </div>
    </div>
    );
};

export default RouteLayout;