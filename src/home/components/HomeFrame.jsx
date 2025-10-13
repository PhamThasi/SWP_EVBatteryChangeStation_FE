import React, { useEffect, useState } from "react";

import "./HomeFrame.css";
import ServiceCard from "./ServiceCard";
import carVideo from "./../../assets/reviewCar.mp4";
import swapBatter from "../../assets/swap-removebg-preview.png";
import destination from "../../assets/destination_charging-removebg-preview.png";
import charger from "../../assets/charger-removebg-preview.png";
import onclickforpower from "../../assets/onclickforpower-removebg-preview.png";
import mapPower from "../../assets/powerMap-removebg-preview.png";
import SectionVideo from "../../assets/swapingCar.mp4";
import tramsac_evt from "./../../assets/tramsac_evt.jpg";
import tramsac_testla from "./../../assets/tramsac_testla.jpg";
import tramsac_vinfast from "./../../assets/tramsac_vinfast.jpg";
const HomeFrame = () => {
  useEffect(() => {
    const reveals = document.querySelectorAll(".reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
          }
        });
      },
      { threshold: 0.2 }
    );

    reveals.forEach((el) => observer.observe(el));

    return () => {
      reveals.forEach((el) => observer.unobserve(el));
    };
  }, []);

  // fake data các trạm pin
  const stations = [
    {
      id: 1,
      name: "Ev-ONE",
      address: "Quận 2, TP. HCM",
      status: "Available",
      openTime: "06:00 - 22:00",
      imageUrl: tramsac_evt,
    },
    {
      id: 2,
      name: "TESLAT",
      address: "Quận 1, TP. HCM",
      status: "Busy",
      openTime: "07:00 - 23:00",
      imageUrl: tramsac_testla,
    },
    {
      id: 3,
      name: "VINFAST-Thảo Điền",
      address: "Thảo Điền, TP. HCM",
      status: "Available",
      openTime: "24/7",
      imageUrl: tramsac_vinfast,
    },
  ];

  return (
    <div className="home-frame">
      {/* video nền xe */}
      <div className="car-video">
        <video src={carVideo} autoPlay muted loop playsInline></video>
      </div>

      {/* Genki Power section */}
      <div className="power-service-container reveal">
        <h1>An Innovative Smart Power Service Solution</h1>
        <p className="genki-text">
          Genki Power là giải pháp năng lượng di động dựa trên internet với mạng
          lưới rộng khắp phục vụ sạc pin và thay pin. Được hỗ trợ bởi Power
          Cloud, Genki Power cung cấp hệ thống dịch vụ điện năng với pin có thể
          sạc, thay thế và nâng cấp, đáp ứng mọi nhu cầu của người dùng.
        </p>
        <div className="power-service-block">
          <div className="power-service-items">
            <div className="power-service-logo">
              <ul className="power-service-logo-ui">
                <li>
                  <img src={swapBatter} alt="Power Swap Station" />
                  <p>Power Swap Station</p>
                </li>
                <li>
                  <img src={charger} alt="Power Charger" />
                  <p>Power Charger</p>
                </li>
                <li>
                  <img src={destination} alt="Destination Charging" />
                  <p>Destination Charging</p>
                </li>
                <li>
                  <img src={onclickforpower} alt="One Click for Power" />
                  <p>One Click for Power</p>
                </li>
                <li>
                  <img src={mapPower} alt="Power Map" />
                  <p>Power Map</p>
                </li>
              </ul>
            </div>
            <hr />
            <p>On The Road</p>
          </div>
        </div>
      </div>

      {/* video section */}
      <div className="Section-video reveal">
        <video src={SectionVideo} autoPlay muted loop playsInline></video>
      </div>

      {/* section trạm pin */}
      <div className="station-section">
        <h3>Trạm pin tiêu biểu</h3>
        <div className="station-cards">
          {stations.map((station) => (
            <div key={station.id} className="station-card">
              {/* //   <img src={station.imageUrl} alt={station.name} />
              // <h4>{station.name}</h4> */}
              <ServiceCard image={station.imageUrl} title={station.name}>
                <p>📍 {station.address}</p>
                <p>⏰ {station.openTime}</p>
                <p>⚡ Trạng thái: {station.status}</p>
              </ServiceCard>
            </div>
          ))}
        </div>
      </div>

      {/* service packages */}
      <div className="service-section">
        <h3>Các gói dịch vụ Swap Pin</h3>
        <div className="service-cards">
          <ServiceCard title="Gói Cơ Bản">
            <ul style={{listStyle:"none"}}>
              <li>🔁 Swap từng lần – trả tiền theo mỗi lượt đổi pin</li>
              <li>
                💡 Phù hợp với tài xế ít di chuyển hoặc sử dụng không thường
                xuyên
              </li>
              <li>💸 Không cần cam kết tháng – linh hoạt, dùng khi cần</li>
              <li>📱 Quản lý và thanh toán dễ dàng qua ứng dụng</li>
            </ul>
          </ServiceCard>

          <ServiceCard title="Gói Tiết Kiệm">
            <ul style={{listStyle:"none"}}> 
              <li>
                📦 Thuê pin theo tháng, giá thấp hơn 20–30% so với gói cơ bản
              </li>
              <li>
                🔁 Bao gồm <b>10–15 lượt swap miễn phí mỗi tháng</b>
              </li>
              <li>⚡ Ưu tiên tại trạm khi đổi pin trong giờ cao điểm</li>
              <li>📊 Theo dõi số lần swap còn lại ngay trên app</li>
              <li>💳 Thanh toán tự động – có thể gia hạn gói dễ dàng</li>
            </ul>
          </ServiceCard>

          <ServiceCard title="Gói Premium">
            <ul style={{listStyle:"none"}} >
              <li>🔋 Swap không giới hạn – đổi pin bất cứ lúc nào</li>
              <li>🧰 Bảo dưỡng & kiểm tra tình trạng pin định kỳ miễn phí</li>
              <li>🚗 Ưu tiên hàng đầu tại mọi trạm trên hệ thống</li>
              <li>💬 Hỗ trợ kỹ thuật 24/7 qua hotline hoặc app</li>
              <li>🎁 Giảm giá 10–15% khi đăng ký thêm phương tiện khác</li>
            </ul>
          </ServiceCard>
        </div>
      </div>

      {/* map placeholder */}
      <div className="map-placeholder">
        <h2>Bản đồ trạm đổi pin gần nhất (Google Map API sau này)</h2>
        <div className="map-animation">🌍 [Map nền hoặc animation ở đây]</div>
      </div>
    </div>
  );
};

export default HomeFrame;
