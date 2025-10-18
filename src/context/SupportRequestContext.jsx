
import React, { createContext, useContext, useState } from 'react';

const SupportRequestContext = createContext();

export const SupportRequestProvider = ({ children }) => {
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'resolved'
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Thêm request mới
  const addRequest = (newRequest) => {
    const request = {
      id: Date.now(),
      ...newRequest,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setRequests([request, ...requests]);
  };

  // Cập nhật trạng thái request
  const updateRequestStatus = (id, status) => {
    setRequests(requests.map(req => 
      req.id === id ? { ...req, status } : req
    ));
  };

  // Xóa request
  const deleteRequest = (id) => {
    setRequests(requests.filter(req => req.id !== id));
  };

  // Lọc requests theo tab hiện tại
  const filteredRequests = requests.filter(req => 
    activeTab === 'pending' ? req.status === 'pending' : req.status === 'resolved'
  );

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