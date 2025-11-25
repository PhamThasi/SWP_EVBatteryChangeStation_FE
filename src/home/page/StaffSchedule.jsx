import React, { useEffect, useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay } from "date-fns";
import parseISO from "date-fns/parseISO";
import "../components/AdminStyle.css";
import { formatDateTime } from "@/utils/dateFormat";
import { notifySuccess, notifyError } from "@/components/notification/notification";
import bookingService from "@/api/bookingService";
import swappingService from "@/api/swappingService";
import batteryService from "@/api/batteryService";
import tokenUtils from "@/utils/tokenUtils";
import authService from "@/api/authService";
import carService from "@/api/carService";
import stationSevice from "@/api/stationService";

const locales = { "en-US": undefined };
const localizer = dateFnsLocalizer({
  format,
  parse: (value, formatString) => parse(value, formatString, new Date()),
  startOfWeek,
  getDay,
  locales,
});


const SchedulePage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [stations, setStations] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [cars, setCars] = useState([]);
  const [accountInput, setAccountInput] = useState("");

    const [formData, setFormData] = useState({
    dateTime: "",
    notes: "Battery transfer",
    status: true,
    isApproved: "Pending",
    createdDate: new Date().toISOString(),
    stationId: "",
    vehicleId: "",
    accountId: "",
  });
  const [isCreating, setIsCreating] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [gridDate, setGridDate] = useState(null);
  const [gridEvents, setGridEvents] = useState([]);
  
  const handleShowMore = (dayEvents, date) => {
    setGridEvents(dayEvents);
    setGridDate(date);
    setShowGrid(true);
  };
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const result = await bookingService.staffBookingsSchedule();
      const data = result?.data || [];

      const formattedEvents = data.map((b) => {
        // Xác định màu sắc dựa trên isApproved
        const isApprovedStatus = (b.isApproved || "Pending").toLowerCase();
        let backgroundColor = "#2d89ef"; // Mặc định: xanh dương (Pending)
        
        switch (isApprovedStatus) {
          case "approved":
            backgroundColor = "#22c55e"; // Xanh lá
            break;
          case "rejected":
            backgroundColor = "#ef4444"; // Đỏ
            break;
          case "canceled":
            backgroundColor = "#6b7280"; // Xám
            break;
          default:
            backgroundColor = "#2d89ef"; // Xanh dương (Pending)
        }

        return {
          id: b.bookingId,
          title: b.notes || `Booking #${b.bookingId}`,
          start: parseISO(b.dateTime),
          end: parseISO(b.dateTime),
          allDay: false,
          resource: { ...b },
          backgroundColor: backgroundColor,
        };
      });
      setEvents(formattedEvents);
    } catch (err) {
      setError(err.message);
      notifyError("Không thể tải danh sách booking!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {    
    fetchBookings();
  }, []);
  const handleCreateBooking = async (e) => {
    e.preventDefault();
    try {
      const selectedDate = new Date(formData.dateTime);
      if (isNaN(selectedDate.getTime()) || selectedDate <= new Date()) {
        notifyError("Thời gian đặt lịch phải ở tương lai!");
        return;
      }
      if (!formData.accountId) {
        notifyError("Vui lòng chọn tài khoản khách hàng hợp lệ!");
        return;
      }

      await bookingService.createBooking({
        dateTime: selectedDate.toISOString(),
        notes: formData.notes || "Battery transfer",
        stationId: formData.stationId,
        vehicleId: formData.vehicleId,
        accountId: formData.accountId,
        isApproved: formData.isApproved || "Pending",
      });
      
      notifySuccess("Tạo booking thành công!");
      await fetchBookings();
      setIsCreating(false);
      setFormData({
        dateTime: "",
        notes: "Battery transfer",
        status: true,
        isApproved: "Pending",
        createdDate: new Date().toISOString(),
        stationId: "",
        vehicleId: "",
        accountId: "",
      });
      setAccountInput("");
    } catch (err) {
      console.error("Error creating booking:", err);
      notifyError("Tạo booking thất bại!");
    }
  };
  // Approve booking - chỉ cho phép khi isApproved == "Pending"
  const handleApproveBooking = async () => {
    if (selectedBooking.isApproved !== "Pending") {
      notifyError("Chỉ có thể duyệt booking đang ở trạng thái Pending!");
      return;
    }

    try {
      // Cập nhật booking thành "Approved"
      const updatedBooking = {
        ...selectedBooking,
        isApproved: "Approved",
        createdDate: selectedBooking.createdDate || new Date().toISOString(),
      };

      await bookingService.updateBooking(selectedBooking.bookingId, updatedBooking);
      notifySuccess("Đã duyệt booking!");

      // Tạo swapping transaction sau khi approve - sử dụng helper function
      try {
        // Lấy staffId từ token
        const userData = tokenUtils.getUserData();
        const staffId = userData?.accountId;
        
        if (!staffId) {
          notifyError("Không thể lấy thông tin nhân viên!");
          return;
        }

        // Sử dụng hàm helper để tự động lấy thông tin từ booking và tạo swapping
        const swapResult = await swappingService.createSwappingFromBooking(
          selectedBooking,
          staffId,
          {
            notes: `Đổi pin cho booking ${selectedBooking.bookingId}`,
            status: "Pending",
            createDate: selectedBooking.dateTime || new Date().toISOString(),
          }
        );

        notifySuccess(`Đã tạo giao dịch đổi pin thành công với pin loại ${swapResult.carData.batteryType}!`);
      } catch (swappingError) {
        console.error("Error creating swapping:", swappingError);
        notifyError("Cập nhật booking thành công nhưng không thể tạo giao dịch đổi pin!");
      }

      setModalOpen(false);
      await fetchBookings(); // Refresh danh sách để cập nhật màu
    } catch (err) {
      console.error("Error approving booking:", err);
      notifyError("Duyệt booking thất bại!");
    }
  };

  // Reject booking - chỉ cho phép khi isApproved == "Pending"
  const handleRejectBooking = async () => {
    if (selectedBooking.isApproved !== "Pending") {
      notifyError("Chỉ có thể từ chối booking đang ở trạng thái Pending!");
      return;
    }

    try {
      const updatedBooking = {
        ...selectedBooking,
        isApproved: "Rejected",
        createdDate: selectedBooking.createdDate || new Date().toISOString(),
      };

      await bookingService.updateBooking(selectedBooking.bookingId, updatedBooking);
      notifySuccess("Đã từ chối booking!");
      setModalOpen(false);
      await fetchBookings(); // Refresh danh sách để cập nhật màu
    } catch (err) {
      console.error("Error rejecting booking:", err);
      notifyError("Từ chối booking thất bại!");
    }
  };

  // Update booking (cho các trường hợp khác)
  const handleUpdateBooking = async () => {
    try {
      const updatedBooking = {
        ...selectedBooking,
        isApproved: selectedBooking.isApproved || "Pending",
        createdDate: selectedBooking.createdDate || new Date().toISOString(),
      };

      await bookingService.updateBooking(selectedBooking.bookingId, updatedBooking);
      notifySuccess("Cập nhật booking thành công!");
      setModalOpen(false);
      await fetchBookings();
    } catch (err) {
      console.error("Error updating booking:", err);
      notifyError("Cập nhật booking thất bại!");
    }
  };

  // Handle swap battery - chỉ cho phép khi booking đã được approve
  const handleSwapBattery = async () => {
    try {
      const userData = tokenUtils.getUserData();
      const staffId = userData?.accountId;

      if (!staffId) {
        notifyError("Không thể lấy thông tin nhân viên!");
        return;
      }

      // Kiểm tra booking phải ở trạng thái "Approved"
      if (selectedBooking.isApproved !== "Approved") {
        notifyError("Chỉ có thể đổi pin khi booking đã được xác nhận (Approved)!");
        return;
      }

      // 1. Tìm swapping transaction đã tồn tại (được tạo khi approve)
      const allSwappings = await swappingService.getAllSwapping();
      const existingSwapping = allSwappings.find(
        (s) =>
          s.vehicleId === selectedBooking.vehicleId &&
          s.createDate === selectedBooking.dateTime
      );

      if (!existingSwapping) {
        notifyError("Không tìm thấy giao dịch đổi pin! Vui lòng kiểm tra lại.");
        return;
      }

      // 2. Cập nhật swapping status thành "Finish"
      await swappingService.updateSwapping({
        ...existingSwapping,
        status: "Finish",
        stationId: selectedBooking.stationId,
      });

      // 3. Cập nhật pin thành used (status = false) để trigger -1 pin
      if (existingSwapping.newBatteryId) {
        try {
          const battery = await batteryService.getBatteryById(existingSwapping.newBatteryId);
          if (battery) {
            await batteryService.updateBattery(existingSwapping.newBatteryId, {
              ...battery,
              status: false,
              lastUsed: new Date().toISOString(),
            });
          }
        } catch (batteryError) {
          console.warn("Could not update battery status:", batteryError);
          // Không block flow nếu không update được battery
        }
      }

      // 4. Cập nhật booking → Swapped
      await bookingService.updateBooking(selectedBooking.bookingId, {
        ...selectedBooking,
        isApproved: "Swapped",
        createdDate: selectedBooking.createdDate || new Date().toISOString(),
      });

      notifySuccess("Đổi pin thành công!");
      setModalOpen(false);
      fetchBookings();
    } catch (err) {
      console.error(err);
      notifyError("Lỗi đổi pin!");
    }
  };

  const accountLabel = useMemo(
    () => (account) =>
      `${account.fullName || account.accountName || "Unknown"}${
        account.email ? ` (${account.email})` : ""
      }`,
    []
  );

  const handleAccountInputChange = (value) => {
    setAccountInput(value);
    const matchedAccount = accounts.find(
      (acc) => accountLabel(acc).toLowerCase() === value.toLowerCase()
    );
    setFormData((prev) => ({
      ...prev,
      accountId: matchedAccount?.accountId || "",
    }));
  };

  const normalizeArray = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data?.data)) return payload.data.data;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
  };

  const _handleOpenCreateModal = async () => {
    setIsCreating(true);
    try {
      const [stationRes, accountRes, carRes] = await Promise.all([
        stationSevice.getStationList(),
        authService.getAll(),
        carService.getAllCars(),
      ]);

      setStations(normalizeArray(stationRes));
      setAccounts(normalizeArray(accountRes));
      setCars(normalizeArray(carRes));
    } catch (err) {
      console.error("Failed to fetch data for booking form:", err);
      setStations([]);
      setAccounts([]);
      setCars([]);
    }
  };


  const handleEventClick = async (event) => {
    try {
      const bookingResult = await bookingService.getBookingById(event.id);
      const bookingData = bookingResult?.data;

      if (!bookingData) throw new Error("Failed to fetch booking details");

      // Fetch car, station, and owner in parallel
      const [carRes, stationRes, ownerRes] = await Promise.all([
        fetch(`http://localhost:5204/api/Car/GetCarById?carId=${bookingData.vehicleId}`),
        fetch(`http://localhost:5204/api/Station/Select/${bookingData.stationId}`),
        fetch(`http://localhost:5204/api/Car/GetOwnerByCarIdAsync?carId=${bookingData.vehicleId}`),
      ]);

      if (!carRes.ok || !stationRes.ok || !ownerRes.ok)
        throw new Error("Failed to fetch related data");

      const carData = (await carRes.json()).data;
      const stationData = (await stationRes.json()).data;
      const ownerData = (await ownerRes.json()).data;

      // Combine all data for modal
      setSelectedBooking({
        ...bookingData,
        carModel: carData?.model || "Unknown",
        stationName: stationData?.address || `Station #${bookingData.stationId}`,
        stationId: bookingData.stationId,
        customerName: ownerData?.fullName || "Unknown Customer",
      });

      setModalOpen(true);
    } catch (err) {
      console.error(err);
      notifyError("Không thể tải chi tiết booking!");
    }
  };


  if (loading) return <p>Đang tải danh sách lịch hẹn...</p>;
  if (error) return <p>Lỗi: {error}</p>;

  return (
    <div className="admin-dashboard">
      <h2 className="dashboard-title">
        Lịch đặt lịch đổi pin
      </h2>
      {/* <button className="save-btn" onClick={handleOpenCreateModal}>+ Tạo lịch hẹn</button> */}
      {showGrid ? (
    <div className="event-box-view">
      <button className="cancel-btn" onClick={() => setShowGrid(false)}>← Back to Calendar</button>
      <h3>Events on {gridDate.toDateString()}</h3>
      <div className="grid-container">
        {gridEvents.map((e, i) => (
          <div key={i} className="event-item" onClick={() => handleEventClick(e)}>
            <h4>{e.title}</h4>
            <p>{e.start.toLocaleTimeString()} - {e.end.toLocaleTimeString()}</p>
          </div>
        ))}
      </div>
    </div>
  ) : (
    <div className="calendar-container">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        defaultView="month"
        views={["month"]}
        style={{ height: "70vh" }}
        eventPropGetter={(event) => ({
          style: {
            backgroundColor: event.backgroundColor || "#2d89ef",
            borderRadius: "5px",
            color: "white",
            border: "none",
            padding: "2px",
          },
        })}
        onSelectEvent={handleEventClick}
        onShowMore={handleShowMore}
      />
    </div>)}
  

      {modalOpen && selectedBooking && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Chi tiết lịch hẹn</h2>
            <p><strong>Khách hàng:</strong> {selectedBooking.customerName}</p>
            <p><strong>Trạm:</strong> {selectedBooking.stationName}</p>
            <p><strong>Xe:</strong> {selectedBooking.carModel}</p>
            <p><strong>Thời gian:</strong> {formatDateTime(selectedBooking.dateTime)}</p>
            <p><strong>Ghi chú:</strong> {selectedBooking.notes || "Không có"}</p>
            
            <label>Trạng thái (isApproved)</label>
            <select
              value={selectedBooking.isApproved || "Pending"}
              onChange={(e) =>
                setSelectedBooking({ ...selectedBooking, isApproved: e.target.value })
              }
              className="modal-select"
              disabled={selectedBooking.isApproved !== "Pending"}
            >
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Canceled">Canceled</option>
            </select>
            <div className="modal-actions">
              {/* Chỉ hiển thị nút Duyệt/Từ chối khi booking đang ở trạng thái Pending */}
              {selectedBooking.isApproved === "Pending" && (
                <>
                  <button className="save-btn" onClick={handleApproveBooking}>
                    ✓ Duyệt
                  </button>
                  <button className="delete-btn" onClick={handleRejectBooking}>
                    ✕ Từ chối
                  </button>
                </>
              )}
              {/* Nút Đổi pin khi booking đã được approve */}
              {selectedBooking.isApproved === "Approved" && (
                <button className="save-btn" onClick={handleSwapBattery}>
                  🔋 Đổi pin
                </button>
              )}
              {/* Nút Update cho các trường hợp khác */}
              {selectedBooking.isApproved !== "Pending" && selectedBooking.isApproved !== "Approved" && (
                <button className="batupdate-btn" onClick={handleUpdateBooking}>
                  Cập nhật lịch
                </button>
              )}
              <button className="cancel-btn" onClick={() => setModalOpen(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {isCreating && (
        <div className="modal-overlay" onClick={() => setIsCreating(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create Booking</h2>
            <form className="modal-form" onSubmit={handleCreateBooking}>
              <label>Ngày giờ</label>
              <input
                type="datetime-local"
                value={formData.dateTime}
                onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                min={new Date(Date.now() + 60 * 1000).toISOString().slice(0, 16)}
                required
              />
              {/* Account search + select */}
              <label>Tài khoản khách hàng</label>
              <input
                type="text"
                placeholder="Gõ để tìm khách hàng"
                list="account-options"
                value={accountInput}
                onChange={(e) => handleAccountInputChange(e.target.value)}
                required
              />
              <datalist id="account-options">
                {accounts.map((acc) => (
                  <option key={acc.accountId} value={accountLabel(acc)} />
                ))}
              </datalist>
              <small className="helper-text">
                Chọn khách hàng từ danh sách hoặc gõ để lọc.
              </small>

              {/* Car selection */}
              <label>Xe</label>
              <select
                value={formData.vehicleId}
                onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                required
              >
                <option value="">Chọn xe</option>
                {cars.map((car) => (
                  <option key={car.vehicleId} value={car.vehicleId}>
                    {car.model}
                  </option>
                ))}
              </select>
              
              {/* Station selection */}
              <label>Trạm</label>
              <select
                value={formData.stationId}
                onChange={(e) => setFormData({ ...formData, stationId: e.target.value })}
                required
              >
                <option value="">Chọn trạm</option>
                {stations.map((station) => (
                  <option key={station.stationId} value={station.stationId}>
                    {station.address}
                  </option>
                ))}
              </select>
              

              <label>Ghi chú</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
              <label>Trạng thái (isApproved)</label>
              <select
                value={formData.isApproved}
                onChange={(e) => setFormData({ ...formData, isApproved: e.target.value })}
                required
              >
                <option value="Pending">Chờ duyệt</option>
                <option value="Approved">Đã duyệt</option>
                <option value="Rejected">Từ chối</option>
                <option value="Canceled">Hủy</option>
              </select>

              <div className="modal-actions">
                <button type="submit" className="save-btn">Lưu</button>
                <button type="button" className="cancel-btn" onClick={() => setIsCreating(false)}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default SchedulePage;
