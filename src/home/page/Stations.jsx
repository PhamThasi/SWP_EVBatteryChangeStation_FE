import React, { useState, useEffect, useRef } from "react";
import VietMapPlaces from "@/components/MapAPI/VietMapPlaces";
import StationSearch from "@/components/MapAPI/StationSearch";
import stationService from "@/api/stationService";
import batteryService from "@/api/batteryService";
import { vietmapService } from "@/api/vietmapService";
import { MapPin, Navigation, Battery } from "lucide-react";
import { notifyWarning } from "@/components/notification/notification";

const Stations = () => {
  const API_KEY = import.meta.env.VITE_APP_VIETMAP_API_KEY;
  const [userLocation, setUserLocation] = useState(null);
  const [stations, setStations] = useState([]);
  const [stationsWithCoords, setStationsWithCoords] = useState([]);
  const [batteryCounts, setBatteryCounts] = useState({});
  const [route, setRoute] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);
  const destRef = useRef(null);

  // ========== LẤY VỊ TRÍ HIỆN TẠI LIÊN TỤC ==========
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setUserLocation([106.7, 10.77]);
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const newLocation = [pos.coords.longitude, pos.coords.latitude];
        setUserLocation(newLocation);

        if (destRef.current) updateRoute(newLocation, destRef.current);
      },
      (err) => {
        console.warn("⚠️ Không lấy được vị trí:", err);
        setUserLocation([106.7, 10.77]);
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // ========== LẤY DANH SÁCH TRẠM ==========
  useEffect(() => {
    const loadStations = async () => {
      try {
        const list = await stationService.getStationList();
        setStations(list);
        
        // Tính số pin cho mỗi trạm
        const counts = {};
        for (const station of list || []) {
          try {
            const count = await batteryService.getBatteryCountByStationId(station.stationId);
            counts[station.stationId] = count;
          } catch (err) {
            console.warn(`Không thể đếm pin cho trạm ${station.stationId}:`, err);
            counts[station.stationId] = 0;
          }
        }
        setBatteryCounts(counts);
        
        const withCoords = await Promise.all(
          list.map(async (s) => {
            const coords = await vietmapService.geocodeAddress(API_KEY, s.address);
            return coords
              ? {
                  ...s,
                  lat: coords.lat,
                  lng: coords.lng,
                  name: getCityFromAddress(s.address),
                  distance: userLocation ? calculateDistance(userLocation, [coords.lng, coords.lat]) : null,
                }
              : null;
          })
        );
        setStationsWithCoords(withCoords.filter(Boolean));
      } catch (err) {
        console.error("Không thể tải danh sách trạm:", err);
      }
    };
    if (API_KEY) loadStations();
  }, [API_KEY]);

  // ========== UPDATE DISTANCE KHI USER LOCATION THAY ĐỔI ==========
  useEffect(() => {
    if (userLocation && stationsWithCoords.length > 0) {
      const updated = stationsWithCoords.map(s => ({
        ...s,
        distance: calculateDistance(userLocation, [s.lng, s.lat])
      }));
      setStationsWithCoords(updated);
    }
  }, [userLocation]);

  // ========== TÍNH KHOẢNG CÁCH ==========
  const calculateDistance = (from, to) => {
    const [lon1, lat1] = from;
    const [lon2, lat2] = to;
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  // ========== LẤY TÊN THÀNH PHỐ TỪ ĐỊA CHỈ ==========
  const getCityFromAddress = (address) => {
    const parts = address.split(",");
    return parts[parts.length - 1].trim();
  };

  // ========== CLICK VÀO TRẠM ==========
  const handleStationClick = (station) => {
    setSelectedStation(station);
    if (userLocation && station.lat && station.lng) {
      destRef.current = { lat: station.lat, lng: station.lng };
      updateRoute(userLocation, destRef.current);
    }
  };

  // ========== XỬ LÝ KHI CHỌN TRẠM TỪ SEARCH ==========
  const handleStationSelectFromSearch = (station) => {
    setSelectedStation(station);
    if (userLocation && station.lat && station.lng) {
      destRef.current = { lat: station.lat, lng: station.lng };
      updateRoute(userLocation, destRef.current);
    } else {
      notifyWarning("Trạm này không có tọa độ để chỉ đường!");
    }
  };

  // ========== CẬP NHẬT ROUTE ==========
  const updateRoute = async (start, dest) => {
    try {
      const [userLat, userLng] = [start[1], start[0]];
      const routeUrl = `https://maps.vietmap.vn/api/route?api-version=1.1&apikey=${API_KEY}&point=${userLat},${userLng}&point=${dest.lat},${dest.lng}&points_encoded=false&vehicle=car`;
      
      const res = await fetch(routeUrl);
      const json = await res.json();
      const path = json?.paths?.[0];
      if (!path) return;

      setRoute({
        type: "Feature",
        geometry: path.points,
      });

      setRouteInfo({
        distance: (path.distance / 1000).toFixed(1),
        time: (path.time / 60000).toFixed(1),
        dest,
      });
    } catch (err) {
      console.error("Lỗi khi cập nhật route:", err);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 mt-[7rem]">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 px-6 py-10">
        <div className="max-w-7xl mx-auto">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-6xl font-bold text-gray-900 mb-4">
              Trạm Đổi Pin
            </h1>
            <p className="text-3xl text-gray-600">
              Danh sách và vị trí các trạm đổi pin trên toàn quốc
            </p>
          </div>

          {/* Search Bar */}
          <div className="w-full max-w-4xl mx-auto">
            <StationSearch
              onStationSelect={handleStationSelectFromSearch}
              API_KEY={API_KEY}
              userLocation={userLocation}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map Section - Takes 2 columns */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden relative">
              <VietMapPlaces
                stations={stationsWithCoords}
                route={route}
                routeInfo={routeInfo}
                userLocation={userLocation}
                API_KEY={API_KEY}
                mode="route"
              />
              
              {/* Route Info Overlay */}
              {routeInfo && (
                <div className="absolute top-6 left-6 bg-white rounded-lg shadow-lg px-6 py-4 z-10">
                  <div className="flex items-center gap-3 text-lg">
                    <Navigation className="w-6 h-6 text-blue-600" />
                    <span className="font-semibold">{routeInfo.distance} km</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600">{routeInfo.time} phút</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stations List - Takes 1 column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-blue-600 px-6 py-5">
                <h2 className="text-white font-semibold text-3xl">
                  Danh sách trạm ({stations.length})
                </h2>
              </div>
              
              <div className="overflow-y-auto" style={{ maxHeight: "680px" }}>
                {stations.length === 0 ? (
                  <div className="p-10 text-center text-gray-500 text-2xl">
                    Đang tải danh sách trạm...
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {stationsWithCoords.map((station) => (
                      <div
                        key={station.stationId}
                        onClick={() => handleStationClick(station)}
                        className={`p-6 cursor-pointer transition hover:bg-blue-50 ${
                          selectedStation?.stationId === station.stationId
                            ? "bg-blue-50 border-l-4 border-blue-600"
                            : ""
                        }`}
                      >
                        {/* Station Name */}
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-semibold text-gray-900 text-2xl">
                            {station.name}
                          </h3>
                          <span
                            className={`px-3 py-2 rounded-full text-xl font-medium ${
                              station.status
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {station.status ? "Hoạt động" : "Ngừng"}
                          </span>
                        </div>

                        {/* Address */}
                        <div className="flex items-start gap-3 mb-3">
                          <MapPin className="w-6 h-6 text-gray-400 mt-1 flex-shrink-0" />
                          <p className="text-xl text-gray-600 leading-relaxed">
                            {station.address}
                          </p>
                        </div>

                        {/* Info Row */}
                        <div className="flex items-center gap-6 text-xl text-gray-500 mt-4">
                          <div className="flex items-center gap-2">
                            <Battery className="w-5 h-5" />
                            <span>{batteryCounts[station.stationId] ?? 0} pin</span>
                          </div>
                          {station.distance && (
                            <div className="flex items-center gap-2">
                              <Navigation className="w-5 h-5" />
                              <span>{station.distance} km</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stations;