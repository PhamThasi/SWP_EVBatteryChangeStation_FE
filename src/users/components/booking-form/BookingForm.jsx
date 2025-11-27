import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import bookingService from "@/api/bookingService";
import carService from "@/api/carService";
import batteryService from "@/api/batteryService";
import paymentService from "@/api/paymentService";
import axiosClient from "@/api/axiosClient";
import {
  notifyWarning,
  notifySuccess,
  notifyError,
} from "@/components/notification/notification";

const BookingForm = ({ onSuccess, onCancel }) => {
  const navigate = useNavigate();
  // Form state được gộp thành 1 object
  const [bookingForm, setBookingForm] = useState({
    accountId: "",
    vehicleId: "",
    stationId: "",
    dateTime: "",
    notes: "Battery transfer",
  });
  const [cars, setCars] = useState([]);
  const [stations, setStations] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [batteryPreview, setBatteryPreview] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Hàm update field riêng lẻ
  const updateField = (field) => {
    setBookingForm((prev) => ({ ...prev, ...field }));
  };

  const decodeAccountIdFromToken = () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return "";
      const payload = token.split(".")[1];
      const json = JSON.parse(
        atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
      );
      return json?.accountId || json?.AccountId || json?.sub || "";
    } catch (e) {
      console.error("Decode token error", e);
      return "";
    }
  };

  useEffect(() => {
    // Decode accountId từ JWT token
    const accountId = decodeAccountIdFromToken();
    setBookingForm((prev) => ({ ...prev, accountId }));
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const list = await carService.getAllCars();
        const mapped = (list || []).map((c) => ({
          id: c.vehicleId,
          label: c.model,
        }));
        setCars(mapped);
        // Set vehicle mặc định nếu chưa có
        if (mapped.length > 0 && !bookingForm.vehicleId) {
          setBookingForm((prev) => ({ ...prev, vehicleId: mapped[0].id }));
        }
      } catch (e) {
        console.error("Load cars error", e);
        setCars([]);
      }
      try {
        const res = await axiosClient.get("/Station/SelectAll");
        const stationList = res?.data?.data || [];
        const mappedStations = stationList.map((s) => ({
          id: s.stationId,
          label: s.address || s.stationName || s.accountName,
        }));
        setStations(mappedStations);
        // Set station mặc định nếu chưa có
        if (mappedStations.length > 0 && !bookingForm.stationId) {
          setBookingForm((prev) => ({
            ...prev,
            stationId: mappedStations[0].id,
          }));
        }
      } catch (e) {
        console.error("Load stations error", e);
        setStations([]);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Preview pin khi user chọn xe + trạm
  useEffect(() => {
    const previewBattery = async () => {
      if (!bookingForm.vehicleId || !bookingForm.stationId) {
        setBatteryPreview(null);
        return;
      }

      setLoadingPreview(true);
      try {
        const response = await batteryService.previewForBooking(
          bookingForm.stationId,
          bookingForm.vehicleId
        );
        
        if (response?.status === 200 && response?.data?.isAvailable === true) {
          setBatteryPreview(response.data);
        } else {
          setBatteryPreview(null);
        }
      } catch (error) {
        // Nếu 404 → không có pin phù hợp
        if (error?.response?.status === 404) {
          setBatteryPreview(null);
        } else {
          console.error("Error previewing battery:", error);
          setBatteryPreview(null);
        }
      } finally {
        setLoadingPreview(false);
      }
    };

    // Debounce để tránh gọi API quá nhiều khi user đang chọn
    const timer = setTimeout(() => {
      previewBattery();
    }, 500);

    return () => clearTimeout(timer);
  }, [bookingForm.vehicleId, bookingForm.stationId]);

  const canSubmit = useMemo(() => {
    return (
      bookingForm.accountId &&
      bookingForm.vehicleId &&
      bookingForm.stationId &&
      bookingForm.dateTime
    );
  }, [bookingForm]);

  // Kiểm tra subscription trước khi tạo booking - dùng API mới
  const checkSubscription = async () => {
    try {
      const accountId = bookingForm.accountId || decodeAccountIdFromToken();
      
      if (!accountId) {
        return { hasActive: false, reason: "Không lấy được accountId", needsRedirect: true };
      }

      // Gọi API check-subscription-status
      const response = await paymentService.checkSubscriptionStatus(accountId);
      const statusData = response?.data;

      if (statusData?.hasActiveSubscription === true && statusData?.needsRedirect === false) {
        return { 
          hasActive: true, 
          subscription: statusData.payment,
          needsRedirect: false 
        };
      } else {
        return {
          hasActive: false,
          reason: "Chưa có gói subscription active",
          needsRedirect: statusData?.needsRedirect === true,
        };
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
      return { 
        hasActive: false, 
        reason: "Lỗi kiểm tra subscription",
        needsRedirect: true 
      };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) {
      notifyWarning("Vui lòng điền đầy đủ thông tin bắt buộc.");
      return;
    }

    // Kiểm tra preview pin
    if (!batteryPreview || batteryPreview.isAvailable !== true) {
      notifyWarning(
        "Trạm này không có pin phù hợp với xe, hãy chọn trạm/xe khác!"
      );
      return;
    }

    try {
      setSubmitting(true);

      // 1. Kiểm tra subscription
      const subscriptionCheck = await checkSubscription();
      if (!subscriptionCheck.hasActive) {
        notifyWarning(
          `Bạn ${subscriptionCheck.reason}. Vui lòng đăng ký gói trước khi đặt lịch!`
        );
        // Navigate đến trang subscriptions nếu needsRedirect = true
        if (subscriptionCheck.needsRedirect) {
          navigate("/userPage/subscriptions", {
            state: { fromBooking: true, bookingData: bookingForm },
          });
        }
        return;
      }

      // 2. Tạo booking (BE sẽ tự gán batteryId trong TryAssignBatteryAsync)
      await bookingService.createBooking({
        dateTime: bookingForm.dateTime,
        notes: bookingForm.notes,
        stationId: bookingForm.stationId,
        vehicleId: bookingForm.vehicleId,
        accountId: bookingForm.accountId,
        // batteryId: để trống, BE sẽ tự chọn
      });

      notifySuccess("Đặt lịch thành công! Vui lòng chờ staff xác nhận.");
      if (onSuccess) onSuccess();
      
      // Có thể navigate đến trang lịch sử booking
      // navigate("/userPage/history-swaping");
    } catch (e) {
      console.error("Booking error:", e);
      const errorMsg =
        e?.response?.data?.message ||
        "Không thể tạo đặt lịch. Vui lòng thử lại!";
      notifyError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        {/* <label className="block text-sm font-medium mb-1 text-[#001f54]">Tài khoản</label> */}
        {/* <input
          className="border p-2 rounded-lg w-full bg-gray-100"
          type="text"
          value={bookingForm.accountId}
          disabled
        /> */}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-[#001f54]">
          Chọn xe
        </label>
        <select
          className="border p-2 rounded-lg w-full"
          value={bookingForm.vehicleId}
          onChange={(e) => updateField({ vehicleId: e.target.value })}
        >
          {cars.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-[#001f54]">
          Chọn địa chỉ trạm
        </label>
        <select
          className="border p-2 rounded-lg w-full"
          value={bookingForm.stationId}
          onChange={(e) => updateField({ stationId: e.target.value })}
        >
          {stations.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-[#001f54]">
          Ngày giờ
        </label>
        <input
          className="border p-2 rounded-lg w-full"
          type="datetime-local"
          value={bookingForm.dateTime}
          onChange={(e) => updateField({ dateTime: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-[#001f54]">
          Ghi chú
        </label>
        <textarea
          className="border p-2 rounded-lg w-full"
          rows={3}
          value={bookingForm.notes}
          onChange={(e) => updateField({ notes: e.target.value })}
          placeholder="Ghi chú thêm..."
        />
      </div>

      {/* Preview Pin Section */}
      {bookingForm.vehicleId && bookingForm.stationId && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="text-sm font-semibold mb-2 text-[#001f54]">
            Thông tin pin sẽ được gán
          </h3>
          {loadingPreview ? (
            <p className="text-sm text-gray-500">Đang kiểm tra...</p>
          ) : batteryPreview && batteryPreview.isAvailable ? (
            <div className="space-y-1 text-sm">
              <p>
                <span className="font-medium">Loại pin:</span>{" "}
                {batteryPreview.batteryType || "N/A"}
              </p>
              <p>
                <span className="font-medium">Trạng thái:</span>{" "}
                <span className="text-green-600">Có sẵn</span>
              </p>
              {batteryPreview.batteryId && (
                <p className="text-xs text-gray-500">
                  Pin ID: {batteryPreview.batteryId}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-red-600">
              ⚠️ Trạm này không có pin phù hợp với xe, hãy chọn trạm/xe khác!
            </p>
          )}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            className="px-4 py-2 bg-gray-200 rounded-xl hover:bg-gray-300"
            onClick={onCancel}
          >
            Hủy
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 bg-[#00b894] text-white rounded-xl hover:bg-[#009874] disabled:opacity-60"
          disabled={!canSubmit || submitting}
        >
          {submitting ? "Đang gửi..." : "Xác nhận"}
        </button>
      </div>
    </form>
  );
};

export default BookingForm;
