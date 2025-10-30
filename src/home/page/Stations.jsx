import React, { useState, useEffect, useRef } from "react";
import VietMapPlaces from "@/components/MapAPI/VietMapPlaces";
import stationService from "@/api/stationService";
import { vietmapService } from "@/api/vietmapService";

const Stations = () => {
  const API_KEY = import.meta.env.VITE_APP_VIETMAP_API_KEY;
  const [searchTerm, setSearchTerm] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [stations, setStations] = useState([]);
  const [route, setRoute] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const destRef = useRef(null); // hiển_: lưu trạm đích để auto-update route khi user di chuyển

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

        // hiển_: nếu đã có trạm đích → tự update route
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
        const withCoords = await Promise.all(
          list.map(async (s) => {
            const coords = await vietmapService.geocodeAddress(API_KEY, s.address);
            return coords
              ? {
                  name: s.stationName || s.name || "Station",
                  lat: coords.lat,
                  lng: coords.lng,
                  raw: s,
                }
              : null;
          })
        );
        setStations(withCoords.filter(Boolean));
      } catch (err) {
        console.error("Không thể tải danh sách trạm:", err);
      }
    };
    if (API_KEY) loadStations();
  }, [API_KEY]);

  // ========== TÌM TRẠM & VẼ ROUTE ==========
  const findAndDrawRoute = async () => {
    if (!userLocation || !searchTerm) return;
    try {
      const searchRes = await vietmapService.searchPlace(API_KEY, searchTerm, userLocation);
      const refid = searchRes?.[0]?.ref_id;
      if (!refid) return alert("Không tìm thấy trạm phù hợp!");

      const dest = await vietmapService.getPlaceByRef(API_KEY, refid);
      if (!dest?.lat || !dest?.lng) return alert("Không tìm thấy tọa độ!");

      destRef.current = { lat: dest.lat, lng: dest.lng }; // hiển_: lưu trạm đích
      updateRoute(userLocation, destRef.current);
    } catch (err) {
      console.error("Lỗi khi tìm trạm:", err);
    }
  };

  // ========== CẬP NHẬT ROUTE ==========
  const updateRoute = async (start, dest) => {
    try {
      const [userLat, userLng] = [start[1], start[0]]; // hiển_: đảo ngược đúng định dạng LAT,LNG
  
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
  

  // ========== FORM SEARCH ==========
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    findAndDrawRoute();
  };

  return (
    <div className="w-full min-h-screen bg-white px-6 py-10">
      <div className="flex justify-center mb-20 mt-36">
        <form
          onSubmit={handleSearchSubmit}
          className="flex w-full max-w-5xl border border-gray-300 rounded-full overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-blue-400"
        >
          <input
            type="text"
            placeholder="Tìm kiếm trạm đổi pin (vd: Cần Thơ, Đà Nẵng...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow px-6 py-3 outline-none text-gray-700"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 font-medium transition"
          >
            Tìm kiếm
          </button>
        </form>
      </div>

      <div className="w-full flex justify-center">
        <div className="w-[120rem] max-w-full">
          <VietMapPlaces
            stations={stations}
            route={route}
            routeInfo={routeInfo}
            userLocation={userLocation}
            API_KEY={API_KEY}
            mode="route"
          />
        </div>
      </div>
    </div>
  );
};

export default Stations;
