import React, { useEffect, useState, useCallback, useMemo } from "react";
import BookingForm from "@/users/components/booking-form/BookingForm";
import bookingService from "@/api/bookingService";
import swappingService from "@/api/swappingService";
import {
  notifySuccess,
  notifyError,
} from "@/components/notification/notification";

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
            return "Chờ đổi pin";
          case "completed":
            return "Đổi pin thành công";
          case "swapped":
            return "Đổi pin thành công";
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
            return "bg-blue-100 text-blue-800 border-blue-200"; // Xanh dương cho "Chờ đổi pin"
          case "completed":
            return "bg-green-100 text-green-800 border-green-200"; // Xanh lá cho "Đổi pin thành công"
          case "swapped":
            return "bg-green-100 text-green-800 border-green-200";
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
            return "⏳"; // Icon đồng hồ cát cho "Chờ đổi pin"
          case "completed":
            return "✅"; // Icon checkmark xanh cho "Đổi pin thành công"
          case "swapped":
            return "✅";
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

  // Fetch bookings với swapping status
  const fetchBookings = useCallback(async () => {
    if (!accountId) return;
    try {
      setLoading(true);
      const response = await bookingService.getUserBookings(accountId);
      const bookingsData = response?.data || [];

      // Lấy danh sách swapping để map với bookings
      let swappings = [];
      try {
        // Sử dụng silent: true để không hiển thị thông báo lỗi khi auto-refresh
        swappings = await swappingService.getAllSwapping({ silent: true });
      } catch (swappingErr) {
        console.warn("Could not fetch swappings:", swappingErr);
      }

      // Map swapping với booking dựa trên vehicleId và dateTime
      const bookingsWithSwapping = bookingsData.map((booking) => {
        const relatedSwapping = swappings.find(
          (s) =>
            s.vehicleId === booking.vehicleId &&
            s.createDate === booking.dateTime
        );
        return {
          ...booking,
          swappingData: relatedSwapping || null,
        };
      });

      setBookings(bookingsWithSwapping);
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

  // Auto-refresh bookings mỗi 10 giây để cập nhật khi staff thay đổi
  useEffect(() => {
    if (!accountId) return;

    const intervalId = setInterval(() => {
      fetchBookings();
    }, 10000); // Refresh mỗi 10 giây

    // Cleanup interval khi component unmount
    return () => clearInterval(intervalId);
  }, [accountId, fetchBookings]);

  // Refresh khi user focus vào tab/window
  useEffect(() => {
    const handleFocus = () => {
      if (accountId) {
        fetchBookings();
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
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
      notifySuccess("Hủy lịch thành công!");
      fetchBookings();
    } catch (error) {
      console.error("Lỗi khi hủy booking:", error);
      notifyError("Hủy lịch thất bại, vui lòng thử lại.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header - Clean & Strong */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-5xl font-bold text-gray-900 flex items-center gap-4">
              <span className="text-6xl"> Lịch Đổi Pin</span>
            </h1>
            <p className="text-xl text-gray-600 mt-3">
              Quản lý lịch đặt đổi pin xe điện của bạn
            </p>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-lg px-7 py-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-3"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Đặt lịch mới
          </button>
        </div>

        {/* Stats Cards - Minimal & Clean */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-2xl p-7 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-lg font-medium">
                  Tổng lịch đặt
                </p>
                <p className="text-4xl font-bold text-gray-900 mt-2">
                  {bookings.length}
                </p>
              </div>
              <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-7 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-lg font-medium">
                  Còn hiệu lực
                </p>
                <p className="text-4xl font-bold text-emerald-600 mt-2">
                  {
                    bookings.filter(
                      (b) =>
                        !isExpired(b.dateTime) && b.isApproved !== "Canceled"
                    ).length
                  }
                </p>
              </div>
              <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-7 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-lg font-medium">Đã hết hạn</p>
                <p className="text-4xl font-bold text-orange-600 mt-2">
                  {bookings.filter((b) => isExpired(b.dateTime)).length}
                </p>
              </div>
              <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-2xl border border-gray-200 p-24 text-center">
            <div className="w-14 h-14 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <p className="text-xl text-gray-600 mt-6">Đang tải dữ liệu...</p>
          </div>
        )}

        {/* Empty State - Rất clean */}
        {!loading && bookings.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-24 text-center">
            <div className="w-28 h-28 mx-auto mb-8 bg-gray-100 rounded-3xl flex items-center justify-center">
              <svg
                className="w-16 h-16 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-3xl font-semibold text-gray-800 mb-3">
              Chưa có lịch đặt nào
            </h3>
            <p className="text-xl text-gray-500 mb-10">
              Tạo lịch đặt đầu tiên để bắt đầu sử dụng dịch vụ
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-lg px-8 py-4 rounded-xl shadow-sm hover:shadow-md transition"
            >
              + Tạo lịch đặt mới
            </button>
          </div>
        )}

        {/* Booking List */}
        {!loading && bookings.length > 0 && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
              {currentBookings.map((booking) => (
                <div
                  key={booking.bookingId}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Status Header */}
                  <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{booking.statusIcon}</span>
                      <span
                        className={`px-4 py-2 rounded-lg text-lg font-semibold ${booking.statusClass}`}
                      >
                        {booking.statusDisplay}
                      </span>
                    </div>
                    {!booking.isExpiredStatus &&
                      booking.isApproved !== "Canceled" &&
                      booking.isApproved !== "Swapped" &&
                      booking.isApproved !== "Completed" && (
                        <button
                          onClick={() => handleCancelBooking(booking.bookingId)}
                          className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition"
                        >
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      )}
                  </div>

                  {/* Body */}
                  <div className="p-6 space-y-6">
                    <div>
                      <p className="text-lg text-gray-500 font-medium mb-2">
                        Thời gian đặt
                      </p>
                      <p className="text-3xl font-bold text-gray-900">
                        {formatDate(booking.dateTime)}
                      </p>
                      <p className="text-4xl font-bold text-blue-600 mt-1">
                        {formatTime(booking.dateTime)}
                      </p>
                    </div>

                    {booking.notes && (
                      <div>
                        <p className="text-lg text-gray-500 font-medium mb-1">
                          Ghi chú
                        </p>
                        <p className="text-xl text-gray-700">{booking.notes}</p>
                      </div>
                    )}

                    <div className="text-gray-500 text-lg">
                      <span className="font-medium">Tạo ngày:</span>{" "}
                      {formatDateTime(booking.createdDate)}
                    </div>

                    {/* Approved - Chờ đổi pin */}
                    {booking.isApproved === "Approved" && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                        <p className="text-xl font-semibold text-blue-800 flex items-center gap-2">
                          <span>⏳</span>
                          <span>Chờ đổi pin</span>
                        </p>
                        <p className="text-gray-700 mt-1">
                          Booking đã được xác nhận. Vui lòng đến đúng giờ để đổi pin.
                        </p>
                      </div>
                    )}

                    {/* Completed - Đổi pin thành công */}
                    {(booking.isApproved === "Completed" || booking.isApproved === "Swapped") && (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                        <p className="text-xl font-semibold text-green-800 flex items-center gap-2">
                          <span>✅</span>
                          <span>Đổi pin thành công</span>
                        </p>
                        <p className="text-gray-700 mt-1">
                          Cảm ơn bạn đã sử dụng dịch vụ! Pin đã được đổi thành công.
                        </p>
                      </div>
                    )}

                    {/* Swapping Info */}
                    {booking.swappingData && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-lg">
                        <p className="font-semibold text-gray-800 mb-3">
                          Giao dịch đổi pin
                        </p>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Trạng thái</span>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              booking.swappingData.status === "Finish"
                                ? "bg-green-100 text-green-700"
                                : booking.swappingData.status === "In Progress"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {booking.swappingData.status === "Finish"
                              ? "Hoàn thành"
                              : booking.swappingData.status === "In Progress"
                              ? "Đang xử lý"
                              : "Chờ xử lý"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination - Clean */}
            {totalPages > 1 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                  <p className="text-lg text-gray-600">
                    Hiển thị {startIndex + 1}–
                    {Math.min(endIndex, processedBookings.length)} trong tổng{" "}
                    {processedBookings.length} lịch
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 0}
                      className="px-5 py-3 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition text-lg"
                    >
                      Trước
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => goToPage(i)}
                        className={`px-5 py-3 rounded-lg text-lg font-medium transition ${
                          currentPage === i
                            ? "bg-blue-600 text-white"
                            : "border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage >= totalPages - 1}
                      className="px-5 py-3 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition text-lg"
                    >
                      Sau
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Modal - Clean & Minimal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-4xl font-bold text-gray-900 flex items-center gap-4">
                    <span className="text-5xl">Battery</span> Đặt lịch đổi pin
                  </h2>
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center transition text-3xl"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="p-8">
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
