import { useState } from "react";
// import { useNavigate } from "react-router-dom";

/**
 * Hook dùng để kiểm tra trạng thái đăng nhập
 * Trả về các hàm logic và state để tái sử dụng ở nhiều component khác nhau.
 */
export default function useAuthCheck() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const requireLogin = (callback) => {
    // Mock: assume not logged in
    setPendingAction(() => callback);
    setIsModalOpen(true);
  };

  const confirmLogin = () => {
    setIsModalOpen(false);
    if (pendingAction) pendingAction();
  };

  const cancelLogin = () => {
    setIsModalOpen(false);
    setPendingAction(null);
  };

  return { requireLogin, isModalOpen, confirmLogin, cancelLogin };
}
