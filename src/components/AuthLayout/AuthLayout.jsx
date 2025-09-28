import "./AuthLayout.css";
import car from "./../../assets/car.jpg";
const AuthLayout = ({ children }) => {
  return (
    <div className="auth-container">
      <div className="auth-left">
        <img src={car} alt="" />
      </div>
      <div className="auth-right">{children}</div>
    </div>
  );
};

export default AuthLayout;
