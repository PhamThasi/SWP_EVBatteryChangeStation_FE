import React, { useState } from "react";

import "./HomeFrame.css";
import ServiceCard from "./ServiceCard";

const HomeFrame = () => {
  const [carInfo, setCarInfo] = useState(null);

  const cars = [
    { id: 1, name: "VinFast VF8", year: 2023 },
    { id: 2, name: "Tesla Model 3", year: 2022 },
    { id: 3, name: "Hyundai Ioniq 5", year: 2024 },
  ];

  const handleSelectCar = (car) => {
    setCarInfo({
      ...car,
      battery: "Dung lượng khả dụng: 82 kWh",
      charging: "Sạc nhanh DC: 250kW",
      warranty: "Bảo hành pin: 8 năm hoặc 160.000 km",
    });
  };

  return (
    <div className="home-frame">
      {/* Map Placeholder */}
      <div className="map-placeholder">
        <h2>Bản đồ trạm đổi pin gần nhất (Google Map API sau này)</h2>
        <div className="map-animation">🌍 [Map nền hoặc animation ở đây]</div>
      </div>

      {/* Chọn xe */}
      <div className="car-section">
        <h3>Chọn xe của bạn</h3>
        <ul>
          {cars.map((car) => (
            <li key={car.id} onClick={() => handleSelectCar(car)}>
              {car.name} - {car.year}
            </li>
          ))}
        </ul>
      </div>

      {/* Thông tin pin */}
      {carInfo && (
        <div className="battery-info">
          <h3>Thông tin pin cho {carInfo.name}</h3>
          <p>{carInfo.battery}</p>
          <p>{carInfo.charging}</p>
          <p>{carInfo.warranty}</p>
        </div>
      )}

      {/* Gói dịch vụ */}
      <div className="service-section">
        <h3>Các gói dịch vụ Swap Pin</h3>
        <div className="service-cards">
          <ServiceCard title="Gói Cơ Bản" content="Swap từng lần. Thanh toán theo lượt." />
          <ServiceCard title="Gói Tiết Kiệm" content="Thuê pin theo tháng. Bao gồm số lần swap cố định." />
          <ServiceCard title="Gói Premium" content="Swap không giới hạn + bảo dưỡng pin nâng cao." />
        </div>
      </div>
    </div>
  );
};

export default HomeFrame;
