// src/home/page/Subscriptions.jsx
import React, { useState } from "react";
import useAuthCheck from "./../../hooks/useAuthCheck";
import ConfirmModal from "./../components/ConfirmModal";
import PlanCard from "./../components/PlanCard";
import { Battery, Shield, Sparkles, TrendingUp, Zap } from "lucide-react";

const Subscriptions = () => {
  const { requireLogin, isModalOpen, confirmLogin, cancelLogin } = useAuthCheck();
  const {isLogin, setIsLogin} = useState(false);
  const handleBuy = (planName) => {
    requireLogin(() => {
      alert(`Thanh toán cho gói ${planName} (mock)`);
    });
  };

  const plans = [
    {
      title: "Gói Cơ Bản",
      price: "Theo lượt",
      icon: Battery,
      gradient: "from-gray-500 to-gray-600",
      perks: [
        { text: "Swap từng lần – trả theo lượt" },
        { text: "Phù hợp người dùng ít di chuyển" },
        { text: "Linh hoạt – dùng khi cần" },
        { text: "Không áp dụng ưu đãi gia hạn" },
        { text: "Không bao gồm bảo dưỡng định kỳ" },
      ],
    },
    {
      title: "Gói Tiết Kiệm",
      price: "299K/tháng",
      badge: "Best Value",
      highlight: true,
      icon: TrendingUp,
      gradient: "from-blue-500 to-indigo-600",
      perks: [
        { text: "Thuê pin theo tháng – giảm ~30%" },
        { text: "10–15 lượt swap miễn phí/tháng" },
        { text: "Tự động gia hạn tiện lợi" },
        { text: "Ưu tiên tại trạm trong giờ cao điểm" },
        { text: "Theo dõi số lần swap còn lại trên app" },
      ],
    },
    {
      title: "Gói Premium",
      price: "Liên hệ",
      icon: Sparkles,
      gradient: "from-purple-500 to-pink-600",
      perks: [
        { text: "Swap gần như không giới hạn" },
        { text: "Theo dõi tình trạng pin trên App (Km còn lại, chu kỳ sạc)" },
        { text: "Bảo trì xe toàn diện miễn phí (02 lần/năm)" },
        { text: "Hỗ trợ & Cứu hộ khẩn cấp 24/7 (< 30 phút)" },
        { text: "Giảm giá 10–15% khi đăng ký thêm xe" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 px-4 pt-32 pb-20">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-10"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-10"></div>
        
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-2xl bg-white/20 backdrop-blur-sm">
            <Zap className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-6">
            Chọn Gói Dịch Vụ Swap Pin
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Tối ưu chi phí – Linh hoạt – Ưu tiên trạm
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="relative -mt-16 px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 items-start">
            {plans.map((plan) => (
              <PlanCard
                key={plan.title}
                title={plan.title}
                price={plan.price}
                badge={plan.badge}
                highlight={plan.highlight}
                perks={plan.perks}
                gradient={plan.gradient}
                icon={plan.icon}
                onAction={() => handleBuy(plan.title)}
              />
            ))}
          </div>

          {/* Trust Section */}
          <div className="mt-20 text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-green-100 text-green-800 font-semibold">
              <Shield className="w-5 h-5" />
              <span>Đảm bảo hoàn tiền 100% trong 7 ngày</span>
            </div>
          </div>
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
