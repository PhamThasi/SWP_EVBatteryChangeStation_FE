import React, { useEffect, useMemo, useState } from "react";
import bookingService from "@/api/bookingService";
import carService from "@/api/carService";
import axiosClient from "@/api/axiosClient";
import { notifyWarning, notifySuccess } from "@/components/notification/notification";



const BookingForm = ({ onSuccess, onCancel }) => {
  // Form state được gộp thành 1 object
  const [bookingForm, setBookingForm] = useState({
    accountId: "",
    vehicleId: "",
    stationId: "",
    dateTime: "",
    notes: "",
  });
  const [cars, setCars] = useState([]);
  const [stations, setStations] = useState([]);
  const [submitting, setSubmitting] = useState(false);

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
          setBookingForm((prev) => ({ ...prev, stationId: mappedStations[0].id }));
        }
      } catch (e) {
        console.error("Load stations error", e);
        setStations([]);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canSubmit = useMemo(() => {
    return bookingForm.accountId && bookingForm.vehicleId && bookingForm.stationId && bookingForm.dateTime;
  }, [bookingForm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) {
      notifyWarning("Vui lòng điền đầy đủ thông tin bắt buộc.");
      return;
    }
    try {
      setSubmitting(true);
      // Chỉ tạo booking, không tạo swapping ngay
      // Swapping sẽ được tạo khi staff approve booking
      await bookingService.createBooking({
        dateTime: bookingForm.dateTime,
        notes: bookingForm.notes,
        stationId: bookingForm.stationId,
        vehicleId: bookingForm.vehicleId,
        accountId: bookingForm.accountId,
      });

      notifySuccess("Đặt lịch thành công! Vui lòng chờ staff xác nhận.");
      if (onSuccess) onSuccess();
    } catch (e) {
      console.error("Booking error:", e);
      notifyWarning("Không thể tạo đặt lịch. Vui lòng thử lại!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="hidden"
        name="accountId"
        value={bookingForm.accountId}
        readOnly
      />

      <div>
        <label className="block text-sm font-medium mb-1 text-[#001f54]">Chọn xe</label>
        <select
          className="border p-2 rounded-lg w-full"
          value={bookingForm.vehicleId}
          onChange={(e) => updateField({ vehicleId: e.target.value })}
        >
          {cars.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-[#001f54]">Chọn địa chỉ trạm</label>
        <select
          className="border p-2 rounded-lg w-full"
          value={bookingForm.stationId}
          onChange={(e) => updateField({ stationId: e.target.value })}
        >
          {stations.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-[#001f54]">Ngày giờ</label>
        <input
          className="border p-2 rounded-lg w-full"
          type="datetime-local"
          value={bookingForm.dateTime}
          onChange={(e) => updateField({ dateTime: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-[#001f54]">Ghi chú</label>
        <textarea
          className="border p-2 rounded-lg w-full"
          rows={3}
          value={bookingForm.notes}
          onChange={(e) => updateField({ notes: e.target.value })}
          placeholder="Ghi chú thêm..."
        />
      </div>

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


