import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Button from "../../../components/button";
import "./signIn.css";
import { jwtDecode } from "jwt-decode";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Gọi API login từ backend của cậu (VD: http://localhost:5000/api/Auth/login)
      const res = await axios.post("http://localhost:5204/api/Authen/login", {
        keyword: email,
        password,
      });
      // Lưu token vào localStorage
      if (res.data.status == 200 && res.data.data) {
        const token = res.data.data;
        localStorage.setItem("token", token);
        const decoded = jwtDecode(token);
        console.log("Decoded token:", decoded);

        localStorage.setItem("user", JSON.stringify(decoded));
      }

      // Chuyển hướng sang user page
      navigate("/userPage/userProfile");
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
        </div>
      </form>
    </div>
  );
};

export default SignIn;
