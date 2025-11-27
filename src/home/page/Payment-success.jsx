import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import paymentService from "@/api/paymentService";
import { notifySuccess, notifyError } from "@/components/notification/notification";

const SuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("Đang xử lý kết quả thanh toán...");

  // VNPay callback sẽ trả về các query params: vnp_Amount, vnp_TxnRef, vnp_ResponseCode, etc.
  const vnp_ResponseCode = searchParams.get("vnp_ResponseCode");
  const vnp_TxnRef = searchParams.get("vnp_TxnRef"); // paymentId từ VNPay

  useEffect(() => {
    const processPaymentSuccess = async () => {
      try {
        // 1. Kiểm tra response code từ VNPay
        if (vnp_ResponseCode !== "00") {
          setMessage("Thanh toán không thành công. Đang chuyển hướng...");
          setTimeout(() => navigate("/payment-failed"), 2000);
          return;
        }

        if (!vnp_TxnRef) {
          setMessage("Thiếu thông tin thanh toán. Đang chuyển hướng...");
          setTimeout(() => navigate("/"), 2000);
          return;
        }

        // 2. Lấy paymentId từ vnp_TxnRef (hoặc từ query params khác tùy BE)
        const paymentId = vnp_TxnRef;

        // 3. Update Payment.Status = "Successful"
        // BE sẽ tự động xử lý:
        // - Gắn Subscription.AccountId = payment.AccountId
        // - Set Subscription.StartDate = Now
        // - Set Subscription.EndDate = Now + DurationPackage
        // - Set RemainingSwaps theo loại gói
        // - Set Subscription.IsActive = true
        await paymentService.updatePayment(paymentId, {
          status: "Successful",
        });

        setMessage("Thanh toán thành công! Gói subscription đã được kích hoạt.");
        notifySuccess("Thanh toán thành công! Gói subscription đã được kích hoạt.");

        // 4. Nếu có transactionId (từ booking flow), xử lý swapping
        const transactionId = sessionStorage.getItem("transactionId");
        if (transactionId) {
          try {
            const res = await axios.get(
              `http://localhost:5204/api/Swapping/GetSwappingById?transactionId=${transactionId}`
            );
            const tx = res.data.data;

            if (tx) {
              await axios.put("http://localhost:5204/api/Swapping/UpdateSwapping", {
                transactionId: tx.transactionId,
                notes: tx.notes,
                staffId: tx.staffId,
                oldBatteryId: tx.oldBatteryId,
                vehicleId: tx.vehicleId,
                newBatteryId: tx.newBatteryId,
                status: "Finish",
                createDate: tx.createDate,
              });
            }
          } catch (swapError) {
            console.warn("Could not update swapping transaction:", swapError);
            // Không block flow nếu không update được swapping
          }
          sessionStorage.removeItem("transactionId");
        }

        // 5. Redirect sau 2 giây
        setTimeout(() => {
          navigate("/userPage/subscriptions");
        }, 2000);
      } catch (err) {
        console.error("Error processing payment success:", err);
        setMessage("Có lỗi xảy ra. Đang chuyển hướng...");
        notifyError("Có lỗi xảy ra khi xử lý thanh toán!");
        setTimeout(() => navigate("/"), 2000);
      }
    };

    processPaymentSuccess();
  }, [vnp_ResponseCode, vnp_TxnRef, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Đang xử lý...
        </h2>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
};

export default SuccessPage;
