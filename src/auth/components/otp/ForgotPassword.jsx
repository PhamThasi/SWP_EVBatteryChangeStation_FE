import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "@/api/authService";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      await authService.sendForgotOtp(email);
      setMessage("Đã gửi OTP về email. Vui lòng kiểm tra hộp thư.");
      // Chuyển qua màn OTP kèm trạng thái flow = reset
      setTimeout(() => {
        navigate("/verifyOtp", { state: { email, flow: "reset" } });
      }, 800);
    } catch (err) {
      console.error("Send OTP failed:", err);
      setMessage("Không thể gửi OTP. Vui lòng kiểm tra email hoặc thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center rounded-2xl p-4 text-white bg-[linear-gradient(90deg,_rgba(42,123,155,1)_0%,_rgba(119,87,199,0.98)_15%,_rgba(84,216,223,1)_100%)]">
      <div className="mb-8 text-center font-bold">
        <h1 className="text-5xl">Quên mật khẩu</h1>
        <p className="mt-2 text-2xl opacity-90">Nhập email để nhận mã OTP</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-lg border border-gray-700 bg-white/10 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#54d8df]"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-white px-8 py-3 text-lg font-bold text-[#2a7b9b] shadow-lg transition-all hover:opacity-90 disabled:opacity-70"
        >
          {loading ? "Đang gửi..." : "Gửi OTP"}
        </button>
      </form>

      {message && <p className="mt-6 text-center text-lg font-semibold">{message}</p>}
    </div>
  );
};

export default ForgotPassword;


