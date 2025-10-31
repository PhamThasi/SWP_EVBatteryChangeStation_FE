// src/pages/support-request/SupportRequest.jsx
import Button from "@/components/button";
import React, { useState } from "react";
import TabSection from "./../../../components/tab-section/TabSection";
import ContentArea from "@/components/content-area/ContentArea";
// import ModalForm from '@/components/common/ModalForm';
import * as Yup from "yup";
import {
  SupportRequestProvider,
  useSupportRequest,
} from "@/context/SupportRequestContext";
import ModalForm from "@/components/modalForm/ModalForm";
import SupportRequestForm from "@/components/support-request-form/SupportRequestForm";

const SupportRequestContent = () => {
  const { setIsModalOpen, isModalOpen, addRequest } = useSupportRequest();

  // Cấu hình cho ModalForm
  const initialValues = {
    supportType: "Hỗ trợ dịch vụ Xe",
    title: "",
    vehicle: "Không",
    topic: "",
    details: "",
    name: "",
    phone: "",
    email: "",
    contactPreference: "Gọi điện thoại",
    vehiclePlate: "",
  };

  const validationSchema = Yup.object({
    title: Yup.string().required("Vui lòng nhập tiêu đề"),
    topic: Yup.string().required("Vui lòng chọn chủ đề"),
    details: Yup.string().required("Vui lòng nhập chi tiết"),
    name: Yup.string().required("Vui lòng nhập họ tên"),
    phone: Yup.string()
      .matches(/^[0-9]+$/, "Số điện thoại chỉ được chứa số")
      .min(10, "Số điện thoại phải có ít nhất 10 số")
      .required("Vui lòng nhập số điện thoại"),
    email: Yup.string()
      .email("Email không hợp lệ")
      .required("Vui lòng nhập email"),
  });

  const formFields = [
    {
      name: "supportType",
      label: "Hỗ trợ",
      type: "select",
      as: "select",
      options: ["Hỗ trợ dịch vụ Xe", "Hỗ trợ dịch vụ Sạc"],
    },
    {
      name: "title",
      label: "Tiêu đề",
      placeholder: "Tiêu kiểu đề cho yêu cầu",
    },
    {
      name: "vehicle",
      label: "Phương tiện",
      type: "select",
      as: "select",
      options: ["Không", "Xe máy", "Ô tô"],
    },
    {
      name: "topic",
      label: "Chủ đề",
      type: "select",
      as: "select",
      placeholder: "Lựa chọn",
      options: [
        "",
        "Vấn đề kỹ thuật",
        "Thanh toán",
        "Dịch vụ khách hàng",
        "Khác",
      ],
    },
    {
      name: "details",
      label: "Chi tiết",
      as: "textarea",
      placeholder: "Nhập mô tả chi tiết",
    },
    {
      name: "name",
      label: "Họ tên",
      placeholder: "Nguyễn Văn A",
    },
    {
      name: "phone",
      label: "Số điện thoại",
      placeholder: "0123456789",
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "example@email.com",
    },
    {
      name: "contactPreference",
      label: "Ưu tiên liên hệ qua",
      type: "radio",
      options: [
        { value: "Gọi điện thoại", label: "Gọi điện thoại" },
        {
          value: "Chat với Chăm sóc khách hàng",
          label: "Chat với Chăm sóc khách hàng",
        },
        { value: "Email", label: "Email" },
      ],
    },
    {
      name: "vehiclePlate",
      label: "Biển số xe",
      placeholder: "Nhập biển số xe",
    },
  ];

  const handleSubmit = (values) => {
    console.log("Adding new request:", values);
    addRequest(values);
    setIsModalOpen(false);
    alert(" Yêu cầu hỗ trợ đã được gửi thành công!");
  };

  return (
    <div className="max-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <TabSection />
          <ContentArea />
        </div>

        {/* Button tạo yêu cầu mới - sử dụng component Button có sẵn */}
        <div className="fixed bottom-8 right-8">
          <Button onclick={() => setIsModalOpen(true)}>Tạo yêu cầu mới</Button>
        </div>

        {isModalOpen && (
          <SupportRequestForm
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
};

// Component chính với Provider
const SupportRequest = () => {
  return (
    <SupportRequestProvider>
      <SupportRequestContent />
    </SupportRequestProvider>
  );
};

export default SupportRequest;
