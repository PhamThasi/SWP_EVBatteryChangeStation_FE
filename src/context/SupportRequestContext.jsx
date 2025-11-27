import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import supportRequestService from '@/api/supportRequestService';

const SupportRequestContext = createContext();

export const SupportRequestProvider = ({ children }) => {
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'resolved'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch requests từ API và map sang format phù hợp
  // Sử dụng useCallback để tránh tạo function mới mỗi lần render
  const fetchRequests = useCallback(async (accountId) => {
    if (!accountId) return;
    setLoading(true);
    try {
      const response = await supportRequestService.getByAccountId(accountId);
      
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
          createDate: item.createDate,
          responseText: responseText,
          responseDate: item.responseDate,
          accountId: item.accountId,
          staffId: item.staffId,
          // Các field không có trong API, để empty hoặc default
          name: 'Người dùng',
          vehicle: 'N/A',
          topic: item.issueType,
          phone: '',
          email: '',
          vehiclePlate: '',
          contactPreference: '',
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
      console.error('Error fetching support requests:', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Thêm request mới
  const addRequest = useCallback((newRequest) => {
    // Nếu newRequest có data từ API response
    const requestData = newRequest.data || newRequest;
    
    // Đảm bảo request mới luôn có responseText rỗng và không có staffId, status là 'pending'
    const responseText = requestData.responseText || '';
    const hasStaffId = requestData.staffId && requestData.staffId.trim() !== '';
    const status = (!responseText || responseText.trim() === '') && !hasStaffId ? 'pending' : 'resolved';
    
    const request = {
      id: requestData.requestId || Date.now(),
      requestId: requestData.requestId,
      title: requestData.issueType || 'Yêu cầu hỗ trợ',
      supportType: requestData.issueType || 'Khác',
      issueType: requestData.issueType,
      description: requestData.description,
      details: requestData.description,
      status: status, // Tính từ responseText
      createdAt: requestData.createDate || new Date().toISOString(),
      createDate: requestData.createDate || new Date().toISOString(),
      responseText: '', // Luôn rỗng cho request mới tạo
      responseDate: requestData.responseDate,
      accountId: requestData.accountId,
      staffId: requestData.staffId,
      name: 'Người dùng',
      vehicle: 'N/A',
      topic: requestData.issueType,
      phone: '',
      email: '',
      vehiclePlate: '',
      contactPreference: '',
    };
    
    console.log('Adding new request:', request);
    setRequests(prevRequests => {
      const newRequests = [request, ...prevRequests];
      // Sắp xếp lại sau khi thêm request mới để đảm bảo mới nhất lên đầu
      const sorted = newRequests.sort((a, b) => {
        const dateA = a.createDate 
          ? new Date(a.createDate).getTime() 
          : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
        const dateB = b.createDate 
          ? new Date(b.createDate).getTime() 
          : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
        return dateB - dateA; // Mới nhất lên đầu
      });
      console.log('Updated requests array:', sorted);
      return sorted;
    });
  }, []);

  // Cập nhật trạng thái request
  const updateRequestStatus = useCallback((id, status) => {
    setRequests(prevRequests => {
      const updated = prevRequests.map(req => 
        req.id === id ? { ...req, status } : req
      );
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
  }, []);

  // Xóa request (hard delete)
  const deleteRequest = useCallback(async (requestId) => {
    try {
      // Gọi API để hard delete
      await supportRequestService.hardDelete(requestId);
      
      // Xóa khỏi state sau khi API thành công
      setRequests(prevRequests => prevRequests.filter(req => req.id !== requestId && req.requestId !== requestId));
      
      return true;
    } catch (error) {
      console.error('Error deleting support request:', error);
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
    <SupportRequestContext.Provider value={{
      requests: filteredRequests,
      allRequests: requests,
      activeTab,
      setActiveTab,
      isModalOpen,
      setIsModalOpen,
      addRequest,
      updateRequestStatus,
      deleteRequest,
      fetchRequests,
      loading,
    }}>
      {children}
    </SupportRequestContext.Provider>
  );
};

// Custom hook để sử dụng context
export const useSupportRequest = () => {
  const context = useContext(SupportRequestContext);
  if (!context) {
    throw new Error('useSupportRequest must be used within SupportRequestProvider');
  }
  return context;
};