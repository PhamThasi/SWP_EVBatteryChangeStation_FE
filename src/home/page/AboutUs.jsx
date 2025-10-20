import React, { useEffect } from "react";
import NavBar from "./../components/NavBar";
import Footer from "./../components/footer/footer";

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
      description:
        "Đặt lịch trước, check tình trạng pin, tới trạm đổi trong vài phút.",
    },
    {
      title: "Vận hành tối ưu",
      description:
        "Quản lý tồn kho pin (đầy/đang sạc/bảo dưỡng), cảnh báo thiếu hàng.",
    },
    {
      title: "Minh bạch chi phí",
      description:
        "Thanh toán theo lượt/ theo gói, hoá đơn & lịch sử rõ ràng.",
    },
  ];

  const coreFeatures = [
    {
      title: "Cho Tài xế (EV Driver)",
      items: [
        "Đăng ký, liên kết xe (VIN, loại pin)",
        "Tìm trạm gần nhất, xem pin sẵn có",
        "Đặt lịch đổi pin trước",
        "Thanh toán theo lượt / theo gói",
        "Quản lý hoá đơn, lịch sử giao dịch",
      ],
    },
    {
      title: "Cho Nhân viên Trạm",
      items: [
        "Theo dõi tồn kho: pin đầy/đang sạc/bảo dưỡng",
        "Tiếp nhận & xử lý lịch đặt đổi pin",
        "Ghi nhận bảo dưỡng, lỗi pin, bảo hành",
        "Quản lý ca làm, phân công công việc",
      ],
    },
    {
      title: "Cho Quản trị (Admin)",
      items: [
        "Quản lý người dùng, trạm, danh mục pin",
        "Cấu hình gói dịch vụ, giá, khuyến mãi",
        "Báo cáo doanh thu, công suất, tần suất đổi",
        "Cảnh báo khi tồn kho < ngưỡng (vd: 20%)",
      ],
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">

      {/* Hero */}
      <section className="mt-16 px-6 sm:px-10 py-12 sm:py-20 text-center bg-gradient-to-b from-blue-100 to-white">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[#001f54] tracking-tight">
          EV Battery Swap Station Management System
        </h1>
        <p className="mt-6 max-w-3xl mx-auto text-base sm:text-lg leading-relaxed text-gray-700">
          Giải pháp quản lý trạm đổi pin xe điện — tối ưu trải nghiệm người lái và
          nâng hiệu suất vận hành trạm. Đặt lịch nhanh, đổi pin tức thì, dữ liệu minh bạch.
        </p>
      </section>

      {/* Value Props */}
      <section className="px-6 sm:px-10 py-12 bg-white">
        <div className="max-w-5xl mx-auto grid gap-8 sm:grid-cols-3">
          {valueProps.map((v, i) => (
            <div key={i} className="p-6 rounded-2xl bg-gray-50 shadow-sm hover:shadow-md transition">
              <h3 className="text-xl font-semibold text-[#001f54]">{v.title}</h3>
              <p className="mt-3 text-gray-700">{v.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Core Features */}
      <section className="px-6 sm:px-10 py-16 bg-blue-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-[#001f54] text-center">Tính năng cốt lõi</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {coreFeatures.map((f, i) => (
              <div key={i} className="p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition">
                <h3 className="text-lg font-semibold text-[#001f54]">{f.title}</h3>
                <ul className="mt-3 list-disc list-inside text-gray-700 space-y-1">
                  {f.items.map((it, idx) => <li key={idx}>{it}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 sm:px-10 py-16 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-[#001f54]">Tầm nhìn & Sứ mệnh</h2>
          <p className="mt-6 text-lg text-gray-700 leading-relaxed">
            Xây dựng nền tảng đổi pin xe điện tin cậy, mở rộng dễ dàng và kết nối đa trạm,
            hướng tới giao thông xanh – thông minh.
          </p>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
