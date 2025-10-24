import React, { useState } from "react";

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
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-blue-50 py-16 px-6">

      <div className="text-center max-w-2xl mb-10">
        <h1 className="text-4xl font-bold text-[#001f54] mb-3">
          LET’S TALK ⚡
        </h1>
        <p className="text-gray-600 leading-relaxed">
          We help drivers and partners across Vietnam manage their battery swap
          experience efficiently. Drop us a message — we’d love to hear from you!
        </p>
      </div>

      {/*  Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-lg border border-gray-100"
      >
        {/* Name */}
        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">
            Name<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="Your full name"
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
            placeholder="example@gmail.com"
          />
        </div>

        {/* Message */}
        <div className="mb-8">
          <label className="block text-gray-700 font-semibold mb-2">
            How can we help?<span className="text-red-500">*</span>
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-3 h-32 resize-none outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="Tell us about your request..."
          />
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-[#0077b6] to-[#00b4d8] hover:from-[#005f8e] hover:to-[#0077b6] text-white font-semibold py-3 rounded-lg shadow-md transition"
        >
          SEND MESSAGE
        </button>
      </form>
    </div>
  );
};

export default ContactUs;
