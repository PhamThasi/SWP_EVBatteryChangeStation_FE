// src/home/page/Subscriptions.jsx
import React from "react";
import useAuthCheck from "./../../hook/useAuthCheck";
import ConfirmModal from "./../components/ConfirmModal";
import PlanCard from "./../components/PlanCard";

const Subscriptions = () => {
  const { requireLogin, isModalOpen, confirmLogin, cancelLogin } =
    useAuthCheck();

  const handleBuy = (planName) => {
    requireLogin(() => {
      // TODO: redirect checkout
      alert(`Thanh toán cho gói ${planName} (mock)`);
    });
  };

  const plans = [
    {
      title: "Gói Cơ Bản",
      price: "Theo lượt",
      perks: [
        "🔁 Swap từng lần – trả theo lượt",
        "💡 Phù hợp người dùng ít di chuyển",
        "💸 Linh hoạt – dùng khi cần",
        "Ưu đãi Gia hạn - Không áp dụng",
        "Bảo dưỡng Định kỳ - Không bao gồm",
      ],
    },
    {
      title: "Gói Tiết Kiệm",
      price: "299K/tháng",
      badge: "Best Value",
      highlight: true,
      perks: [
        "📦 Thuê pin theo tháng – giảm ~30%",
        "🔁 10–15 lượt swap miễn phí/tháng",
        "💳 Tự động gia hạn tiện lợi",
        "⚡ Ưu tiên tại trạm khi đổi pin trong giờ cao điểm",
        " Theo dõi số lần swap còn lại ngay trên app",
      ],
    },
    {
      title: "Gói Premium",
      price: "Liên hệ",
      perks: [
        "🔋 Swap gần như không giới hạn",
        "Theo dõi Tình trạng Pin trên App (Ví dụ: Số km còn lại, Chu kỳ sạc)",
        "🚗 Bảo trì xe toàn diện Miễn phí tại trạm (02 lần/năm)",
        "💬 Hỗ trợ & Cứu hộ Khẩn cấp 24/7 (Cam kết thời gian phản hồi dưới 30 phút)",
        "🎁 Giảm giá 10–15% khi đăng ký thêm phương tiện khác",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto mt-36 max-w-screen-2xl px-4 py-10">
        <h1 className="text-3xl font-bold text-slate-900">
          Chọn Gói Dịch Vụ Swap Pin
        </h1>
        <p className="mt-1 text-slate-600">
          Tối ưu chi phí – Linh hoạt – Ưu tiên trạm
        </p>

        {/* 3 cột ở >=1280px (xl), 2 cột ở md, 1 cột mobile */}
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {plans.map((p) => (
            <PlanCard
              key={p.title}
              title={p.title}
              price={p.price}
              badge={p.badge}
              highlight={p.highlight}
              perks={p.perks}
              onAction={() => handleBuy(p.title)}
            />
          ))}
        </div>
      </div>

      <ConfirmModal
        open={isModalOpen}
        title="Bạn chưa đăng nhập"
        message="Vui lòng đăng nhập để tiếp tục mua gói dịch vụ."
        onConfirm={confirmLogin}
        onCancel={cancelLogin}
      />
    </div>
  );
};

export default Subscriptions;
