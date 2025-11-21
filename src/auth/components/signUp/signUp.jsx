import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../../components/button";
import { toast } from "react-toastify";
import authService from "@/api/authService";
import "./signUp.css";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      toast.error("Mật khẩu không trùng khớp!");
      return;
    }

    try {
      await authService.register(email, password);
      toast.success("Đăng ký thành công! Vui lòng kiểm tra OTP trong email.");
      navigate("/verifyOtp", { state: { email } });
    } catch (err) {
      console.error("Sign up failed:", err);
      toast.error(err?.response?.data?.message || "Đăng ký thất bại!");
    }
  };

  return (
    <div className="auth-signup-container">
      <div className="auth-signup-header">
        <h1>Sign Up</h1>
        <p>Create a new account</p>
      </div>

      <form className="auth-form-group" onSubmit={handleSubmit}>
        <div className="auth-form-block">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address"
            required
          />
        </div>

        <div className="auth-form-block">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            minLength="6"
          />
        </div>

        <div className="auth-form-block">
          <label>Confirm Password</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirm password"
            required
          />
        </div>

        <div className="auth-btn-group">
          <Button type="submit">Sign Up</Button>
        </div>

        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default SignUp;
