import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../../components/button";
import { notifySuccess, notifyError } from "@/components/notification/notification";
import authService from "@/api/authService";
import tokenUtils from "@/utils/tokenUtils";
import roleService from "@/api/roleService";
import "./signIn.css";

const getRedirectPath = async (user) => {
  if (!user) return "/userPage";

  try {
    const roleName = user.roleName || user.role || "";
    const roleId = user.roleId || "";
    
    // Sử dụng roleService để lấy redirect path
    const redirectPath = await roleService.getRedirectPathByRole(roleName, roleId);
    return redirectPath;
  } catch (error) {
    console.error("Error getting redirect path:", error);
    // Fallback về default route
    const roleName = (user.roleName || user.role || "").toLowerCase();
    if (roleName === "admin") return "/admin";
    if (roleName === "staff") return "/staff";
    return "/userPage";
  }
};

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkExistingLogin = async () => {
      if (tokenUtils.isLoggedIn()) {
        const userData = tokenUtils.getUserData();
        if (userData) {
          const redirectPath = await getRedirectPath(userData);
          navigate(redirectPath);
        }
      }
    };
    checkExistingLogin();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await authService.login(email, password);
      const token = res?.data?.data;

      if (!token) {
        notifyError("Đăng nhập thất bại!");
        return;
      }

      localStorage.setItem("token", token);

      const userProfile = await tokenUtils.processLoginToken(token);
      if (!userProfile) {
        notifyError("Không thể lấy thông tin người dùng!");
        return;
      }

      notifySuccess(`Xin chào ${userProfile.fullName || "User"}!`);
      const redirectPath = await getRedirectPath(userProfile);
      navigate(redirectPath);
    } catch (err) {
      console.error("Login failed:", err);
      notifyError(err?.response?.data?.message || "Sai tài khoản hoặc mật khẩu!");
    }
  };

  return (
    <div className="signIn">
      <div className="header-signIn">
        <h1>WELCOME BACK!</h1>
        <p>Please login to your account</p>
      </div>

      <form className="signIn-Group" onSubmit={handleSubmit}>
        <div className="signIn-block">
          <label>Email Address:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            required
          />
        </div>

        <div className="signIn-block">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
        </div>

        <div className="butt">
          <Button type="submit">Sign in</Button>
        </div>

        <div className="footer-text">
          <p>
            Don't have an account yet?
            <Link to="/signup"> Create an account </Link>
          </p>
          <p style={{ marginTop: 8 }}>
            <Link to="/forgot-password">Forgot password?</Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default SignIn;
