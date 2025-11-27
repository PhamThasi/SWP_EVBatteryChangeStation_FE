import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  CreditCard,
  Lock,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Banknote,
} from "lucide-react";
import subcriptionService from "@/api/subcriptionService";
import tokenUtils from "@/utils/tokenUtils";
import axios from "axios";

const Payment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const subscriptionId = searchParams.get("subscriptionId");
  const transactionId = searchParams.get("transactionId");

  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

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

  // transactionId là optional (chỉ có khi mua gói từ booking flow)
  // Nếu mua gói độc lập thì không cần transactionId

  const handlePayment = async () => {
    if (!subscription) return;

    setProcessing(true);
    setError(null);

    try {
      const userData = tokenUtils.getUserData();
      if (!userData?.accountId) {
        setError("Không thể lấy thông tin người dùng");
        setProcessing(false);
        return;
      }
      // transactionId là optional - chỉ có khi mua gói từ booking flow

      const totalPrice =
        (subscription.price || 0) + (subscription.extraFee || 0);

      const paymentData = {
        price: totalPrice,
        method: "VNPAY", // Mặc định thanh toán qua VNPay
        paymentGateId: 0,
        createDate: new Date().toISOString(),
        subscriptionId: subscription.subscriptionId,
        accountId: userData.accountId, // Thêm accountId để BE gắn subscription
        // transactionId là optional (chỉ có khi mua gói từ booking flow)
        ...(transactionId && { transactionId: transactionId }),
      };
      // Lưu transactionId vào sessionStorage nếu có (cho booking flow)
      if (transactionId) {
        sessionStorage.setItem("transactionId", transactionId);
      }
      // console.log("Create Payment API payload:", paymentData);

      // 1️⃣ Tạo payment
      const createRes = await axios.post(
        "http://localhost:5204/api/Payment/create",
        paymentData
      );
      // console.log("Response từ Backend:", createRes.data);

      // ⭐️ SỬA LỖI: Đọc 'paymentId' từ 'createRes.data.data' (dựa trên ServiceResult và PaymentRespondDto)
      const paymentId = createRes?.data?.data?.paymentId;

      if (paymentId) {
        // console.log("Lấy được paymentId thành công:", paymentId);

        // 3️⃣ Tạo VNPay URL
        const vnPayRes = await axios.post(
          `http://localhost:5204/api/VNPay/create-payment?paymentId=${paymentId}`
        );
        const paymentUrl = vnPayRes?.data?.data;
        // console.log("vnpay link:", paymentUrl);
        if (!paymentUrl) {
          setError("Không tạo được link thanh toán VNPay");
          setProcessing(false); // Dừng lại nếu lỗi ở đây
          return;
        }

        // 4️⃣ Chuyển hướng đến VNPay
        window.location.href = paymentUrl;
      } else {
        setError("Tạo payment thất bại");
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      setError(
        error.response?.data?.message || "Có lỗi xảy ra khi xử lý thanh toán"
      );
    } finally {
      setProcessing(false);
    }
  };

  const formatDescription = (text) => {
    if (!text) return "";
    return text.replace(/\\n/g, "\n"); // đổi "\\n" thành xuống dòng thật
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
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Thông tin gói dịch vụ
              </h2>

              {subscription && (
                <div className="space-y-6">
                  {/* TÊN GÓI */}
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-1">
                      Tên gói
                    </h3>
                    <p className="text-xl font-semibold text-gray-900">
                      {subscription.name}
                    </p>
                  </div>

                  {/* GIÁ */}
                  <div>
                    <h3 className="text-3xl font-semibold text-gray-900 mb-1">
                      Giá
                    </h3>
                    <p className="text-2xl font-bold text-blue-600">
                      {subscription.price
                        ? `${subscription.price.toLocaleString("vi-VN")} VNĐ`
                        : "Liên hệ"}
                    </p>
                  </div>

                  {/* PHÍ PHỤ THU */}
                  {subscription.extraFee && (
                    <div>
                      <h3 className="text-2xl font-semibold text-gray-900 mb-1">
                        Phí phụ thu
                      </h3>
                      <p className="text-xl font-semibold text-gray-900">
                        {subscription.extraFee.toLocaleString("vi-VN")} VNĐ
                      </p>
                    </div>
                  )}

                  {/* MÔ TẢ */}
                  {subscription.description && (
                    <div>
                      <h3 className="text-2xl font-semibold text-gray-900 mb-1">
                        Mô tả
                      </h3>
                      <div className="text-xl text-gray-700 whitespace-pre-line">
                        {formatDescription(subscription.description)}
                      </div>
                    </div>
                  )}

                  {/* THỜI HẠN */}
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-1">
                      Thời hạn
                    </h3>
                    <p className="text-xl font-semibold text-gray-900">
                      {subscription.durationPackage} ngày
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Tóm tắt đơn hàng
              </h2>

              {subscription && (
                <div className="space-y-4 mb-6">
                  {/* GÓI DỊCH VỤ (1 dòng) */}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 whitespace-nowrap">
                      Gói dịch vụ:
                    </span>
                    <span className="font-semibold text-gray-900 whitespace-nowrap">
                      {subscription.name}
                    </span>
                  </div>

                  {/* GIÁ */}
                  <div className="flex justify-between">
                    <span className="text-gray-600 whitespace-nowrap">
                      Giá gói:{" "}
                    </span>
                    <span className="font-semibold text-gray-900 whitespace-nowrap">
                      {subscription.price
                        ? `${subscription.price.toLocaleString("vi-VN")} VNĐ`
                        : "Liên hệ"}
                    </span>
                  </div>

                  {/* PHÍ PHỤ THU */}
                  {subscription.extraFee && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 whitespace-nowrap">
                        Phí phụ thu:
                      </span>
                      <span className="font-semibold text-gray-900 whitespace-nowrap">
                        {subscription.extraFee.toLocaleString("vi-VN")} VNĐ
                      </span>
                    </div>
                  )}

                  {/* TỔNG CỘNG */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between">
                      <span className="text-lg font-bold text-gray-900">
                        Tổng cộng
                      </span>
                      <span className="text-lg font-bold text-blue-600">
                        {subscription.price
                          ? `${(
                              subscription.price + (subscription.extraFee || 0)
                            ).toLocaleString("vi-VN")} VNĐ`
                          : "Liên hệ"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* ERROR BOX */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xl text-red-600">{error}</p>
                </div>
              )}

              {/* BUTTON THANH TOÁN */}
              <button
                onClick={handlePayment}
                disabled={processing || !subscription}
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

              <p className="text-xl text-gray-500 text-center mt-4 flex items-center justify-center gap-1">
                <Banknote className="w-3 h-3" />
                Thanh toán bằng tiền mặt khi nhận dịch vụ tại trạm
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
