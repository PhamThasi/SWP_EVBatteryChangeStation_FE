import { useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Hook dùng để kiểm tra trạng thái đăng nhập
 * Trả về các hàm logic và state để tái sử dụng ở nhiều component khác nhau.
 */
export default function useAuthCheck() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const navigate = useNavigate();

  const isLoggedIn = !!localStorage.getItem("token");

  const requireLogin = (callback) => {
    if (!isLoggedIn) {
      setPendingAction(() => callback);
      setIsModalOpen(true);
    } else {
      callback();
    }
  };

  const confirmLogin = () => {
    setIsModalOpen(false);
    navigate("/login");
  };

  const cancelLogin = () => {
    setIsModalOpen(false);
    setPendingAction(null);
  };

  return {
    isLoggedIn,
    isModalOpen,
    confirmLogin,
    cancelLogin,
    requireLogin,
  };
}
