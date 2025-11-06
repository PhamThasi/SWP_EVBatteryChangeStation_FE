import { useStaffSupport } from '@/context/StaffSupportContext';
import React from 'react';

const StaffRequestCard = ({ request }) => {
  const { openEditModal } = useStaffSupport();

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleEdit = () => {
    openEditModal(request);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800 mb-2">{request.title}</h3>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDate(request.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Account ID: {request.accountId?.substring(0, 8)}...
            </span>
          </div>
        </div>
        
        <div className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
          request.status === 'pending' 
            ? 'bg-yellow-100 text-yellow-700' 
            : 'bg-green-100 text-green-700'
        }`}>
          {request.status === 'pending' ? 'Chưa xử lý' : 'Đã xử lý'}
        </div>
      </div>

      {/* Content */}
      <div className="mb-4 space-y-2">
        <p className="text-gray-700">
          <span className="font-semibold text-gray-900">Loại vấn đề:</span> {request.issueType || request.supportType}
        </p>
        <p className="text-gray-700">
          <span className="font-semibold text-gray-900">Mô tả:</span> {request.description || request.details}
        </p>
        {request.staffId && (
          <p className="text-sm text-gray-500">
            <span className="font-semibold">Nhân viên xử lý:</span> {request.staffId?.substring(0, 8)}...
          </p>
        )}
        {request.responseText && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
            <p className="font-semibold text-gray-900 mb-2">Phản hồi từ nhân viên:</p>
            <p className="text-gray-700">{request.responseText}</p>
            {request.responseDate && (
              <p className="text-sm text-gray-500 mt-2">
                Ngày phản hồi: {formatDate(request.responseDate)}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <button
          onClick={handleEdit}
          className="bg-[#0077b6] text-white px-6 py-3 rounded-xl transition font-semibold text-base hover:bg-[#0096c7]"
        >
          Xử lý
        </button>
      </div>
    </div>
  );
};

export default StaffRequestCard;

