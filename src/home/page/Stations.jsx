import React, { useState, useEffect } from "react";
import VietMapPlaces from "@/components/MapAPI/VietMapPlaces";

const Stations = () => {
  const API_KEY = import.meta.env.VITE_APP_VIETMAP_API_KEY;
  const [searchTerm, setSearchTerm] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [stations, setStations] = useState([]);
  const [route, setRoute] = useState(null);

  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchTerm) return;
    findAndDrawRoute();
  };

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation([pos.coords.longitude, pos.coords.latitude]),
        (err) => console.error("Không thể lấy vị trí:", err)
      );
    }
  }, []);

  useEffect(() => {
    setStations([
      { name: "Ev-ONE", lat: 10.775, lng: 106.7 },
      { name: "TESLA", lat: 10.78, lng: 106.69 },
      { name: "VINFAST Thảo Điền", lat: 10.82, lng: 106.74 },
    ]);
  }, []);

  const findAndDrawRoute = async () => {
    if (!userLocation || !searchTerm) return;
    try {
      const searchUrl = `https://maps.vietmap.vn/api/search/v4?apikey=${API_KEY}&text=${encodeURIComponent(
        searchTerm
      )}&focus=${userLocation[1]},${userLocation[0]}&display_type=all`;
      const searchRes = await fetch(searchUrl);
      const searchData = await searchRes.json();
      const dest = searchData?.data?.[0];
      if (!dest) return alert("Không tìm thấy trạm!");

      const destLat = dest.geometry.coordinates[1];
      const destLng = dest.geometry.coordinates[0];

      const routeUrl = `https://maps.vietmap.vn/api/route?api-version=1.1&apikey=${API_KEY}&point=${userLocation[1]},${userLocation[0]}&point=${destLat},${destLng}&points_encoded=false`;
      const routeRes = await fetch(routeUrl);
      const routeData = await routeRes.json();
      const path = routeData?.paths?.[0];

      if (!path) return alert("Không tìm thấy đường đi!");

      const geojson = {
        type: "Feature",
        geometry: path.points,
      };
      setRoute(geojson);
    } catch (err) {
      console.error("Lỗi khi vẽ đường:", err);
    }
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
            placeholder="Tìm kiếm trạm đổi pin, ví dụ: Cần Thơ, Vĩnh Long..."
            value={searchTerm}
            onChange={handleSearchChange}
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
