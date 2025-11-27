import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import staffService from '@/api/staffService';
import tokenUtils from '@/utils/tokenUtils';

const StaffSupportContext = createContext();

export const StaffSupportProvider = ({ children }) => {
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'resolved'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch tất cả requests từ API
  const fetchAllRequests = useCallback(async () => {
    setLoading(true);
    try {
      const response = await staffService.getAllSupportRequests();
      
      // Map data từ API response sang format cho component
      const mappedRequests = (response.data || []).map((item) => {
        const responseText = item.responseText || '';
        const hasStaffId = item.staffId && item.staffId.trim() !== '';
        // Status: pending nếu responseText rỗng VÀ không có staffId, resolved nếu có responseText HOẶC có staffId
        const status = (!responseText || responseText.trim() === '') && !hasStaffId ? 'pending' : 'resolved';
        
        return {
          id: item.requestId,
          requestId: item.requestId,
          title: item.issueType || 'Yêu cầu hỗ trợ',
          supportType: item.issueType || 'Khác',
          issueType: item.issueType,
          description: item.description,
          details: item.description,
          status: status,
          createdAt: item.createDate,
          responseText: responseText,
          responseDate: item.responseDate,
          accountId: item.accountId,
          staffId: item.staffId,
          createDate: item.createDate,
          statusField: item.status,
        };
      });
      
      // Sắp xếp mới nhất lên đầu ngay sau khi map data
      const sortedRequests = mappedRequests.sort((a, b) => {
        const dateA = a.createDate ? new Date(a.createDate).getTime() : 0;
        const dateB = b.createDate ? new Date(b.createDate).getTime() : 0;
        return dateB - dateA; // Mới nhất lên đầu (giảm dần)
      });
      
      setRequests(sortedRequests);
    } catch (error) {
      console.error('Error fetching all support requests:', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Mở modal để xử lý request
  const openEditModal = useCallback((request) => {
    setEditingRequest(request);
    setIsModalOpen(true);
  }, []);

  // Đóng modal
  const closeModal = useCallback(() => {
    setEditingRequest(null);
    setIsModalOpen(false);
  }, []);

  // Update request
  const updateRequest = useCallback(async (requestId, updateData) => {
    try {
      // Lấy staffId từ localStorage
      const userData = tokenUtils.getUserData();
      const staffId = userData?.accountId;

      if (!staffId) {
        throw new Error('Không tìm thấy thông tin nhân viên');
      }

      const response = await staffService.updateSupportRequest(requestId, {
        issueType: updateData.issueType,
        description: updateData.description,
        accountId: updateData.accountId,
        responseText: updateData.responseText,
      });

      // Cập nhật request trong state và đảm bảo sắp xếp mới nhất lên đầu
      setRequests(prevRequests => {
        const updated = prevRequests.map(req => {
          if (req.requestId === requestId) {
            const updatedResponseText = updateData.responseText || '';
            const hasStaffId = staffId ? true : (req.staffId && req.staffId.trim() !== '');
            const status = (!updatedResponseText || updatedResponseText.trim() === '') && !hasStaffId 
              ? 'pending' 
              : 'resolved';
            
            return {
              ...req,
              issueType: updateData.issueType,
              description: updateData.description,
              responseText: updatedResponseText,
              staffId: staffId,
              responseDate: new Date().toISOString(),
              status: status,
            };
          }
          return req;
        });
        
        // Sắp xếp lại sau khi update để đảm bảo mới nhất lên đầu
        return updated.sort((a, b) => {
          const dateA = a.createDate 
            ? new Date(a.createDate).getTime() 
            : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
          const dateB = b.createDate 
            ? new Date(b.createDate).getTime() 
            : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
          return dateB - dateA; // Mới nhất lên đầu
        });
      });

      return response;
    } catch (error) {
      console.error('Error updating support request:', error);
      throw error;
    }
  }, []);

  // Lọc requests theo tab hiện tại và sắp xếp mới nhất lên đầu
  // pending: responseText rỗng VÀ không có staffId
  // resolved: có responseText HOẶC có staffId
  const filteredRequests = useMemo(() => {
    const filtered = requests.filter(req => {
      const hasResponseText = req.responseText && req.responseText.trim() !== '';
      const hasStaffId = req.staffId && req.staffId.trim() !== '';
      const isResolved = hasResponseText || hasStaffId;
      
      return activeTab === 'pending' ? !isResolved : isResolved;
    });
    
    // Sắp xếp mới nhất lên đầu (theo createDate - ưu tiên, nếu không có thì dùng createdAt)
    return filtered.sort((a, b) => {
      // Ưu tiên dùng createDate, nếu không có thì dùng createdAt
      const dateA = a.createDate 
        ? new Date(a.createDate).getTime() 
        : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
      const dateB = b.createDate 
        ? new Date(b.createDate).getTime() 
        : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
      
      // Mới nhất lên đầu (giảm dần)
      return dateB - dateA;
    });
  }, [requests, activeTab]);

  return (
    <StaffSupportContext.Provider value={{
      requests: filteredRequests,
      allRequests: requests,
      activeTab,
      setActiveTab,
      isModalOpen,
      setIsModalOpen,
      editingRequest,
      openEditModal,
      closeModal,
      updateRequest,
      fetchAllRequests,
      loading,
    }}>
      {children}
    </StaffSupportContext.Provider>
  );
};

// Custom hook để sử dụng context
export const useStaffSupport = () => {
  const context = useContext(StaffSupportContext);
  if (!context) {
    throw new Error('useStaffSupport must be used within StaffSupportProvider');
  }
  return context;
};

