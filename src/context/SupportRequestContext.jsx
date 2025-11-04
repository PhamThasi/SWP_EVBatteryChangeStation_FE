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
        // Status dựa vào responseText: nếu responseText rỗng thì là 'pending', có giá trị thì là 'resolved'
        const status = responseText.trim() === '' ? 'pending' : 'resolved';
        
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
      
      setRequests(mappedRequests);
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
    
    // Đảm bảo request mới luôn có responseText rỗng và status là 'pending'
    const responseText = requestData.responseText || '';
    const status = responseText.trim() === '' ? 'pending' : 'resolved';
    
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
      console.log('Updated requests array:', newRequests);
      return newRequests;
    });
  }, []);

  // Cập nhật trạng thái request
  const updateRequestStatus = useCallback((id, status) => {
    setRequests(prevRequests => prevRequests.map(req => 
      req.id === id ? { ...req, status } : req
    ));
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

  // Lọc requests theo tab hiện tại - dựa vào responseText
  // pending: responseText rỗng, resolved: responseText có giá trị
  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      const isEmpty = !req.responseText || req.responseText.trim() === '';
      return activeTab === 'pending' ? isEmpty : !isEmpty;
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