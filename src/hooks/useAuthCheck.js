import { useState } from "react";
import { useNavigate } from "react-router-dom";
import tokenUtils from "@/utils/tokenUtils";

/**
 * Hook dùng để kiểm tra trạng thái đăng nhập
 * Trả về các hàm logic và state để tái sử dụng ở nhiều component khác nhau.
 */
export default function useAuthCheck() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const navigate = useNavigate();

  const requireLogin = (callback) => {
    // Kiểm tra xem user đã đăng nhập chưa
    const isLoggedIn = tokenUtils.isLoggedIn();
    
    if (isLoggedIn) {
      // Nếu đã đăng nhập, thực hiện callback ngay
      if (callback) callback();
    } else {
      // Nếu chưa đăng nhập, hiển thị modal yêu cầu đăng nhập
      setPendingAction(() => callback);
      setIsModalOpen(true);
    }
  };

  const confirmLogin = () => {
    setIsModalOpen(false);
    // Điều hướng đến trang đăng nhập
    navigate("/login");
    // Lưu callback để sau khi đăng nhập thành công có thể thực hiện
    if (pendingAction) {
      // Có thể lưu vào sessionStorage để sử dụng sau khi đăng nhập
      sessionStorage.setItem("pendingAction", JSON.stringify({ type: "callback" }));
    }
  };

  const cancelLogin = () => {
    setIsModalOpen(false);
    setPendingAction(null);
  };

  return { requireLogin, isModalOpen, confirmLogin, cancelLogin };
}
