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
        statusDisplay: isExpired(booking.dateTime)
          ? "Hết hạn"
          : booking.status
          ? "Hoạt động"
          : "Đã hủy",
        statusClass: isExpired(booking.dateTime)
          ? "bg-orange-100 text-orange-800"
          : booking.status
          ? "bg-green-100 text-green-800"
          : "bg-red-100 text-red-800",
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
  
    // Format booking ID
    const formatBookingId = (bookingId) => {
      if (!bookingId || bookingId.length <= 10) return bookingId;
      return `${bookingId.substring(0, 6)}...${bookingId.substring(
        bookingId.length - 4
      )}`;
    };
  
    // Hàm xử lý khi nhấn nút Hủy
    const handleCancelBooking = async (bookingId) => {
      if (!window.confirm("Bạn có chắc chắn muốn hủy lịch đặt này?")) {
        return;
      }
      
      try {
        await bookingService.deleteBooking(bookingId);
        alert(" Hủy lịch thành công!");
        fetchBookings(); // Tải lại danh sách
      } catch (error) {
        console.error("Lỗi khi hủy booking:", error);
        alert(" Hủy lịch thất bại, vui lòng thử lại.");
      }
    };
  
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-[#001f54] to-[#0077b6] py-10 font-[Roboto]">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header với nút Thêm */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-white text-4xl font-bold uppercase drop-shadow-lg">
              Lịch đổi pin
            </h1>
            
            <button
              onClick={() => setShowForm(true)}
              className="bg-[#00b894] text-white p-3 rounded-full sm:px-6 sm:py-3 sm:rounded-xl hover:bg-[#009874] transition-all duration-300 font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <span className="text-xl">+</span>
              <span className="hidden sm:inline">Thêm đặt lịch</span>
            </button>
          </div>
  
          {/* Transaction List View */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
            {loading ? (
              <div className="p-8 text-center text-gray-600">Đang tải...</div>
            ) : bookings.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-600 text-lg mb-4">
                  Chưa có lịch đặt nào
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-[#0077b6] text-white px-6 py-3 rounded-xl hover:bg-[#0096c7] transition"
                >
                  + Tạo đặt lịch mới
                </button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    {/* CẢI TIẾN: Tăng padding dọc (py-6) VÀ font-size (text-base) */}
                     <thead className="bg-gradient-to-r from-[#002855] to-[#003d7a] text-white">
                       <tr>
                         <th className="px-6 py-6 text-left text-2xl font-bold tracking-wider uppercase">Booking ID</th>
                         <th className="px-6 py-6 text-left text-2xl font-bold tracking-wider uppercase">Ngày giờ</th>
                         <th className="px-6 py-6 text-left text-2xl font-bold tracking-wider uppercase">Ghi chú</th>
                         <th className="px-6 py-6 text-center text-2xl font-bold tracking-wider uppercase">Trạng thái</th>
                         <th className="px-6 py-6 text-right text-2xl font-bold tracking-wider uppercase">Ngày tạo</th>
                         <th className="px-6 py-6 text-center text-2xl font-bold tracking-wider uppercase">Hành động</th>
                       </tr>
                     </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentBookings.map((booking) => (
                        <tr
                          key={booking.bookingId}
                          className="hover:bg-blue-50 transition-all duration-200 border-b border-gray-100 group"
                        >
                          {/* CẢI TIẾN: Tăng padding dọc (py-6) */}
                         <td className="px-6 py-6 text-gray-700 font-mono text-2xl group-hover:text-[#0077b6] transition-colors">
                           <span className="font-semibold">{formatBookingId(booking.bookingId)}</span>
                         </td>
                         <td className="px-6 py-6 text-gray-700 text-2xl group-hover:text-gray-900 transition-colors">
                           {formatDateTime(booking.dateTime)}
                         </td>
                         <td className="px-6 py-6 text-gray-700 text-2xl max-w-xs truncate group-hover:text-gray-900 transition-colors" title={booking.notes || "-"}>
                           {booking.notes || "-"}
                         </td>
                         <td className="px-6 py-6 text-center">
                           <span
                             className={`px-4 py-2 rounded-full text-base font-bold shadow-sm ${booking.statusClass}`}
                           >
                             {booking.statusDisplay}
                           </span>
                         </td>
                         <td className="px-6 py-6 text-gray-600 text-2xl text-right group-hover:text-gray-800 transition-colors">
                           {formatDateTime(booking.createdDate)}
                         </td>
                         
                         <td className="px-6 py-6 text-center">
                           {booking.status && !booking.isExpiredStatus ? (
                             <button
                               onClick={(e) => {
                                 e.stopPropagation(); 
                                 handleCancelBooking(booking.bookingId);
                               }}
                               className="bg-red-100 text-red-700 font-medium text-xl px-4 py-1.5 rounded-full hover:bg-red-200 transition-colors"
                               title="Hủy lịch đặt này"
                             >
                               Hủy
                             </button>
                           ) : (
                             <span className="text-gray-400 text-xl">-</span>
                           )}
                         </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
  
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-8 py-6 border-t bg-gradient-to-b from-gray-50 to-white flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-gray-700 text-sm font-medium">
                      Hiển thị <span className="font-bold text-[#0077b6]">{startIndex + 1}</span> - <span className="font-bold text-[#0077b6]">{Math.min(endIndex, processedBookings.length)}</span> / <span className="font-bold">{processedBookings.length}</span> booking
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 0}
                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-all duration-200 font-medium shadow-sm"
                      >
                        ← Trước
                      </button>
                      <div className="flex gap-1">
                        {Array.from({ length: totalPages }, (_, i) => (
                          <button
                            key={i}
                            onClick={() => goToPage(i)}
                            className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium shadow-sm ${
                              currentPage === i
                                ? "bg-[#0077b6] text-white shadow-md transform scale-105"
                                : "bg-white border border-gray-300 hover:bg-gray-50 hover:border-[#0077b6]"
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage >= totalPages - 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-all duration-200 font-medium shadow-sm"
                      >
                        Sau →
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
  
          {/* Modal Booking Form */}
          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-[#001f54]">
                      Đặt lịch đổi pin
                    </h2>
                    <button
                      onClick={() => setShowForm(false)}
                      className="text-gray-500 hover:text-gray-700 text-2xl"
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