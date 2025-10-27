import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../../components/button";
import "./signIn.css";
import authService from "@/api/authService";
import tokenUtils from "@/utils/tokenUtils";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Gọi API login từ backend của cậu (VD: http://localhost:5000/api/Auth/login)
      const res = await authService.login(email, password);
      console.log("Full API response:", res);
      console.log("Response data:", res.data);
      console.log("Response status:", res.status);
  
      // Kiểm tra response structure
      if (res && res.data) {
        console.log("Checking response conditions...");
        console.log("res.data.status:", res.data.status);
        console.log("res.data.data:", res.data.data);
        console.log("res.data.status == 200:", res.data.status == 200);
        console.log("res.data?.data exists:", !!res.data?.data);
        
        // Lưu token vào localStorage
        if (res.data.status == 200 || res.data?.data) {
          const token = res.data?.data;
          console.log("Token to save:", token);
          
          if (token) {
            localStorage.setItem("token", token);
            
            // Sử dụng hàm processLoginToken để xử lý token một cách tối ưu
            const userProfile = await tokenUtils.processLoginToken(token);
            
            if (userProfile) {
              console.log("Login successful, user profile processed:", userProfile);
              // Chuyển hướng sang dashboard (trang chính sau khi login)
              navigate("/userPage");
            } else {
              console.error("Failed to process login token");
              alert("Có lỗi xảy ra khi xử lý thông tin đăng nhập!");
            }
          } else {
            console.error("No token received from API");
            alert("Không nhận được token từ server!");
          }
        } else {
          console.error("API response indicates failure");
          console.error("Status:", res.data.status);
          console.error("Data:", res.data.data);
          alert("Đăng nhập thất bại! Vui lòng kiểm tra lại thông tin.");
        }
      } else {
        console.error("Invalid response structure:", res);
        alert("Phản hồi từ server không hợp lệ!");
      }
    } catch (err) {
      console.error("Login failed:", err);
      console.error("Error details:", err.response?.data);
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
        </div>
      </form>
    </div>
  );
};

export default SignIn;
