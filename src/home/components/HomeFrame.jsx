// src/pages/Home/HomeFrame.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HomeFrame.css";
import ServiceCard from "./ServiceCard";
import ServiceIcon from "./ServiceIcon"; // Mới
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
import VietMapPlaces from "@/components/MapAPI/VietMapPlaces";
import stationService from "@/api/stationService";
import batteryService from "@/api/batteryService";
import { vietmapService } from "@/api/vietmapService";
import subcriptionService from "@/api/subcriptionService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLocationDot,
  faPhone,
  faCircleCheck,
  faCirclePause,
  faBatteryFull,
  faBolt,
  faMapMarkedAlt,
  faSyncAlt,
  faChargingStation,
  faMobileAlt,
} from "@fortawesome/free-solid-svg-icons";

const HomeFrame = () => {
  const navigate = useNavigate();
  const API_KEY = import.meta.env.VITE_APP_VIETMAP_API_KEY;
  const [userLocation, setUserLocation] = useState(null);

  // Reveal animation
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
    return () => reveals.forEach((el) => observer.unobserve(el));
  }, []);

  // Fetch stations
  const [stations, setStations] = useState([]);
  const [mapStations, setMapStations] = useState([]);
  const [batteryCounts, setBatteryCounts] = useState({});
  const [stationsLoading, setStationsLoading] = useState(false);
  const [stationsError, setStationsError] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(false);
  const [subscriptionsError, setSubscriptionsError] = useState(null);

  const stationImages = {
    "4c95752b-73d7-4320-ac81-5603cb639f40": tramsac_evt,
    "d2fce48f-71f7-4a1c-9a04-2a60d97dcaaa": tramsac_testla,
    "b5c61b0d-8a3d-4f35-91f8-4a5d6c13c2d4": tramsac_evt,
  };

  useEffect(() => {
    const fetchStations = async () => {
      try {
        setStationsLoading(true);
        setStationsError(null);
        const data = await stationService.getStationList();
        const stationsList = Array.isArray(data) ? data : [];
        setStations(stationsList);

        // Tính số pin cho mỗi trạm
        const counts = {};
        for (const station of stationsList) {
          try {
            const count = await batteryService.getBatteryCountByStationId(station.stationId);
            counts[station.stationId] = count;
          } catch (err) {
            console.warn(`Không thể đếm pin cho trạm ${station.stationId}:`, err);
            counts[station.stationId] = 0;
          }
        }
        setBatteryCounts(counts);
      } catch {
        setStations([]);
        setStationsError("Không tải được danh sách trạm");
      } finally {
        setStationsLoading(false);
      }
    };
    fetchStations();
  }, []);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        setSubscriptionsLoading(true);
        setSubscriptionsError(null);
        const res = await subcriptionService.getSubscriptions();
        const raw =
          res?.data?.data ||
          res?.data ||
          res?.Data ||
          res?.Data?.data ||
          res;
        const arr = Array.isArray(raw) ? raw : raw?.data || raw?.Data || [];
        setSubscriptions(Array.isArray(arr) ? arr : []);
      } catch (error) {
        console.error("Không thể tải gói dịch vụ:", error);
        setSubscriptionsError("Không thể tải danh sách gói dịch vụ");
        setSubscriptions([]);
      } finally {
        setSubscriptionsLoading(false);
      }
    };
    fetchSubscriptions();
  }, []);

  // Get user location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.longitude, position.coords.latitude]);
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  useEffect(() => {
    if (!API_KEY || stations.length === 0) {
      setMapStations([]);
      return;
    }

    let cancelled = false;

    const enrichStations = async () => {
      try {
        const enriched = await Promise.all(
          stations.map(async (station, index) => {
            const address = station.address;
            if (!address) return null;

            const coords = await vietmapService.geocodeAddress(API_KEY, address);
            if (!coords) return null;

            return {
              ...station,
              lat: coords.lat,
              lng: coords.lng,
              name:
                station.accountName ||
                station.name ||
                `Station ${station.stationId || station.id || index + 1}`,
            };
          })
        );

        if (!cancelled) {
          setMapStations(enriched.filter(Boolean));
        }
      } catch (error) {
        console.error("Không thể geocode danh sách trạm:", error);
        if (!cancelled) {
          setMapStations([]);
        }
      }
    };

    enrichStations();

    return () => {
      cancelled = true;
    };
  }, [API_KEY, stations]);

  const navigateTo = (path) => () => navigate(path);
  const formatCurrency = (value) => {
    if (value === null || value === undefined) return "Liên hệ";
    const number = Number(value);
    if (Number.isNaN(number)) return String(value);
    return `${number.toLocaleString("vi-VN")} đ`;
  };

  const normalizeDescription = (description) => {
    if (!description) return [];
    return description
      .replace(/\\n/g, "\n")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  };

  return (
    <div className="home-frame">
      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="car-video">
          <video src={carVideo} autoPlay muted loop playsInline />
          <div className="hero-overlay">
            <div className="hero-content reveal">
              <h1>
                <span className="highlight">Genki Power</span>
                <br />
                Năng Lượng Di Động Thông Minh
              </h1>
              <p>Đổi pin trong 3 phút • Sạc nhanh • Mạng lưới toàn quốc</p>
              <div className="hero-actions">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={navigateTo("/stations")}
                >
                  Tìm trạm gần nhất
                </button>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={navigateTo("/subscriptions")}
                >
                  Xem gói dịch vụ
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GENKI POWER INTRO */}
      <section className="genki-intro reveal">
        <div className="container">
          <h2>Giải Pháp Năng Lượng Thông Minh</h2>
          <div className="intro-grid">
            <p>
              <strong>Genki Power</strong> là hệ thống năng lượng di động dựa trên internet với mạng lưới trạm rộng khắp.
            </p>
            <p>
              Được hỗ trợ bởi <strong>Power Cloud</strong>, chúng tôi cung cấp pin có thể <strong>sạc, thay thế, nâng cấp</strong> — đáp ứng mọi nhu cầu.
            </p>
          </div>
          <button
            type="button"
            className="btn-outline mt-4"
            onClick={navigateTo("/about")}
          >
            Tìm hiểu thêm →
          </button>
        </div>
      </section>

      {/* SERVICE ICONS */}
      <section className="services-icons reveal">
        <div className="container">
          <div className="icon-grid">
            <ServiceIcon
              icon={swapBatter}
              title="Power Swap Station"
              desc="Đổi pin trong 3 phút tại trạm"
              faIcon={faSyncAlt}
            />
            <ServiceIcon
              icon={charger}
              title="Power Charger"
              desc="Sạc nhanh DC 120kW"
              faIcon={faBolt}
            />
            <ServiceIcon
              icon={destination}
              title="Destination Charging"
              desc="Sạc tại khách sạn, TTTM"
              faIcon={faChargingStation}
            />
            <ServiceIcon
              icon={onclickforpower}
              title="One Click for Power"
              desc="Gọi pin tận nơi qua app"
              faIcon={faMobileAlt}
            />
            <ServiceIcon
              icon={mapPower}
              title="Power Map"
              desc="Tìm trạm gần nhất"
              faIcon={faMapMarkedAlt}
            />
          </div>
        </div>
      </section>

      {/* VIDEO SECTION */}
      <section className="video-section reveal">
        <div className="container">
          <div className="video-header">
            <h3>
              Trải nghiệm <span className="highlight">đổi pin chỉ trong 3 phút</span>
            </h3>
          </div>
          <video src={SectionVideo} autoPlay muted loop playsInline className="swap-video" />
        </div>
      </section>

      {/* STATIONS */}
      <section className="stations-section reveal">
        <div className="container">
          <h3>Trạm Pin Tiêu Biểu</h3>
          <div className="station-grid">
            {stationsLoading && (
              <ServiceCard image={tramsac_vinfast} title="Đang tải...">
                <p>Đang tải danh sách trạm...</p>
              </ServiceCard>
            )}
            {stationsError && (
              <ServiceCard image={tramsac_vinfast} title="Lỗi">
                <p>{stationsError}</p>
              </ServiceCard>
            )}
            {stations.map((station) => {
              const id = station.stationId || station.id;
              const title = station.accountName || station.name || `Station ${id}`;
              const address = station.address || "Địa chỉ đang cập nhật";
              const phone = station.phoneNumber || "Chưa cập nhật";
              const batteries = batteryCounts[id] ?? 0;
              const isActive = station.status !== false;
              const imageUrl = stationImages[id] || tramsac_vinfast;

              return (
                <div key={id} className="station-card-wrapper">
                  <ServiceCard image={imageUrl} title={title}>
                    <p><FontAwesomeIcon icon={faLocationDot} /> {address}</p>
                    <p><FontAwesomeIcon icon={faPhone} /> {phone}</p>
                    <p><FontAwesomeIcon icon={faBatteryFull} /> {batteries} pin sẵn có</p>
                    <div className="station-footer">
                      <span className={`status-badge ${isActive ? "active" : "paused"}`}>
                        <FontAwesomeIcon icon={isActive ? faCircleCheck : faCirclePause} />{" "}
                        {isActive ? "Hoạt động" : "Tạm ngưng"}
                      </span>
                      <button
                        type="button"
                        className="btn-directions"
                        onClick={navigateTo("/stations")}
                      >
                        Chỉ đường
                      </button>
                    </div>
                  </ServiceCard>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SERVICE PACKAGES */}
      <section className="packages-section reveal">
        <div className="container">
          <h3>Các Gói Dịch Vụ Swap Pin</h3>
          <div className="package-grid">
            {subscriptionsLoading && (
              <ServiceCard title="Đang tải...">
                <p className="text-gray-600">Đang tải gói dịch vụ...</p>
              </ServiceCard>
            )}

            {subscriptionsError && !subscriptionsLoading && (
              <ServiceCard title="Không thể tải dữ liệu">
                <p className="text-red-500">{subscriptionsError}</p>
                <button
                  type="button"
                  className="btn-select mt-4"
                  onClick={navigateTo("/subscriptions")}
                >
                  Xem chi tiết tại trang gói dịch vụ
                </button>
              </ServiceCard>
            )}

            {!subscriptionsLoading &&
              !subscriptionsError &&
              (subscriptions.length === 0 ? (
                <ServiceCard title="Chưa có gói dịch vụ">
                  <p className="text-gray-600">
                    Hiện chưa có gói dịch vụ nào được công bố. Vui lòng quay lại sau.
                  </p>
                </ServiceCard>
              ) : (
                subscriptions.slice(0, 3).map((subscription, index) => {
                  const perks = normalizeDescription(subscription.description);
                  const isPopular =
                    subscription.name?.toLowerCase().includes("tiết kiệm") ||
                    index === 1;

                  return (
                    <div
                      key={subscription.subscriptionId || subscription.name || index}
                      className={isPopular ? "package-popular" : undefined}
                    >
                      <ServiceCard
                        title={subscription.name || `Gói ${index + 1}`}
                        badge={isPopular ? "Phổ biến nhất" : undefined}
                      >
                        <p className="price">
                          {formatCurrency(subscription.price)}
                          {subscription.price ? (
                            <small className="ml-1">
                              {subscription.durationPackage
                                ? `/${subscription.durationPackage} ngày`
                                : "/tháng"}
                            </small>
                          ) : null}
                        </p>
                        {subscription.extraFee ? (
                          <p className="text-sm text-orange-500 mb-2">
                            + Phí phụ thu: {formatCurrency(subscription.extraFee)}
                          </p>
                        ) : null}
                        {perks.length > 0 ? (
                          <ul>
                            {perks.slice(0, 4).map((perk, perkIndex) => (
                              <li key={perkIndex}>{perk}</li>
                            ))}
                          </ul>
                        ) : (
                          <ul>
                            <li>Truy cập vào mạng lưới đổi pin Genki Power</li>
                            <li>Quản lý gói dịch vụ nhanh chóng trên ứng dụng</li>
                            <li>Ưu tiên hỗ trợ kỹ thuật 24/7</li>
                            <li>Chi tiết đầy đủ tại trang gói dịch vụ</li>
                          </ul>
                        )}
                        <button
                          type="button"
                          className="btn-select"
                          onClick={navigateTo("/subscriptions")}
                        >
                          Xem chi tiết
                        </button>
                      </ServiceCard>
                    </div>
                  );
                })
              ))}
          </div>
        </div>
      </section>

      {/* MAP SECTION */}
      <section className="map-section reveal">
        <div className="container">
          <h2>Tìm Trạm Đổi Pin Gần Nhất</h2>
          <p>Hệ thống <strong>hơn 50 trạm</strong> tại TP.HCM & các tỉnh lân cận</p>
          <div className="map-container">
            <VietMapPlaces
              stations={mapStations}
              API_KEY={API_KEY}
              userLocation={userLocation}
              mode="display"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomeFrame;