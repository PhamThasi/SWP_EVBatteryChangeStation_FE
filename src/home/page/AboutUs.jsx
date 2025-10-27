import React, { useEffect } from "react";
import { Zap, Battery, Clock, DollarSign, Users, BarChart3, AlertTriangle, Settings, CheckCircle2, TrendingUp } from "lucide-react";

function usePageTitle(title) {
  useEffect(() => {
    const prev = document.title;
    document.title = title ? `${title} · EV Swap` : "EV Swap";
    return () => { document.title = prev; };
  }, [title]);
}

const AboutUs = () => {
  usePageTitle("About");

  const valueProps = [
    {
      title: "Nhanh & tiện",
      description: "Đặt lịch trước, check tình trạng pin, tới trạm đổi trong vài phút.",
      icon: Zap,
      gradient: "from-amber-500 to-orange-600"
    },
    {
      title: "Vận hành tối ưu",
      description: "Quản lý tồn kho pin (đầy/đang sạc/bảo dưỡng), cảnh báo thiếu hàng.",
      icon: Settings,
      gradient: "from-blue-500 to-cyan-600"
    },
    {
      title: "Minh bạch chi phí",
      description: "Thanh toán theo lượt/ theo gói, hoá đơn & lịch sử rõ ràng.",
      icon: DollarSign,
      gradient: "from-emerald-500 to-teal-600"
    },
  ];

  const coreFeatures = [
    {
      title: "Cho Tài xế (EV Driver)",
      roleColor: "blue",
      gradient: "from-blue-500 to-indigo-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      items: [
        { text: "Đăng ký, liên kết xe (VIN, loại pin)", icon: CheckCircle2 },
        { text: "Tìm trạm gần nhất, xem pin sẵn có", icon: Battery },
        { text: "Đặt lịch đổi pin trước", icon: Clock },
        { text: "Thanh toán theo lượt / theo gói", icon: DollarSign },
        { text: "Quản lý hoá đơn, lịch sử giao dịch", icon: BarChart3 },
      ],
    },
    {
      title: "Cho Nhân viên Trạm",
      roleColor: "purple",
      gradient: "from-purple-500 to-pink-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      items: [
        { text: "Theo dõi tồn kho: pin đầy/đang sạc/bảo dưỡng", icon: Battery },
        { text: "Tiếp nhận & xử lý lịch đặt đổi pin", icon: Clock },
        { text: "Ghi nhận bảo dưỡng, lỗi pin, bảo hành", icon: AlertTriangle },
        { text: "Quản lý ca làm, phân công công việc", icon: Users },
      ],
    },
    {
      title: "Cho Quản trị (Admin)",
      roleColor: "emerald",
      gradient: "from-emerald-500 to-green-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      items: [
        { text: "Quản lý người dùng, trạm, danh mục pin", icon: Users },
        { text: "Cấu hình gói dịch vụ, giá, khuyến mãi", icon: Settings },
        { text: "Báo cáo doanh thu, công suất, tần suất đổi", icon: TrendingUp },
        { text: "Cảnh báo khi tồn kho < ngưỡng (vd: 20%)", icon: AlertTriangle },
      ],
    },
  ];

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      {/* Hero Section - More Dynamic */}
      <section className="relative pt-24 pb-20 px-6 sm:px-10 overflow-hidden mt-24">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 opacity-60"></div>
        <div className="absolute top-20 right-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-700"></div>
        
        <div className="relative max-w-5xl mx-auto text-center">
          {/* Logo Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg">
            <Zap className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 tracking-tight leading-tight">
            EV Battery Swap Station
            <span className="block mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Management System
            </span>
          </h1>
          
          <p className="mt-8 max-w-3xl mx-auto text-lg sm:text-xl leading-relaxed text-gray-600">
            Giải pháp quản lý trạm đổi pin xe điện — tối ưu trải nghiệm người lái và
            nâng hiệu suất vận hành trạm. Đặt lịch nhanh, đổi pin tức thì, dữ liệu minh bạch.
          </p>
        </div>
      </section>

      {/* Value Props - With Icons & Gradients */}
      <section className="px-6 sm:px-10 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid gap-8 md:grid-cols-3">
            {valueProps.map((value, index) => {
              const Icon = value.icon;
              return (
                <div 
                  key={index} 
                  className="group relative overflow-hidden rounded-3xl bg-white p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-transparent hover:-translate-y-1"
                >
                  {/* Gradient background on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${value.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                  
                  {/* Icon with gradient */}
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${value.gradient} shadow-lg mb-6`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Core Features - Role-based Cards */}
      <section className="px-6 sm:px-10 py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tính năng cốt lõi
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Được thiết kế riêng cho từng vai trò người dùng
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {coreFeatures.map((feature, i) => (
              <article 
                key={i} 
                className={`group relative overflow-hidden rounded-3xl bg-white border-2 ${feature.borderColor} shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-2`}
              >
                {/* Header with gradient */}
                <div className={`relative px-6 pt-6 pb-4 bg-gradient-to-br ${feature.gradient}`}>
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-5 transition-opacity"></div>
                  <h3 className="relative text-xl font-bold text-white">
                    {feature.title}
                  </h3>
                </div>

                {/* Features list */}
                <div className={`p-6 ${feature.bgColor} bg-opacity-30`}>
                  <ul className="space-y-3">
                    {feature.items.map((item, idx) => {
                      const ItemIcon = item.icon;
                      return (
                        <li key={idx} className="flex items-start gap-3 group/item">
                          <div className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-gradient-to-br ${feature.gradient} flex items-center justify-center`}>
                            <ItemIcon className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-gray-700 leading-relaxed group-hover/item:text-gray-900 transition-colors">
                            {item.text}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Vision & Mission - Enhanced */}
      <section className="px-6 sm:px-10 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-12 shadow-2xl">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-10"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-10"></div>
            
            <div className="relative text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-2xl bg-white bg-opacity-20 backdrop-blur-sm">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Tầm nhìn & Sứ mệnh
              </h2>
              <p className="text-lg sm:text-xl text-blue-50 leading-relaxed max-w-3xl mx-auto">
                Xây dựng nền tảng đổi pin xe điện tin cậy, mở rộng dễ dàng và kết nối đa trạm,
                hướng tới giao thông xanh – thông minh.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;