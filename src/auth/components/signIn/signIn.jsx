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

  // ==================== AUTO LOGIN ====================
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

  // ==================== ROLE HANDLER ====================
  const getRedirectPathByRole = async (roleId) => {
    try {
      const allRoles = await roleService.getAllRoles();
      const matchedRole = allRoles?.data?.find((r) => r.roleId === roleId);

      if (!matchedRole) return "/userPage"; // fallback

      switch (matchedRole.roleName.toLowerCase()) {
        case "admin":
          return "/admin";
        case "staff":
          return "/admin"; // nếu có StaffLayout thì đổi thành /staff
        case "customer":
        default:
          return "/userPage";
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      return "/userPage";
    }
  };

  // ==================== LOGIN HANDLER ====================
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await authService.login(email, password);
      console.log("Full API response:", res);

      if (!res?.data) {
        alert("Phản hồi từ server không hợp lệ!");
        return;
      }

      if (res.data.status !== 200 || !res.data.data) {
        alert("Đăng nhập thất bại! Kiểm tra lại thông tin.");
        return;
      }

      const token = res.data.data;
      if (!token) {
        alert("Không nhận được token từ server!");
        return;
      }

      // lưu token vào localStorage
      localStorage.setItem("token", token);

      // Decode token để lấy user info
      const userProfile = await tokenUtils.processLoginToken(token);
      if (!userProfile) {
        alert("Không thể lấy thông tin user từ token!");
        return;
      }

      console.log("✅ User profile decoded:", userProfile);

      // điều hướng theo role
      const redirectPath = await getRedirectPathByRole(userProfile.roleId);
      navigate(redirectPath);
    } catch (err) {
      console.error("Login failed:", err);
      alert("Sai tài khoản hoặc mật khẩu!");
    }
  };

  // ==================== UI ====================
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
        </div>
      </form>
    </div>
  );
};

export default SignIn;
