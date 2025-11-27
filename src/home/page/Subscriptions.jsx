import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useAuthCheck from "./../../hooks/useAuthCheck";
import ConfirmModal from "./../components/ConfirmModal";
import PlanCard from "./../components/PlanCard";
import { Battery, Sparkles, TrendingUp, Shield, Zap, CheckCircle } from "lucide-react";
import subcriptionService from "@/api/subcriptionService";
import paymentService from "@/api/paymentService";

const Subscriptions = () => {
  const { requireLogin, isModalOpen, confirmLogin, cancelLogin } =
    useAuthCheck();
  const [plans, setPlans] = useState([]);
  const [subscriptionsData, setSubscriptionsData] = useState([]);
  const [mySubscription, setMySubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const transactionId = location.state?.transactionId;

  // Decode accountId từ token
  const getAccountId = () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;
      const payload = token.split(".")[1];
      const json = JSON.parse(
        atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
      );
      return json?.accountId || json?.AccountId || json?.sub || null;
    } catch (e) {
      console.error("Decode token error", e);
      return null;
    }
  };

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
      if (subscription?.name?.toLowerCase().includes("thanh toán trực tiếp")) {
        navigate("/userPage");
        return;
      }

      // Navigate to payment with subscriptionId
      // transactionId là optional (chỉ có khi mua gói từ booking flow)
      const paymentUrl = transactionId
        ? `/userPage/payment?subscriptionId=${subscription.subscriptionId}&transactionId=${transactionId}`
        : `/userPage/payment?subscriptionId=${subscription.subscriptionId}`;
      navigate(paymentUrl);
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const accountId = getAccountId();
        
        // 1. Lấy payments của account để tìm gói đã mua
        let hasActiveSubscription = false;
        let purchasedSubscriptionId = null;
        
        if (accountId) {
          try {
            // Gọi API get-by-account để lấy payments
            const paymentsRes = await paymentService.getPaymentsByAccountId(accountId);
            const payments = paymentsRes?.data || [];
            
            console.log("Payments của user:", payments);
            
            // Tìm payment có status = "Successful" và có subscriptionId
            // Lấy payment mới nhất (sắp xếp theo createDate giảm dần)
            const successfulPayments = payments
              .filter(
                (payment) => 
                  payment.status === "Successful" && 
                  payment.subscriptionId !== null &&
                  payment.subscriptionId !== undefined
              )
              .sort((a, b) => new Date(b.createDate) - new Date(a.createDate));
            
            const successfulPayment = successfulPayments[0];
            
            console.log("Payment thành công tìm được:", successfulPayment);
            
            if (successfulPayment && successfulPayment.subscriptionId) {
              purchasedSubscriptionId = successfulPayment.subscriptionId;
              
              // Lấy thông tin subscription template từ danh sách subscriptions
              const allSubsRes = await subcriptionService.getSubscriptions();
              const subscriptionTemplate = allSubsRes?.data?.find(
                (sub) => sub.subscriptionId === purchasedSubscriptionId
              );
              
              console.log("Subscription template tìm được:", subscriptionTemplate);
              
              if (subscriptionTemplate) {
                // Hiển thị gói đã mua (từ payment thành công)
                hasActiveSubscription = true;
                setMySubscription({
                  ...subscriptionTemplate,
                  purchaseDate: successfulPayment.createDate,
                  paymentId: successfulPayment.paymentId,
                });
              }
            }
          } catch (error) {
            // Nếu không có payment hoặc lỗi, tiếp tục hiển thị gói để mua
            console.error("Lỗi khi lấy payments:", error);
            console.log("User chưa có payment thành công");
          }
        }

        // 2. Nếu user đã có gói → chỉ hiển thị gói đã mua
        if (hasActiveSubscription && mySubscription) {
          setSubscriptionsData([mySubscription]);
          const formatted = [formatSubscriptionToPlan(mySubscription, true)];
          setPlans(formatted);
        } else {
          // 3. Nếu user chưa có gói → hiển thị tất cả gói có thể mua
          const res = await subcriptionService.getActiveSubscriptions();
          if (res?.data) {
            setSubscriptionsData(res.data);
            const formatted = res.data.map((item) => formatSubscriptionToPlan(item, false));
            setPlans(formatted);
          }
        }
      } catch (error) {
        console.error("Error fetching subscriptions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper function để format subscription thành plan card
  const formatSubscriptionToPlan = (item, isOwned) => {
    return {
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
      badge: isOwned
        ? "Đang sử dụng"
        : item.name.toLowerCase().includes("tiết kiệm")
        ? "Best Value"
        : null,
      isOwned: isOwned,
      perks: item.description
        ? item.description
            .replace(/\\n/g, "\n")
            .split("\n")
            .filter((line) => line.trim())
            .map((text) => ({ text: text.trim() }))
        : [],
    };
  };

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
            {mySubscription ? "Gói Dịch Vụ Của Bạn" : "Chọn Gói Dịch Vụ Swap Pin"}
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
            {mySubscription
              ? "Xem thông tin gói subscription đang sử dụng"
              : "Tối ưu chi phí – Linh hoạt – Ưu tiên trạm"}
          </p>
          {mySubscription && (
            <div className="mt-4 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-green-500/20 backdrop-blur-sm text-white">
              <CheckCircle className="w-5 h-5" />
              <span>
                Còn {mySubscription.remainingSwaps ?? "∞"} lượt đổi pin • Hết hạn:{" "}
                {new Date(mySubscription.endDate).toLocaleDateString("vi-VN")}
              </span>
            </div>
          )}
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
                onAction={plan.isOwned ? undefined : () => handleBuy(plan.title)}
                disabled={plan.isOwned}
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
