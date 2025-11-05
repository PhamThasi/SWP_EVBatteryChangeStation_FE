import React from 'react';
import { useStaffSupport } from './../../context/StaffSupportContext';

const StaffTabSection = () => {
  const { activeTab, setActiveTab, allRequests } = useStaffSupport();
  
  // Đếm số lượng requests
  // pending: responseText rỗng VÀ không có staffId
  // resolved: có responseText HOẶC có staffId
  const pendingCount = allRequests.filter(r => {
    const hasResponseText = r.responseText && r.responseText.trim() !== '';
    const hasStaffId = r.staffId && r.staffId.trim() !== '';
    return !hasResponseText && !hasStaffId;
  }).length;
  
  const resolvedCount = allRequests.filter(r => {
    const hasResponseText = r.responseText && r.responseText.trim() !== '';
    const hasStaffId = r.staffId && r.staffId.trim() !== '';
    return hasResponseText || hasStaffId;
  }).length;

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="flex items-center gap-8 px-8">
        <button
          onClick={() => setActiveTab('pending')}
          className={`py-4 px-2 text-lg font-semibold border-b-2 transition-colors ${
            activeTab === 'pending'
              ? 'border-[#0077b6] text-[#0077b6]'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          Chưa xử lý
          {pendingCount > 0 && (
            <span className="ml-2 bg-blue-100 text-[#0077b6] px-2 py-1 rounded-full text-sm">
              {pendingCount}
            </span>
          )}
        </button>
        
        <button
          onClick={() => setActiveTab('resolved')}
          className={`py-4 px-2 text-lg font-semibold border-b-2 transition-colors ${
            activeTab === 'resolved'
              ? 'border-[#0077b6] text-[#0077b6]'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          Đã xử lý
          {resolvedCount > 0 && (
            <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
              {resolvedCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default StaffTabSection;

