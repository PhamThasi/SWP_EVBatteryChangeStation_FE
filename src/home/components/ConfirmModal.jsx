// src/home/components/ConfirmModal.jsx
import { Shield } from "lucide-react";
import React from "react";

export default function ConfirmModal({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Đăng nhập",
  cancelText = "Hủy",
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-[90%] max-w-md rounded-3xl bg-white p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="mb-4 inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600">
          <Shield className="w-7 h-7 text-white" />
        </div>

        <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
        <p className="mt-3 text-gray-600 leading-relaxed">{message}</p>

        <div className="mt-8 flex items-center gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border-2 border-gray-200 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-semibold text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
