import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthCheck from "./../../hooks/useAuthCheck";
import ConfirmModal from "./../components/ConfirmModal";
import PlanCard from "./../components/PlanCard";
import { Battery, Sparkles, TrendingUp, Shield, Zap } from "lucide-react";
import subcriptionService from "@/api/subcriptionService";

import { useLocation } from "react-router-dom";

const Subscriptions = () => {
  const { requireLogin, isModalOpen, confirmLogin, cancelLogin } =
    useAuthCheck();
  const [plans, setPlans] = useState([]);
  const [subscriptionsData, setSubscriptionsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const transactionId = location.state?.transactionId;

  useEffect(() => {
    if (!transactionId) {
      console.error("Missing transactionId in subscription page!");
    } else {
      console.log("Transaction ID received in subscription page:", transactionId);
    }
  }, [transactionId]);

  const handleBuy = (planTitle) => {
    requireLogin(() => {
      // Find subscription by plan title
      const subscription = subscriptionsData.find(
        (sub) => sub.name === planTitle
      );

      if (!subscription || !subscription.subscriptionId) {
        alert("Không tìm thấy thông tin gói dịch vụ");
        return;
      }

      // If this specific subscription, go back to home
      if (subscription?.name?.toLowerCase().includes("cơ bản")) {
        navigate("/userPage");
        return;
      }

      // Otherwise, navigate to payment with subscriptionId and transactionId
      navigate(
        `/userPage/payment?subscriptionId=${subscription.subscriptionId}&transactionId=${transactionId}`
      );
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Chỉ lấy các subscriptions đang active cho user
        const res = await subcriptionService.getActiveSubscriptions();
        if (res?.data) {
          // Lưu data gốc để sử dụng khi navigate (chỉ active subscriptions)
          setSubscriptionsData(res.data);

          // Convert API data -> frontend-friendly structure
          const formatted = res.data.map((item) => ({
            title: item.name,
            price: item.name.toLowerCase().includes("cơ bản")
              ? "Theo lượt"
              : item.price
              ? `${(item.price / 1000).toFixed(0)}K/tháng`
              : "Liên hệ",
            icon: item.name.toLowerCase().includes("nâng cao")
              ? Sparkles
              : item.name.toLowerCase().includes("tiết kiệm")
              ? TrendingUp
              : Battery,
            gradient: item.name.toLowerCase().includes("nâng cao")
              ? "from-purple-500 to-pink-600"
              : item.name.toLowerCase().includes("tiết kiệm")
              ? "from-blue-500 to-indigo-600"
              : "from-gray-500 to-gray-600",
            highlight: item.name.toLowerCase().includes("tiết kiệm"),
            badge: item.name.toLowerCase().includes("tiết kiệm")
              ? "Best Value"
              : null,
            perks: item.description
              ? item.description
                  .replace(/\\n/g, "\n") // Quan trọng: fix \\n → \n
                  .split("\n")
                  .filter((line) => line.trim())
                  .map((text) => ({ text: text.trim() }))
              : [],
          }));
          setPlans(formatted);
        }
      } catch (error) {
        console.error("Error fetching subscriptions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        Đang tải gói dịch vụ...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 px-4 pt-32 pb-20">
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
