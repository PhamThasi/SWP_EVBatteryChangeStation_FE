import React, { useEffect, useMemo, useState } from "react";
import bookingService from "@/api/bookingService";
import carService from "@/api/carService";
import axiosClient from "@/api/axiosClient";
import { useNavigate } from "react-router-dom";



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

  const navigate = useNavigate();

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
          label: s.accountName || s.stationName || s.address,
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
      await bookingService.createBooking({
        dateTime: bookingForm.dateTime,
        notes: bookingForm.notes,
        stationId: bookingForm.stationId,
        vehicleId: bookingForm.vehicleId,
        accountId: bookingForm.accountId,
      });
       // Wait briefly in case DB persistence is async
      await new Promise((r) => setTimeout(r, 500));

      // 2. Fetch user's bookings and get the latest one
      const resBooking = await fetch(
        `http://localhost:5204/api/Booking/User/${bookingForm.accountId}`
      );
      const bookingData = await resBooking.json();
      const latestBooking = bookingData.data?.[bookingData.data.length - 1];
      if (!latestBooking) throw new Error("Không tìm thấy dữ liệu đặt lịch.");

      const { vehicleId, dateTime, notes } = latestBooking;
      const createDate = dateTime;
      

      // 3. Get random staff
      const resStaff = await fetch(
        "http://localhost:5204/api/Account/GetAllStaffAccount"
      );
      const staffData = await resStaff.json();
      const staffList = staffData.data || [];
      const randomStaff =
        staffList[Math.floor(Math.random() * staffList.length)];
      const staffId = randomStaff?.accountId;

      // 4. Get random battery
      const resBattery = await fetch(
        "http://localhost:5204/api/Battery/GetAllBattery"
      );
      const batteryData = await resBattery.json();
      const batteryList = batteryData.data || [];
    const randomBattery =
      batteryList[Math.floor(Math.random() * batteryList.length)];
    const newBatteryId = randomBattery?.batteryId;

    if (!staffId || !newBatteryId)
      throw new Error("Không thể chọn staff hoặc battery.");

    // 5. Create swapping
    await fetch("http://localhost:5204/api/Swapping/CreateSwapping", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        notes: "Battery transfer",
        staffId,
        oldBatteryId: "", // can leave empty
        vehicleId,
        newBatteryId,
        status: "pending",
        createDate: createDate,
      }),
    });

    // alert("Đặt lịch và tạo swapping thành công!");
    if (onSuccess) onSuccess(); // 6️⃣ Fetch the latest swapping to get transactionId
      const resSwapping = await fetch("http://localhost:5204/api/Swapping/GetAllSwapping");
      const swappingData = await resSwapping.json();
      // 3) Find the swapping with the same createDate
      const found = swappingData.data.find(
        (s) => s.createDate === createDate
      );

      if (!found) {
        throw new Error("Không tìm thấy swapping với createDate đã dùng.");
      }

      const transactionId = found.transactionId;
      if (!transactionId) throw new Error("Không lấy được transactionId từ swapping.");

      console.log("Transaction ID from swapping:", transactionId);

      // 7️⃣ Redirect to subscription page with transactionId
      navigate("/userPage/subscriptions", { state: { transactionId } });

      if (onSuccess) onSuccess();

    } catch (e) {
      console.error("Booking or swapping error:", e);
      alert("Không thể hoàn tất đặt lịch và swapping.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium mb-1 text-[#001f54]">Tài khoản</label>
        <input
          className="border p-2 rounded-lg w-full bg-gray-100"
          type="text"
          value={bookingForm.accountId}
          disabled
        />
      </div>

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
        <label className="block text-sm font-medium mb-1 text-[#001f54]">Chọn trạm</label>
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


