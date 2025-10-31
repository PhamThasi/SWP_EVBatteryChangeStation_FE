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
    // Container chính, sử dụng gradient và layout giống hệt signUp/signIn
    <div className="flex h-full w-full flex-col items-center justify-center rounded-2xl p-4 text-white
                    bg-[linear-gradient(90deg,_rgba(42,123,155,1)_0%,_rgba(119,87,199,0.98)_15%,_rgba(84,216,223,1)_100%)]">
      
      {/* Header */}
      <div className="mb-12 text-center font-bold">
        <h1 className="text-5xl">Xác nhận OTP</h1> {/* <-- Yêu cầu 5xl */}
        <p className="mt-2 text-2xl opacity-90"> {/* <-- Yêu cầu 2xl/3xl */}
          Nhập mã OTP được gửi tới <span className="font-semibold">{email}</span>
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center gap-8" // Tăng gap
      >
        <OTPInput
          value={otp}
          onChange={setOtp}
          numInputs={6}
          shouldAutoFocus
          renderSeparator={<span className="mx-2 text-2xl text-white">-</span>}
          renderInput={(props) => (
            <input
              {...props}
              // Style ô input giống signUp (nền trong, chữ trắng)
              className="!h-14 !w-14 rounded-lg border border-gray-700 bg-white/10 
                         text-center text-2xl font-semibold text-white
                         focus:outline-none focus:ring-2 focus:ring-[#54d8df]"
              inputMode="numeric"
              maxLength="1" // (Lưu ý: props đã bao gồm maxLength)
            />
          )}
        />

        <button
          type="submit"
          disabled={loading}
          // Style nút bấm giống nút Google (nền trắng, chữ xanh)
          className="mt-6 rounded-lg bg-white px-8 py-3 text-lg font-bold text-[#2a7b9b] 
                     shadow-lg transition-all hover:opacity-90 disabled:opacity-70"
        >
          {loading ? "Đang xác thực..." : "Xác nhận"}
        </button>
      </form>

      {/* Thông báo */}
      {mess && (
        <p className="mt-8 text-center text-lg font-semibold">{mess}</p>
      )}
    </div>
  );
};

export default OTPConfirmation; 