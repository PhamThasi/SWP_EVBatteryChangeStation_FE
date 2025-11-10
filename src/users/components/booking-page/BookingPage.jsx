import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import BookingForm from "@/users/components/booking-form/BookingForm";
import bookingService from "@/api/bookingService";

const BookingPage = () => {
  const [bookings, setBookings] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [accountId, setAccountId] = useState("");

  const ITEMS_PER_PAGE = 5;

  // Decode accountId từ JWT token
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

  // Check if booking is expired (10 hours after scheduled time)
  const isExpired = (dateTimeString) => {
    if (!dateTimeString) return false;
    try {
      const bookingDate = new Date(dateTimeString);
      const now = new Date();
      const expiryTime = new Date(bookingDate.getTime() + 10 * 60 * 60 * 1000);
      return now > expiryTime;
    } catch {
      return false;
    }
  };

  // Dùng useMemo để xử lý và sắp xếp bookings
  const processedBookings = useMemo(() => {
    const processed = bookings.map((booking) => ({
      ...booking,
      isExpiredStatus: isExpired(booking.dateTime),
      statusDisplay: (() => {
        if (isExpired(booking.dateTime) && booking.isApproved !== "Canceled") {
          return "Hết hạn";
        }
        switch ((booking.isApproved || "Pending").toLowerCase()) {
          case "approved":
            return "Đã xác nhận";
          case "rejected":
            return "Bị từ chối";
          case "canceled":
            return "Đã hủy";
          case "pending":
          default:
            return "Chờ xác nhận";
        }
      })(),
      statusClass: (() => {
        if (isExpired(booking.dateTime) && booking.isApproved !== "Canceled") {
          return "bg-orange-100 text-orange-800 border-orange-200";
        }
        switch ((booking.isApproved || "Pending").toLowerCase()) {
          case "approved":
            return "bg-emerald-100 text-emerald-800 border-emerald-200";
          case "rejected":
          case "canceled":
            return "bg-red-100 text-red-800 border-red-200";
          case "pending":
          default:
            return "bg-gray-100 text-gray-700 border-gray-200";
        }
      })(),
      statusIcon: (() => {
        if (isExpired(booking.dateTime) && booking.isApproved !== "Canceled") {
          return "⏰";
        }
        switch ((booking.isApproved || "Pending").toLowerCase()) {
          case "approved":
            return "✓";
          case "rejected":
          case "canceled":
            return "✕";
          case "pending":
          default:
            return "…";
        }
      })(),
    }));

    processed.sort((a, b) => {
      const createdA = new Date(a.createdDate);
      const createdB = new Date(b.createdDate);
      return createdB - createdA;
    });

    return processed;
  }, [bookings]);

  // Fetch bookings
  const fetchBookings = useCallback(async () => {
    if (!accountId) return;
    try {
      setLoading(true);
      const response = await bookingService.getUserBookings(accountId);
      setBookings(response?.data || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    const accId = decodeAccountIdFromToken();
    setAccountId(accId);
  }, []);

  useEffect(() => {
    if (accountId) {
      fetchBookings();
    }
  }, [accountId, fetchBookings]);

  // Format date time
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "";
    try {
      const date = new Date(dateTimeString);
      return new Intl.DateTimeFormat("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch {
      return dateTimeString;
    }
  };

  // Format date only
  const formatDate = (dateTimeString) => {
    if (!dateTimeString) return "";
    try {
      const date = new Date(dateTimeString);
      return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(date);
    } catch {
      return dateTimeString;
    }
  };

  // Format time only
  const formatTime = (dateTimeString) => {
    if (!dateTimeString) return "";
    try {
      const date = new Date(dateTimeString);
      return new Intl.DateTimeFormat("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch {
      return dateTimeString;
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    fetchBookings();
  };

  // Pagination logic
  const totalPages = Math.ceil(processedBookings.length / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentBookings = processedBookings.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(0);
  }, [processedBookings.length]);

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  // Hàm xử lý khi nhấn nút Hủy
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy lịch đặt này?")) {
      return;
    }

    try {
      const b = bookings.find((x) => x.bookingId === bookingId);
      if (!b) throw new Error("Không tìm thấy booking");
      await bookingService.updateBooking(bookingId, {
        dateTime: b.dateTime,
        notes: b.notes,
        isApproved: "Canceled",
        createdDate: b.createdDate || new Date().toISOString(),
        stationId: b.stationId,
        vehicleId: b.vehicleId,
        accountId: b.accountId,
      });
      alert("Hủy lịch thành công!");
      fetchBookings();
    } catch (error) {
      console.error("Lỗi khi hủy booking:", error);
      alert("Hủy lịch thất bại, vui lòng thử lại.");
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 font-['Inter']">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header với nút Thêm */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-gray-900 text-5xl font-bold mb-2 flex items-center gap-3">
              <span className="text-6xl">🔋</span>
              Lịch Đổi Pin
            </h1>
            <p className="text-gray-600 text-xl">Quản lý lịch đặt đổi pin xe điện của bạn</p>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <span className="text-2xl">+</span>
            <span className="text-xl">Đặt lịch mới</span>
          </button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xl font-medium">Tổng lịch đặt</p>
                <p className="text-4xl font-bold text-gray-900 mt-1">{bookings.length}</p>
              </div>
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-4xl">📋</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xl font-medium">Đang hoạt động</p>
                <p className="text-4xl font-bold text-emerald-600 mt-1">
                  {bookings.filter(b => b.status && !isExpired(b.dateTime)).length}
                </p>
              </div>
              <div className="w-16 h-16 bg-emerald-100 rounded-xl flex items-center justify-center">
                <span className="text-4xl">✓</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xl font-medium">Đã hết hạn</p>
                <p className="text-4xl font-bold text-orange-600 mt-1">
                  {bookings.filter(b => isExpired(b.dateTime)).length}
                </p>
              </div>
              <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center">
                <span className="text-4xl">⏰</span>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Cards Grid */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center border border-gray-100">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-gray-600 text-2xl">Đang tải dữ liệu...</p>
            </div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center border border-gray-100">
            <div className="flex flex-col items-center gap-4">
              <span className="text-9xl">📭</span>
              <p className="text-gray-600 text-2xl font-medium mb-2">
                Chưa có lịch đặt nào
              </p>
              <p className="text-gray-500 text-xl mb-6">
                Tạo lịch đặt đầu tiên để bắt đầu sử dụng dịch vụ
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xl px-8 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg"
              >
                + Tạo đặt lịch mới
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {currentBookings.map((booking) => (
                <div
                  key={booking.bookingId}
                  className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group hover:-translate-y-1"
                >
                  {/* Card Header với Status */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b border-gray-200">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <span className="text-3xl">{booking.statusIcon}</span>
                        <span
                          className={`px-3 py-1 rounded-full text-xl font-bold border ${booking.statusClass}`}
                        >
                          {booking.statusDisplay}
                        </span>
                      </div>
                      {booking.status && !booking.isExpiredStatus && (
                        <button
                          onClick={() => handleCancelBooking(booking.bookingId)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          title="Hủy lịch đặt"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 space-y-4">
                    {/* Date & Time - Prominent */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">📅</span>
                        <span className="text-gray-500 text-xl font-medium uppercase tracking-wide">Thời gian đặt</span>
                      </div>
                      <div className="ml-12">
                        <p className="text-gray-900 text-2xl font-bold">
                          {formatDate(booking.dateTime)}
                        </p>
                        <p className="text-blue-600 text-3xl font-bold">
                          {formatTime(booking.dateTime)}
                        </p>
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="flex items-start gap-3">
                      <span className="text-3xl mt-0.5">📝</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-500 text-xl font-medium mb-1">Ghi chú</p>
                        <p className="text-gray-700 text-xl line-clamp-2" title={booking.notes || "Không có ghi chú"}>
                          {booking.notes || "Không có ghi chú"}
                        </p>
                      </div>
                    </div>

                    {/* Created Date */}
                    <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                      <span className="text-2xl">🕒</span>
                      <div className="flex-1">
                        <p className="text-gray-500 text-xl font-medium">Ngày tạo</p>
                        <p className="text-gray-600 text-xl">
                          {formatDateTime(booking.createdDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white rounded-2xl shadow-md px-6 py-5 border border-gray-100">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="text-gray-600 text-xl font-medium">
                    Hiển thị{" "}
                    <span className="font-bold text-blue-600">
                      {startIndex + 1}
                    </span>{" "}
                    -{" "}
                    <span className="font-bold text-blue-600">
                      {Math.min(endIndex, processedBookings.length)}
                    </span>{" "}
                    trong tổng số{" "}
                    <span className="font-bold text-gray-900">
                      {processedBookings.length}
                    </span>{" "}
                    lịch đặt
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 0}
                      className="px-5 py-2.5 border border-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-all duration-200 font-medium text-xl"
                    >
                      ← Trước
                    </button>
                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }, (_, i) => (
                        <button
                          key={i}
                          onClick={() => goToPage(i)}
                          className={`px-5 py-2.5 rounded-lg transition-all duration-200 font-medium text-xl ${
                            currentPage === i
                              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md transform scale-105"
                              : "bg-white border border-gray-300 hover:bg-gray-50 hover:border-blue-400 text-gray-700"
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage >= totalPages - 1}
                      className="px-5 py-2.5 border border-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-all duration-200 font-medium text-xl"
                    >
                      Sau →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Modal Booking Form */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">🔋</span>
                    <h2 className="text-3xl font-bold text-gray-900">
                      Đặt lịch đổi pin
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-gray-500 hover:text-gray-700 hover:bg-gray-200 w-10 h-10 rounded-full flex items-center justify-center transition-colors text-3xl"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="p-6">
                <BookingForm
                  onSuccess={handleFormSuccess}
                  onCancel={() => setShowForm(false)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingPage;