
import React from "react";
import { useSupportRequest } from "./../../context/SupportRequestContext";
import RequestCard from './../request-card/RequestCard';

const ContentArea = () => {
  const { requests, activeTab } = useSupportRequest();

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
          ? 'Nhấn nút "Tạo yêu cầu mới" để thêm yêu cầu hỗ trợ'
          : 'Chưa có yêu cầu nào được đánh dấu đã xử lý'}
      </p>
    </div>
  );

  return (
    <div className="p-8 bg-gray-50 min-h-[500px]">
      {requests.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4">
          {requests.map(request => (
            <RequestCard key={request.id} request={request} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ContentArea;