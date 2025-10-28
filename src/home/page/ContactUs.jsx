import React, { useState } from "react";
// Thêm icon từ thư viện react-icons
import { FiSend, FiMapPin, FiMail } from "react-icons/fi";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const messageData = `
      === Contact Message ===
      Name: ${formData.name}
      Email: ${formData.email}
      Message: ${formData.message}
    `;
    console.log(messageData);

    alert("Cảm ơn bạn đã liên hệ! Thông tin của bạn đã được gửi đi.");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    // Container chính, căn giữa nội dung
    <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 py-16 px-6">
      
      {/* Thẻ (Card) chính chứa 2 cột */}
      <div className="w-full max-w-6xl bg-white shadow-2xl rounded-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* === CỘT TRÁI: THÔNG TIN === */}
        <div className="w-full md:w-1/2 bg-gradient-to-r from-[#0077b6] to-[#00b4d8] text-white p-12 flex flex-col justify-center">
          <h1 className="text-4xl font-bold mb-4">
            Liên hệ với Chúng tôi 
          </h1>
          <p className="text-lg leading-relaxed mb-8">
            Chúng tôi giúp các tài xế và đối tác trên khắp Việt Nam quản lý trải nghiệm đổi pin một cách hiệu quả. Gửi tin nhắn cho chúng tôi — chúng tôi rất mong được lắng nghe từ bạn!
          </p>
          {/* Thêm thông tin liên hệ cơ bản */}
          <div className="space-y-4">
            <div className="flex items-center">
              <FiMail className="w-5 h-5 mr-3 flex-shrink-0" />
              <span>hotro@viduxedien.vn</span>
            </div>
            <div className="flex items-center">
              <FiMapPin className="w-5 h-5 mr-3 flex-shrink-0" />
              <span>Đường D1, Khu Công nghệ cao, Phường Long Thạnh Mỹ, Thành Phố Thủ Đức, TP. Hồ Chí Minh</span>
            </div>
          </div>
        </div>

        {/* === CỘT PHẢI: FORM LIÊN HỆ === */}
        <div className="w-full md:w-1/2 p-12">
          <h2 className="text-3xl font-bold text-[#001f54] mb-8">
            Gửi tin nhắn cho chúng tôi
          </h2>
          <form onSubmit={handleSubmit}>
            {/* Name */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Họ và tên<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Họ và tên của bạn"
              />
            </div>

            {/* Email */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Email<span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="vidu@gmail.com"
              />
            </div>

            {/* Message */}
            <div className="mb-8">
              <label className="block text-gray-700 font-semibold mb-2">
                Chúng tôi có thể giúp gì cho bạn?<span className="text-red-500">*</span>
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 h-36 resize-none outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Hãy cho chúng tôi biết về yêu cầu của bạn..."
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#0077b6] to-[#00b4d8] hover:from-[#005f8e] hover:to-[#0077b6] text-white font-semibold py-3 px-6 rounded-lg shadow-md transition flex items-center justify-center"
            >
              GỬI TIN NHẮN
              <FiSend className="ml-2 w-5 h-5" />
            </button>
          </form>
        </div>
        
      </div>
    </div>
  );
};

export default ContactUs;