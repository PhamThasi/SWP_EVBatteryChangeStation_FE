import React, { useState, useEffect, useRef } from "react";
import stationService from "@/api/stationService";
import { vietmapService } from "@/api/vietmapService";
import { MapPin, Search, X } from "lucide-react";
import { notifyError, notifyWarning } from "@/components/notification/notification";

export default function StationSearch({ 
  onStationSelect, 
  API_KEY, 
  userLocation,
  className = "" 
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const resultsRef = useRef(null);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        resultsRef.current &&
        !resultsRef.current.contains(event.target)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Tìm kiếm trạm
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    setShowResults(true);

    try {
      const response = await stationService.getStationsByName(searchTerm.trim());
      const stations = response?.data || response || [];

      if (stations.length === 0) {
        notifyWarning("Không tìm thấy trạm nào phù hợp!");
        setSearchResults([]);
        return;
      }

      // Geocode và tính distance cho mỗi trạm
      const stationsWithCoords = await Promise.all(
        stations.map(async (station) => {
          try {
            const coords = await vietmapService.geocodeAddress(
              API_KEY,
              station.address,
              userLocation ? { lat: userLocation[1], lng: userLocation[0] } : null
            );

            let distance = null;
            if (userLocation && coords) {
              distance = calculateDistance(userLocation, [coords.lng, coords.lat]);
            }

            return {
              ...station,
              lat: coords?.lat || null,
              lng: coords?.lng || null,
              distance,
            };
          } catch (err) {
            console.warn(`Không thể geocode trạm ${station.stationId}:`, err);
            return {
              ...station,
              lat: null,
              lng: null,
              distance: null,
            };
          }
        })
      );

      setSearchResults(stationsWithCoords);
    } catch (error) {
      notifyError("Không thể tìm kiếm trạm. Vui lòng thử lại!");
      console.error("Lỗi khi tìm kiếm trạm:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Tính khoảng cách
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

  // Xử lý khi click vào một trạm
  const handleStationClick = (station) => {
    if (!station.lat || !station.lng) {
      notifyWarning("Trạm này không có tọa độ để chỉ đường!");
      return;
    }

    if (onStationSelect) {
      onStationSelect(station);
    }
    setShowResults(false);
    setSearchTerm("");
  };

  // Xử lý khi nhấn Enter
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Clear search
  const handleClear = () => {
    setSearchTerm("");
    setSearchResults([]);
    setShowResults(false);
  };

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      {/* Search Input */}
      <div className="flex w-full">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm trạm đổi pin (vd: Cần Thơ, Đà Nẵng...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => {
              if (searchResults.length > 0) setShowResults(true);
            }}
            className="w-full pl-12 pr-12 py-5 text-2xl outline-none text-gray-700 border border-gray-300 rounded-l-full focus:ring-2 focus:ring-blue-400"
          />
          {searchTerm && (
            <button
              onClick={handleClear}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
        <button
          onClick={handleSearch}
          disabled={isSearching}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-10 py-5 text-2xl font-medium transition rounded-r-full flex items-center gap-2"
        >
          {isSearching ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Đang tìm...</span>
            </>
          ) : (
            "Tìm kiếm"
          )}
        </button>
      </div>

      {/* Search Results Dropdown */}
      {showResults && searchResults.length > 0 && (
        <div
          ref={resultsRef}
          className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto"
        >
          <div className="p-2">
            {searchResults.map((station) => (
              <div
                key={station.stationId}
                onClick={() => handleStationClick(station)}
                className="p-4 cursor-pointer hover:bg-blue-50 transition rounded-lg border-b border-gray-100 last:border-b-0"
              >
                {/* Station Name & Status */}
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 text-xl flex-1">
                    {station.name || station.address?.split(",").pop()?.trim() || `Trạm ${station.stationId}`}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xl font-medium ml-2 ${
                      station.status
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {station.status ? "Hoạt động" : "Ngừng"}
                  </span>
                </div>

                {/* Address */}
                <div className="flex items-start gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                  <p className="text-base text-gray-600 leading-relaxed">
                    {station.address}
                  </p>
                </div>

                {/* Distance */}
                {station.distance && (
                  <div className="text-xl text-blue-600 font-medium mt-2">
                    📍 Cách {station.distance} km
                  </div>
                )}

                {(!station.lat || !station.lng) && (
                  <div className="text-xl text-yellow-600 mt-1">
                    ⚠️ Không có tọa độ
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {showResults && !isSearching && searchResults.length === 0 && searchTerm && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
          <p className="text-gray-500 text-center">Không tìm thấy trạm nào</p>
        </div>
      )}
    </div>
  );
}

