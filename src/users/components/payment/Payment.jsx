import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CreditCard, Lock, ArrowLeft, CheckCircle, AlertCircle, Zap, Shield, Clock } from "lucide-react";
import paymentService from "@/api/paymentService";
import subcriptionService from "@/api/subcriptionService";
import tokenUtils from "@/utils/tokenUtils";

const generateTransactionId = () => {
  return `txn_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
};

const Payment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const subscriptionId = searchParams.get("subscriptionId");

  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("VNPAY");
  const [paymentGateId, setPaymentGateId] = useState(1);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!tokenUtils.isLoggedIn()) {
      navigate("/login");
      return;
    }

    const fetchSubscription = async () => {
      try {
        const res = await subcriptionService.getSubscriptions();
        if (res?.data && subscriptionId) {
          const foundSubscription = res.data.find(
            (sub) => sub.subscriptionId === subscriptionId
          );
          if (foundSubscription) {
            setSubscription(foundSubscription);
          } else {
            setError("Không tìm thấy gói dịch vụ");
          }
        }
      } catch (error) {
        console.error("Error fetching subscription:", error);
        setError("Không thể tải thông tin gói dịch vụ");
      } finally {
        setLoading(false);
      }
    };

    if (subscriptionId) {
      fetchSubscription();
    } else {
      setError("Thiếu thông tin gói dịch vụ");
      setLoading(false);
    }
  }, [subscriptionId, navigate]);

  const handlePayment = async () => {
    if (!subscription) return;

    setProcessing(true);
    setError(null);

    try {
      const userData = tokenUtils.getUserData();
      if (!userData || !userData.accountId) {
        setError("Không thể lấy thông tin người dùng");
        setProcessing(false);
        return;
      }

      const totalPrice = (subscription.price || 0) + (subscription.extraFee || 0);

      const paymentData = {
        price: totalPrice,
        method: paymentMethod,
        paymentGateId: paymentGateId,
        status: false,
        createDate: new Date().toISOString(),
        subscriptionId: subscription.subscriptionId,
        transactionId: generateTransactionId(),
      };

      const response = await paymentService.createPayment(paymentData);
      
      if (response && response.status === 200) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/userPage/subscriptions");
        }, 2000);
      } else {
        setError(response?.message || "Thanh toán thất bại");
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      setError(error.response?.data?.message || "Có lỗi xảy ra khi xử lý thanh toán");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (error && !subscription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center transform transition-all hover:scale-[1.02]">
          <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Lỗi</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/userPage/subscriptions")}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all"
          >
            Quay lại trang gói dịch vụ
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thanh toán thành công!</h2>
          <p className="text-gray-600 mb-6">Gói dịch vụ của bạn đã được kích hoạt.</p>
          <p className="text-sm text-gray-500">Đang chuyển hướng...</p>
        </div>
      </div>
    );
  }

  const totalPrice = (subscription?.price || 0) + (subscription?.extraFee || 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-5">
          <button
            onClick={() => navigate("/userPage/subscriptions")}
            className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors mb-3 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Quay lại</span>
          </button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Thanh toán gói dịch vụ
          </h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Subscription Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Package Card */}
            <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 transform transition-all hover:shadow-2xl hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Thông tin gói dịch vụ</h2>
                  <p className="text-sm text-gray-500">Gói nâng cao - Tối ưu hiệu suất</p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <p className="text-sm font-medium text-gray-500">Tên gói</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">{subscription.name}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Giá gói</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {subscription.price.toLocaleString("vi-VN")} VNĐ
                    </p>
                  </div>
                  {subscription.extraFee > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phí phụ thu</p>
                      <p className="text-xl font-semibold text-orange-600">
                        +{subscription.extraFee.toLocaleString("vi-VN")} VNĐ
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                    <Clock className="w-4 h-4" /> Thời hạn
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {subscription.durationPackage} ngày
                  </p>
                </div>

                {subscription.description && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">Mô tả dịch vụ</p>
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
                      <p className="text-gray-700 whitespace-pre-line leading-relaxed text-sm">
                        {subscription.description.replace(/\\n/g, "\n")}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Phương thức thanh toán</h2>
              </div>

              <label className="flex items-center p-5 border-2 border-indigo-200 rounded-2xl cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all group">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="VNPAY"
                  checked={paymentMethod === "VNPAY"}
                  onChange={(e) => {
                    setPaymentMethod(e.target.value);
                    setPaymentGateId(1);
                  }}
                  className="w-5 h-5 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="flex-1 ml-4">
                  <p className="font-bold text-gray-900 text-lg">VNPay</p>
                  <p className="text-sm text-gray-600">Thanh toán an toàn qua cổng VNPay</p>
                </div>
                <div className="p-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl group-hover:scale-110 transition-transform">
                  <Shield className="w-5 h-5 text-indigo-600" />
                </div>
              </label>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sticky top-24 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                Tóm tắt đơn hàng
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Gói dịch vụ</span>
                  <span className="font-semibold text-gray-900">{subscription.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Giá gói</span>
                  <span className="font-semibold">{subscription.price.toLocaleString("vi-VN")} VNĐ</span>
                </div>
                {subscription.extraFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Phí phụ thu</span>
                    <span className="font-semibold text-orange-600">
                      +{subscription.extraFee.toLocaleString("vi-VN")} VNĐ
                    </span>
                  </div>
                )}
              </div>

              <div className="border-t-2 border-dashed border-gray-300 pt-5 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-900">Tổng cộng</span>
                  <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {totalPrice.toLocaleString("vi-VN")} VNĐ
                  </span>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                  {error}
                </div>
              )}

              <button
                onClick={handlePayment}
                disabled={processing || !subscription}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-5 px-6 rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-6 h-6" />
                    <span>Thanh toán ngay</span>
                  </>
                )}
              </button>

              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                  <Lock className="w-4 h-4" />
                  Thanh toán được mã hóa và bảo mật 100%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;