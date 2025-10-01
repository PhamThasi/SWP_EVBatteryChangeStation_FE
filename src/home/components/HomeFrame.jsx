import React, { useEffect, useState } from "react";

import "./HomeFrame.css";
import ServiceCard from "./ServiceCard";
import carVideo from "./../../assets/reviewCar.mp4";
import swapBatter from "../../assets/swap-removebg-preview.png";
import destination from "../../assets/destination_charging-removebg-preview.png";
import charger from "../../assets/charger-removebg-preview.png";
import onclickforpower from "../../assets/onclickforpower-removebg-preview.png";
import mapPower from "../../assets/powerMap-removebg-preview.png";
const HomeFrame = () => {
  const [carInfo, setCarInfo] = useState(null);
  useEffect(() => {
    const reveals = document.querySelectorAll(".reveal"); // <-- ALL

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

    // cleanup để tránh memory leak
    return () => {
      reveals.forEach((el) => observer.unobserve(el));
    };
  }, []);
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
      <div className="car-video" autoPlay muted loop playsInline>
        <video src={carVideo}></video>
      </div>
      {/* giới thiệu về trạm sạc */}
      <div className="power-service-container reveal">
        <h1>An Innovative Smart Power Service Solution</h1>
        <p className="genki-text">
          Genki Power is a mobile internet-based power solution with extensive
          networks for battery charging and battery swap facilities. Enhanced by
          Power Cloud, it offers a power service system with chargeable,
          swappable and upgradable batteries to provide users with power
          services catering to all scenarios.
        </p>
        <div className="power-service-block">
          <div className="power-service-items">
            <div className="power-service-logo">
              <ul className="power-service-logo-ui">
                <li>
                  <img src={swapBatter} alt="" />
                  <p>Power Swap Station</p>
                </li>
                <li>
                  <img src={charger} alt="" />
                  <p>Power Charger</p>
                </li>
                <li>
                  <img src={destination} alt="" />
                  <p>Destination Charging</p>
                </li>
                <li>
                  <img src={onclickforpower}alt="" />
                  <p>One Click for Power</p>
                </li>
                <li>
                  <img src={mapPower} alt="" />
                  <p>Power Map</p>
                </li>
              </ul>
            </div>
            <hr />
            <p>On The Road</p>
          </div>
        </div>
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
          <ServiceCard
            title="Gói Cơ Bản"
            content="Swap từng lần. Thanh toán theo lượt."
          />
          <ServiceCard
            title="Gói Tiết Kiệm"
            content="Thuê pin theo tháng. Bao gồm số lần swap cố định."
          />
          <ServiceCard
            title="Gói Premium"
            content="Swap không giới hạn + bảo dưỡng pin nâng cao."
          />
        </div>
      </div>
      {/* Map Placeholder */}
      <div className="map-placeholder">
        <h2>Bản đồ trạm đổi pin gần nhất (Google Map API sau này)</h2>
        <div className="map-animation">🌍 [Map nền hoặc animation ở đây]</div>
      </div>
    </div>
  );
};

export default HomeFrame;
