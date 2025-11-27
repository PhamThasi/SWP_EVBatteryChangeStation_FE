import React, { useEffect, useState, useCallback, useMemo } from "react";
import bookingService from "@/api/bookingService";
import swappingService from "@/api/swappingService";
import paymentService from "@/api/paymentService";
import subcriptionService from "@/api/subcriptionService";

const SwappingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [accountId, setAccountId] = useState("");
  const [mySubscription, setMySubscription] = useState(null);

  const ITEMS_PER_PAGE = 10;

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

  // Fetch bookings với swapping status - chỉ lấy Approved và Swapped
  const fetchBookings = useCallback(async () => {
    if (!accountId) return;
    try {
      setLoading(true);
      const response = await bookingService.getUserBookings(accountId);
      const bookingsData = response?.data || [];

      // Lọc chỉ lấy các booking đã được xác nhận (Approved) hoặc đã đổi pin thành công (Swapped)
      const confirmedBookings = bookingsData.filter(
        (booking) =>
          booking.isApproved === "Approved" || booking.isApproved === "Swapped"
      );

      // Lấy danh sách swapping để map với bookings
      let swappings = [];
      try {
        swappings = await swappingService.getAllSwapping();
      } catch (swappingErr) {
        console.warn("Could not fetch swappings:", swappingErr);
      }

      // Map swapping với booking dựa trên vehicleId và dateTime
      const bookingsWithSwapping = confirmedBookings.map((booking) => {
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

  // Fetch subscription đã mua từ payments
  const fetchMySubscription = useCallback(async () => {
    if (!accountId) return;
    try {
      // Lấy payments của account
      const paymentsRes = await paymentService.getPaymentsByAccountId(accountId);
      const payments = paymentsRes?.data || [];
      
      // Tìm payment thành công mới nhất
      const successfulPayments = payments
        .filter(
          (payment) => 
            payment.status === "Successful" && 
            payment.subscriptionId !== null &&
            payment.subscriptionId !== undefined
        )
        .sort((a, b) => new Date(b.createDate) - new Date(a.createDate));
      
      const successfulPayment = successfulPayments[0];
      
      if (successfulPayment && successfulPayment.subscriptionId) {
        // Lấy thông tin subscription template
        const allSubsRes = await subcriptionService.getSubscriptions();
        const subscriptionTemplate = allSubsRes?.data?.find(
          (sub) => sub.subscriptionId === successfulPayment.subscriptionId
        );
        
        if (subscriptionTemplate) {
          setMySubscription({
            ...subscriptionTemplate,
            purchaseDate: successfulPayment.createDate,
            paymentId: successfulPayment.paymentId,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
    }
  }, [accountId]);

  useEffect(() => {
    const accId = decodeAccountIdFromToken();
    setAccountId(accId);
  }, []);

  useEffect(() => {
    if (accountId) {
      fetchMySubscription();
    }
  }, [accountId, fetchMySubscription]);

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

  // Dùng useMemo để xử lý và sắp xếp bookings
  const processedBookings = useMemo(() => {
    const processed = bookings.map((booking) => ({
      ...booking,
      statusDisplay: (() => {
        switch ((booking.isApproved || "").toLowerCase()) {
          case "approved":
            return "Đã xác nhận đặt lịch";
          case "swapped":
            return "Đã hoàn thành đổi pin";
          default:
            return "Đã xác nhận";
        }
      })(),
      statusClass: (() => {
        switch ((booking.isApproved || "").toLowerCase()) {
          case "approved":
            return "bg-emerald-100 text-emerald-800 border-emerald-200";
          case "swapped":
            return "bg-green-100 text-green-800 border-green-200";
          default:
            return "bg-gray-100 text-gray-700 border-gray-200";
        }
      })(),
      statusIcon: (() => {
        switch ((booking.isApproved || "").toLowerCase()) {
          case "approved":
            return "✓";
          case "swapped":
            return "✅";
          default:
            return "…";
        }
      })(),
    }));

    // Sắp xếp theo ngày tạo mới nhất
    processed.sort((a, b) => {
      const createdA = new Date(a.createdDate || a.dateTime);
      const createdB = new Date(b.createdDate || b.dateTime);
      return createdB - createdA;
    });

    return processed;
  }, [bookings]);

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

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 font-['Inter']">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-gray-900 text-5xl font-bold mb-2 flex items-center gap-3">
            <span className="text-6xl">📋</span>
            Lịch sử giao dịch đổi pin
          </h1>
          <p className="text-gray-600 text-xl">
            Xem lại các giao dịch đổi pin đã được xác nhận và hoàn thành
          </p>
        </div>

        {/* Subscription Info Card */}
        {mySubscription && (
          <div className="mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-4xl">🎁</span>
                  <h2 className="text-3xl font-bold">Gói Subscription Của Bạn</h2>
                </div>
                <div className="ml-14 space-y-2">
                  <p className="text-2xl font-semibold">{mySubscription.name}</p>
                  <p className="text-blue-100 text-xl">
                    Đã mua: {formatDate(mySubscription.purchaseDate)}
                  </p>
                  {mySubscription.description && (
                    <p className="text-blue-100 text-lg mt-2">
                      {mySubscription.description.split('\n')[0]}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-4">
                  <p className="text-blue-100 text-xl mb-1">Giá</p>
                  <p className="text-3xl font-bold">
                    {mySubscription.price
                      ? `${(mySubscription.price / 1000).toFixed(0)}K`
                      : "Theo lượt"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xl font-medium">
                  Tổng giao dịch
                </p>
                <p className="text-4xl font-bold text-gray-900 mt-1">
                  {bookings.length}
                </p>
              </div>
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-4xl">📋</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xl font-medium">
                  Đã xác nhận
                </p>
                <p className="text-4xl font-bold text-emerald-600 mt-1">
                  {
                    bookings.filter((b) => b.isApproved === "Approved")
                      .length
                  }
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
                <p className="text-gray-500 text-xl font-medium">
                  Đã hoàn thành
                </p>
                <p className="text-4xl font-bold text-green-600 mt-1">
                  {
                    bookings.filter((b) => b.isApproved === "Swapped")
                      .length
                  }
                </p>
              </div>
              <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-4xl">✅</span>
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
                Chưa có giao dịch nào
              </p>
              <p className="text-gray-500 text-xl mb-6">
                Các giao dịch đã được xác nhận và hoàn thành sẽ hiển thị tại đây
              </p>
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
                    <div className="flex items-center gap-2">
                      <span className="text-3xl">{booking.statusIcon}</span>
                      <span
                        className={`px-3 py-1 rounded-full text-xl font-bold border ${booking.statusClass}`}
                      >
                        {booking.statusDisplay}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 space-y-4">
                    {/* Date & Time - Prominent */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">📅</span>
                        <span className="text-gray-500 text-xl font-medium uppercase tracking-wide">
                          Thời gian đặt
                        </span>
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
                        <p className="text-gray-500 text-xl font-medium mb-1">
                          Ghi chú
                        </p>
                        <p
                          className="text-gray-700 text-xl line-clamp-2"
                          title={booking.notes || "Không có ghi chú"}
                        >
                          {booking.notes || "Không có ghi chú"}
                        </p>
                      </div>
                    </div>

                    {/* Created Date */}
                    <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                      <span className="text-2xl">🕒</span>
                      <div className="flex-1">
                        <p className="text-gray-500 text-xl font-medium">
                          Ngày tạo
                        </p>
                        <p className="text-gray-600 text-xl">
                          {formatDateTime(booking.createdDate)}
                        </p>
                      </div>
                    </div>

                    {/* Thông tin xác nhận đặt lịch - Bước 1 */}
                    {booking.isApproved === "Approved" && (
                      <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-4 border-2 border-emerald-300 mt-4">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-4xl">✅</span>
                          <span className="text-emerald-700 text-2xl font-bold">
                            Đã xác nhận đặt lịch
                          </span>
                        </div>
                        <div className="ml-12 space-y-2">
                          <p className="text-emerald-700 text-lg font-medium">
                            Booking của bạn đã được staff xác nhận!
                          </p>
                          <p className="text-gray-600 text-base">
                            Vui lòng đến trạm đúng thời gian đã đặt để thực hiện đổi pin.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Thông tin hoàn thành đổi pin - Bước 2 */}
                    {booking.isApproved === "Swapped" && (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-400 mt-4">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-4xl">🔋</span>
                          <span className="text-green-700 text-2xl font-bold">
                            Đã hoàn thành đổi pin
                          </span>
                        </div>
                        <div className="ml-12 space-y-2">
                          <p className="text-green-700 text-lg font-medium">
                            Đổi pin đã được hoàn thành thành công!
                          </p>
                          <p className="text-gray-600 text-base">
                            Cảm ơn bạn đã sử dụng dịch vụ đổi pin của chúng tôi.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Swapping Status - Hiển thị khi có swapping transaction */}
                    {booking.swappingData && (
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200 mt-4">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-3xl">🔋</span>
                          <span className="text-gray-700 text-xl font-bold">
                            Thông tin giao dịch đổi pin
                          </span>
                        </div>
                        <div className="ml-12 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600 text-lg font-medium">
                              Trạng thái:
                            </span>
                            <span
                              className={`px-3 py-1 rounded-full text-lg font-bold ${
                                booking.swappingData.status === "Finish"
                                  ? "bg-green-100 text-green-800 border border-green-300"
                                  : booking.swappingData.status ===
                                    "In Progress"
                                  ? "bg-blue-100 text-blue-800 border border-blue-300"
                                  : "bg-yellow-100 text-yellow-800 border border-yellow-300"
                              }`}
                            >
                              {booking.swappingData.status === "Finish"
                                ? "✅ Hoàn thành"
                                : booking.swappingData.status === "In Progress"
                                ? "🔄 Đang xử lý"
                                : "⏳ Chờ xử lý"}
                            </span>
                          </div>
                          <p className="text-gray-600 text-lg">
                            <span className="font-medium">Mã giao dịch:</span>{" "}
                            {booking.swappingData.transactionId?.substring(
                              0,
                              8
                            )}
                            ...
                          </p>
                        </div>
                      </div>
                    )}
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
                    giao dịch
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 0}
                      className="px-5 py-2.5 border border-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-all duration-200 font-medium text-xl"
                    >
                      ← Trang trước
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
                      Trang sau →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SwappingHistory;


