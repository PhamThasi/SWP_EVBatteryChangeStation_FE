import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import OTPInput from "react-otp-input";
import { toast } from "react-toastify";
import authService from "@/api/authService";

const OTPConfirmation = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("otp");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email;
  const flow = location.state?.flow || "verify";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.warning("Vui lòng nhập đủ 6 số OTP!");
      return;
    }

    setLoading(true);
    try {
      if (flow === "reset") {
        await authService.verifyForgotOtp(email, otp);
        setStep("set-password");
        toast.success("OTP hợp lệ! Đặt lại mật khẩu mới.");
        return;
      }

      // --- Verify account flow ---
      await authService.verifyOtp(email, otp);
      toast.success("Xác thực OTP thành công!");

      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.error("OTP verification failed:", err);
      toast.error("Mã OTP không hợp lệ hoặc đã hết hạn!");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.warning("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.warning("Mật khẩu xác nhận không khớp!");
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(email, newPassword);
      toast.success("Đặt lại mật khẩu thành công!");
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      console.error("Reset password failed:", err);
      toast.error("Không thể đặt lại mật khẩu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center rounded-2xl p-4 text-white bg-[linear-gradient(90deg,_rgba(42,123,155,1)_0%,_rgba(119,87,199,0.98)_15%,_rgba(84,216,223,1)_100%)]">
      <div className="mb-12 text-center font-bold">
        <h1 className="text-5xl">Xác nhận OTP</h1>
        <p className="mt-2 text-2xl opacity-90">
          Nhập mã OTP được gửi tới <span className="font-semibold">{email}</span>
        </p>
      </div>

      {step === "otp" && (
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-8">
          <OTPInput
            value={otp}
            onChange={setOtp}
            numInputs={6}
            shouldAutoFocus
            renderSeparator={<span className="mx-2 text-2xl text-white">-</span>}
            renderInput={(props) => (
              <input
                {...props}
                className="!h-14 !w-14 rounded-lg border border-gray-700 bg-white/10 text-center text-2xl font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#54d8df]"
                inputMode="numeric"
                maxLength="1"
              />
            )}
          />
          <button
            type="submit"
            disabled={loading}
            className="mt-6 rounded-lg bg-white px-8 py-3 text-lg font-bold text-[#2a7b9b] shadow-lg transition-all hover:opacity-90 disabled:opacity-70"
          >
            {loading ? "Đang xác thực..." : "Xác nhận"}
          </button>
        </form>
      )}

      {flow === "reset" && step === "set-password" && (
        <form onSubmit={handleResetPassword} className="mt-8 w-full max-w-md flex flex-col gap-4">
          <input
            type="password"
            placeholder="Mật khẩu mới"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="rounded-lg border border-gray-700 bg-white/10 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#54d8df]"
            required
          />
          <input
            type="password"
            placeholder="Xác nhận mật khẩu mới"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="rounded-lg border border-gray-700 bg-white/10 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#54d8df]"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-lg bg-white px-8 py-3 text-lg font-bold text-[#2a7b9b] shadow-lg transition-all hover:opacity-90 disabled:opacity-70"
          >
            {loading ? "Đang cập nhật..." : "Đổi mật khẩu"}
          </button>
        </form>
      )}
    </div>
  );
};

export default OTPConfirmation;
