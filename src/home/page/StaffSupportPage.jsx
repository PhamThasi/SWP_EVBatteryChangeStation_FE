import React, { useEffect } from "react";
import StaffTabSection from "@/components/staff-tab-section/StaffTabSection";
import StaffContentArea from "@/components/staff-content-area/StaffContentArea";
import {
  StaffSupportProvider,
  useStaffSupport,
} from "@/context/StaffSupportContext";
import ModalForm from "@/components/modalForm/ModalForm";
import * as Yup from "yup";

const StaffSupportContent = () => {
  const {
    isModalOpen,
    editingRequest,
    closeModal,
    updateRequest,
    fetchAllRequests,
    loading,
    setActiveTab,
  } = useStaffSupport();

  // Fetch data khi component mount
  useEffect(() => {
    fetchAllRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Validation schema cho form update
  const validationSchema = Yup.object({
    issueType: Yup.string().required("Vui lòng chọn loại vấn đề"),
    description: Yup.string()
      .required("Vui lòng nhập mô tả chi tiết")
      .min(10, "Mô tả phải có ít nhất 10 ký tự"),
    responseText: Yup.string()
      .required("Vui lòng nhập phản hồi")
      .min(10, "Phản hồi phải có ít nhất 10 ký tự"),
  });

  // Form fields cho update
  const formFields = [
    {
      name: "issueType",
      label: "Loại vấn đề",
      type: "select",
      as: "select",
      placeholder: "Chọn loại vấn đề",
      options: [
        "",
        "Vấn đề kỹ thuật",
        "Thanh toán",
        "Dịch vụ khách hàng",
        "Hỗ trợ dịch vụ Xe",
        "Hỗ trợ dịch vụ Sạc",
        "Khác",
      ],
    },
    {
      name: "description",
      label: "Mô tả chi tiết",
      as: "textarea",
      placeholder: "Nhập mô tả chi tiết về vấn đề...",
      rows: 5,
    },
    {
      name: "responseText",
      label: "Phản hồi từ nhân viên",
      as: "textarea",
      placeholder: "Nhập phản hồi của bạn...",
      rows: 5,
    },
  ];

  // Initial values từ request đang edit
  const getInitialValues = () => {
    if (editingRequest) {
      return {
        issueType: editingRequest.issueType || "",
        description: editingRequest.description || "",
        responseText: editingRequest.responseText || "",
      };
    }
    return {
      issueType: "",
      description: "",
      responseText: "",
    };
  };

  const handleSubmit = async (values) => {
    try {
      if (!editingRequest) {
        alert("Không tìm thấy yêu cầu cần xử lý!");
        return;
      }

      const updatePayload = {
        issueType: values.issueType,
        description: values.description,
        accountId: editingRequest.accountId,
        responseText: values.responseText,
      };

      await updateRequest(editingRequest.requestId, updatePayload);

      closeModal();
      alert("Yêu cầu đã được xử lý thành công!");
      
      // Chuyển sang tab đã xử lý
      setActiveTab("resolved");
      
      // Refresh danh sách
      await fetchAllRequests();
    } catch (error) {
      console.error("Error updating support request:", error);
      alert("Có lỗi xảy ra khi xử lý yêu cầu. Vui lòng thử lại!");
      throw error;
    }
  };

  return (
    <div className="max-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto mt-[10rem]">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <StaffTabSection />
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-lg text-gray-600">Đang tải dữ liệu...</div>
            </div>
          ) : (
            <StaffContentArea />
          )}
        </div>

        {isModalOpen && editingRequest && (
          <ModalForm
            title="Xử lý yêu cầu hỗ trợ"
            initialValues={getInitialValues()}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            onClose={closeModal}
            fields={formFields}
          />
        )}
      </div>
    </div>
  );
};

// Component chính với Provider
const StaffSupportPage = () => {
  return (
    <StaffSupportProvider>
      <StaffSupportContent />
    </StaffSupportProvider>
  );
};

export default StaffSupportPage;
