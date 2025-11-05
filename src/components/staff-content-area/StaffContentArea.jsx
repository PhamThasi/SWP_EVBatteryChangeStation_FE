import React, { useState, useEffect } from "react";
import { useStaffSupport } from "./../../context/StaffSupportContext";
import StaffRequestCard from './../staff-request-card/StaffRequestCard';

const ITEMS_PER_PAGE = 5;

const StaffContentArea = () => {
  const { requests, activeTab } = useStaffSupport();
  const [currentPage, setCurrentPage] = useState(0);

  // Reset về trang đầu tiên khi chuyển tab hoặc requests thay đổi
  useEffect(() => {
    setCurrentPage(0);
  }, [activeTab, requests.length]);

  // Pagination logic
  const totalPages = Math.ceil(requests.length / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentRequests = requests.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(page);
    // Scroll to top of content area
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Empty State Component
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="bg-blue-50 p-8 rounded-2xl mb-6">
        <svg 
          className="w-24 h-24 text-blue-400 mx-auto" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
          />
        </svg>
      </div>
      <h3 className="text-2xl font-bold text-[#0077b6] mb-2">
        {activeTab === 'pending' 
          ? 'Không có yêu cầu chưa xử lý' 
          : 'Không có yêu cầu đã xử lý'}
      </h3>
      <p className="text-gray-600">
        {activeTab === 'pending' 
          ? 'Tất cả yêu cầu đã được xử lý' 
          : 'Chưa có yêu cầu nào được đánh dấu đã xử lý'}
      </p>
    </div>
  );

  return (
    <div className="p-8 bg-gray-50 min-h-[500px]">
      {requests.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid gap-4">
            {currentRequests.map(request => (
              <StaffRequestCard key={request.id} request={request} />
            ))}
          </div>

          {/* Pagination - chỉ hiển thị khi có > 5 items */}
          {requests.length > ITEMS_PER_PAGE && (
            <div className="mt-8 px-4 py-6 border-t border-gray-200 bg-white rounded-lg shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-gray-700 text-sm font-medium">
                Hiển thị <span className="font-bold text-[#0077b6]">{startIndex + 1}</span> - <span className="font-bold text-[#0077b6]">{Math.min(endIndex, requests.length)}</span> / <span className="font-bold">{requests.length}</span> yêu cầu
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-all duration-200 font-medium shadow-sm text-gray-700"
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
                          : "bg-white border border-gray-300 hover:bg-gray-50 hover:border-[#0077b6] text-gray-700"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages - 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-all duration-200 font-medium shadow-sm text-gray-700"
                >
                  Sau →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StaffContentArea;

