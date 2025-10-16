import React from "react";
import * as Yup from "yup";
import ModalForm from "../modalForm/ModalForm";

const SupportRequestForm = ({ isOpen, onClose, onSubmit }) => {
  if (!isOpen) return null;

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

  const fields = [
    {
      name: "supportType",
      label: "Hỗ trợ",
      as: "select",
      type: "select",
      options: ["Hỗ trợ dịch vụ Xe", "Hỗ trợ dịch vụ Sạc"],
    },
    { name: "title", label: "Tiêu đề", placeholder: "Tiêu đề yêu cầu" },
    {
      name: "vehicle",
      label: "Phương tiện",
      as: "select",
      type: "select",
      options: ["Không", "Xe máy", "Ô tô"],
    },
    {
      name: "topic",
      label: "Chủ đề",
      as: "select",
      type: "select",
      options: ["Vấn đề kỹ thuật", "Thanh toán", "Dịch vụ khách hàng", "Khác"],
    },
    { name: "details", label: "Chi tiết", as: "textarea" },
    { name: "name", label: "Họ tên", placeholder: "Nguyễn Văn A" },
    { name: "phone", label: "Số điện thoại", placeholder: "0123456789" },
    { name: "email", label: "Email", type: "email", placeholder: "example@email.com" },
    {
      name: "contactPreference",
      label: "Ưu tiên liên hệ qua",
      as: "select",
      type: "select",
      options: ["Gọi điện thoại", "Chat với Chăm sóc khách hàng", "Email"],
    },
    { name: "vehiclePlate", label: "Biển số xe" },
  ];

  return (
    <ModalForm
      title="Yêu cầu mới"
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
      onClose={onClose}
      fields={fields}
    />
  );
};

export default SupportRequestForm;
