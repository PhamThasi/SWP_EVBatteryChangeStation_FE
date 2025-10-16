
import { useSupportRequest } from '@/context/SupportRequestContext';
import React from 'react';

const RequestCard = ({ request }) => {
  const { updateRequestStatus, deleteRequest, activeTab } = useSupportRequest();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
              {request.name}
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
          <span className="font-semibold text-gray-900">Loại hỗ trợ:</span> {request.supportType}
        </p>
        <p className="text-gray-700">
          <span className="font-semibold text-gray-900">Phương tiện:</span> {request.vehicle}
        </p>
        <p className="text-gray-700">
          <span className="font-semibold text-gray-900">Chủ đề:</span> {request.topic}
        </p>
        <p className="text-gray-700">
          <span className="font-semibold text-gray-900">Chi tiết:</span> {request.details}
        </p>
      </div>

      {/* Contact Info */}
      <div className="mb-4 text-sm text-gray-600 space-y-1">
        <p>
          <span className="font-semibold text-gray-900">Liên hệ:</span> {request.phone} | {request.email}
        </p>
        {request.vehiclePlate && (
          <p>
            <span className="font-semibold text-gray-900">Biển số xe:</span> {request.vehiclePlate}
          </p>
        )}
        <p>
          <span className="font-semibold text-gray-900">Ưu tiên liên hệ:</span> {request.contactPreference}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {activeTab === 'pending' && (
          <button
            onClick={() => updateRequestStatus(request.id, 'resolved')}
            className="flex-1 bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600 transition font-semibold"
          >
            Đánh dấu đã xử lý
          </button>
        )}
        {activeTab === 'resolved' && (
          <button
            onClick={() => updateRequestStatus(request.id, 'pending')}
            className="flex-1 bg-yellow-500 text-white px-4 py-2 rounded-xl hover:bg-yellow-600 transition font-semibold"
          >
            Đánh dấu chưa xử lý
          </button>
        )}
        <button
          onClick={() => {
            if (window.confirm('Bạn có chắc chắn muốn xóa yêu cầu này?')) {
              deleteRequest(request.id);
            }
          }}
          className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition font-semibold"
        >
          Xóa
        </button>
      </div>
    </div>
  );
};

export default RequestCard;