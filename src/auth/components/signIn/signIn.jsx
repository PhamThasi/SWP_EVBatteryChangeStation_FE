import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../../components/button";
import "./signIn.css";
import authService from "@/api/authService";
import tokenUtils from "@/utils/tokenUtils";
import roleService from "@/api/roleService";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkExistingLogin = async () => {
      if (tokenUtils.isLoggedIn()) {
        const userData = tokenUtils.getUserData();
        if (!userData) return;
        const roleRedirect = await getRedirectPathByRole(userData.roleId);
        navigate(roleRedirect);
      }
    };
    checkExistingLogin();
  }, [navigate]);

  const getRedirectPathByRole = async (roleId) => {
    try {
      const allRoles = await roleService.getAllRoles();
      const matchedRole = allRoles?.data?.find((r) => r.roleId === roleId);
      if (!matchedRole) return "/userPage";
      switch (matchedRole.roleName.toLowerCase()) {
        case "admin":
          return "/admin";
        case "staff":
          return "/staff";
        default:
          return "/userPage";
      }
    } catch {
      return "/userPage";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await authService.login(email, password);
      if (!res?.data?.data) {
        alert("Đăng nhập thất bại!");
        return;
      }

      const token = res.data.data;
      localStorage.setItem("token", token);

      const userProfile = await tokenUtils.processLoginToken(token);
      if (!userProfile) {
        alert("Không thể lấy thông tin user!");
        return;
      }

      // ✅ Check & update fullname nếu còn pending
      const pending = JSON.parse(localStorage.getItem("pendingProfile"));
      if (pending?.fullName) {
        try {
          await authService.updateProfile({
            ...userProfile,
            fullName: pending.fullName,
          });
          localStorage.removeItem("pendingProfile");
          console.log("✅ Updated fullname after login fallback");
        } catch (err) {
          console.error("⚠️ Fallback update fullname failed:", err);
        }
      }

      const redirectPath = await getRedirectPathByRole(userProfile.roleId);
      navigate(redirectPath);
    } catch (err) {
      console.error("Login failed:", err);
      alert("Sai tài khoản hoặc mật khẩu!");
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
