import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CreditCard, Lock, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import paymentService from "@/api/paymentService";
import subcriptionService from "@/api/subcriptionService";
import tokenUtils from "@/utils/tokenUtils";

// Helper function to generate transaction ID
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
    // Kiểm tra đăng nhập
    if (!tokenUtils.isLoggedIn()) {
      navigate("/login");
      return;
    }

    // Lấy thông tin subscription
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

      // Tính tổng tiền (price + extraFee)
      const totalPrice = (subscription.price || 0) + (subscription.extraFee || 0);

      // Tạo payment data
      const paymentData = {
        price: totalPrice,
        method: paymentMethod,
        paymentGateId: paymentGateId,
        status: false, // Chưa thanh toán
        createDate: new Date().toISOString(),
        subscriptionId: subscription.subscriptionId,
        transactionId: generateTransactionId(), // Generate transaction ID
      };

      // Gọi API tạo payment
      const response = await paymentService.createPayment(paymentData);
      
      if (response && response.status === 200) {
        setSuccess(true);
        // Có thể redirect đến trang thành công hoặc quay về trang subscriptions
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
      <div className="flex items-center justify-center h-screen text-gray-600">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Đang tải thông tin thanh toán...</p>
        </div>
      </div>
    );
  }

  if (error && !subscription) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Lỗi</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/subscriptions")}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Quay lại trang gói dịch vụ
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thanh toán thành công!</h2>
          <p className="text-gray-600 mb-6">Gói dịch vụ của bạn đang được xử lý.</p>
          <p className="text-sm text-gray-500">Đang chuyển hướng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate("/subscriptions")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Thanh toán</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Subscription Info */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Thông tin gói dịch vụ</h2>
              {subscription && (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Tên gói</p>
                    <p className="text-lg font-semibold text-gray-900">{subscription.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Giá</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {subscription.price ? `${subscription.price.toLocaleString("vi-VN")} VNĐ` : "Liên hệ"}
                    </p>
                  </div>
                  {subscription.extraFee && (
                    <div>
                      <p className="text-sm text-gray-500">Phí phụ thu</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {subscription.extraFee.toLocaleString("vi-VN")} VNĐ
                      </p>
                    </div>
                  )}
                  {subscription.description && (
                    <div>
                      <p className="text-sm text-gray-500">Mô tả</p>
                      <p className="text-gray-700 whitespace-pre-line">{subscription.description}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500">Thời hạn</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {subscription.durationPackage} ngày
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Phương thức thanh toán
              </h2>
              <div className="space-y-3">
                <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="VNPAY"
                    checked={paymentMethod === "VNPAY"}
                    onChange={(e) => {
                      setPaymentMethod(e.target.value);
                      setPaymentGateId(1);
                    }}
                    className="mr-3 w-4 h-4 text-blue-600"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">VNPay</p>
                    <p className="text-sm text-gray-500">Thanh toán qua VNPay</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Tóm tắt đơn hàng</h2>
              {subscription && (
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gói dịch vụ</span>
                    <span className="font-semibold text-gray-900">{subscription.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Giá gói</span>
                    <span className="font-semibold text-gray-900">
                      {subscription.price ? `${subscription.price.toLocaleString("vi-VN")} VNĐ` : "Liên hệ"}
                    </span>
                  </div>
                  {subscription.extraFee && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phí phụ thu</span>
                      <span className="font-semibold text-gray-900">
                        {subscription.extraFee.toLocaleString("vi-VN")} VNĐ
                      </span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between">
                      <span className="text-lg font-bold text-gray-900">Tổng cộng</span>
                      <span className="text-lg font-bold text-blue-600">
                        {subscription.price
                          ? `${(subscription.price + (subscription.extraFee || 0)).toLocaleString("vi-VN")} VNĐ`
                          : "Liên hệ"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button
                onClick={handlePayment}
                disabled={processing || !subscription || subscription.price === null}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-lg font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    <span>Thanh toán</span>
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4 flex items-center justify-center gap-1">
                <Lock className="w-3 h-3" />
                Thanh toán an toàn và bảo mật
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;

