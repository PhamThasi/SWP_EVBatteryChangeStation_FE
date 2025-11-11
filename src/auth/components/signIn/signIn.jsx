import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../../components/button";
import { toast } from "react-toastify";
import authService from "@/api/authService";
import tokenUtils from "@/utils/tokenUtils";
import "./signIn.css";

const ROLE_ID_ROUTE = {
  "cde0b58d-9e49-4b2b-8ef2-d991d07af541": "/admin",    // admin
  "5dc92b82-be9e-4614-88f5-cc393bbdae7a": "/staff",    // staff
  "5109c33d9596ba845b28-74bd-4fe6-b1a3-5109c33d9596": "/userPage", // customer
};

const getRedirectPath = (user) => {
  if (!user) return "/userPage";

  // Ưu tiên theo roleId (UUID)
  const id = typeof user.roleId === "string" ? user.roleId.toLowerCase() : "";
  if (id && ROLE_ID_ROUTE[id]) return ROLE_ID_ROUTE[id];

  // Fallback theo tên role (nếu BE trả role/roleName dạng text)
  const name =
    typeof user.roleName === "string"
      ? user.roleName.toLowerCase()
      : typeof user.role === "string"
      ? user.role.toLowerCase()
      : "";

  switch (name) {
    case "admin":
      return "/admin";
    case "staff":
      return "/staff";
    default:
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
          navigate(getRedirectPath(userData));
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
        toast.error("Đăng nhập thất bại!");
        return;
      }

      localStorage.setItem("token", token);

      const userProfile = await tokenUtils.processLoginToken(token);
      if (!userProfile) {
        toast.error("Không thể lấy thông tin người dùng!");
        return;
      }

      toast.success(`Xin chào ${userProfile.fullName || "User"}!`);
      navigate(getRedirectPath(userProfile)); // ✅ dùng đúng hàm
    } catch (err) {
      console.error("Login failed:", err);
      toast.error(err?.response?.data?.message || "Sai tài khoản hoặc mật khẩu!");
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
