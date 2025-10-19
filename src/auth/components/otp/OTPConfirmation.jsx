import authService from "@/api/authService";
import React, { useState } from "react";
import OTPInput from "react-otp-input";
import { useLocation, useNavigate } from "react-router-dom";

const OTPConfirmation = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [mess, setMess] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMess("");
    try {
      const res = await authService.verifyOtp(email, otp);
      console.log(res);

      setMess(" Xác thực OTP thành công! Bạn có thể đăng nhập.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.error("OTP verification failed:", err);
      setMess(" Mã OTP không hợp lệ hoặc đã hết hạn!");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex flex-col justify-center items-center w-full text-white rounded-xl p-10 shadow-lg">
      <h1 className="text-4xl font-bold mb-4">Xác nhận OTP</h1>
      <p className="text-lg mb-6 opacity-80">
        Nhập mã OTP được gửi tới <span className="font-semibold">{email}</span>
      </p>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center gap-6"
      >
        <OTPInput
          value={otp}
          onChange={setOtp}
          numInputs={6}
          shouldAutoFocus
          renderSeparator={<span className="mx-2 text-white">-</span>}
          renderInput={(props) => (
            <input
              {...props}
              className="w-12 h-12 text-center text-lg text-black rounded-md border border-gray-400 focus:outline-none focus:ring-2 focus:ring-[#54d8df]"
              inputMode="numeric"
              maxLength="1"
            />
          )}
        />

        <button
          type="submit"
          disabled={loading}
          className="mt-6 bg-white text-[#2a7b9b] px-8 py-2 rounded-xl font-bold shadow-lg hover:scale-105 transition-transform"
        >
          {loading ? "Đang xác thực..." : "Xác nhận"}
        </button>
      </form>

      {mess && <p className="mt-6 text-lg font-semibold text-center">{mess}</p>}
    </div>
  );
};

export default OTPConfirmation;
