import React, { useEffect, useRef, useState } from "react";
import * as vietmapgl from "@vietmap/vietmap-gl-js";
import "./../../../node_modules/@vietmap/vietmap-gl-js/dist/vietmap-gl.css";

export default function VietMapPlaces({
  stations = [],
  route = null,
  routeInfo = null,
  userLocation = null,  // NOTE: bro đang truyền [lng, lat] từ Stations.jsx
  API_KEY,
  mode = "display",
}) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);

  // NEW: tách ref cho từng loại marker
  const stationMarkersRef = useRef([]);
  const userMarkerRef = useRef(null);
  const destMarkerRef = useRef(null);

  const [coords, setCoords] = useState(null);

  // === Init map ===
  useEffect(() => {
    if (mapRef.current) return;
    const map = new vietmapgl.Map({
      container: mapContainer.current,
      style: `https://maps.vietmap.vn/maps/styles/tm/style.json?apikey=${API_KEY}`,
      center: [106.7, 10.77],
      zoom: 11,
      accessToken: API_KEY,
    });
    mapRef.current = map;
    return () => map.remove();
  }, [API_KEY]);

  // === Render markers cho trạm (KHÔNG xoá marker user/dest) ===
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // clear chỉ marker trạm
    stationMarkersRef.current.forEach(mk => mk.remove());
    stationMarkersRef.current = [];

    if (!stations.length) return;

    const bounds = new vietmapgl.LngLatBounds();
    stations.forEach((s, i) => {
      const mk = new vietmapgl.Marker({ color: "#3b82f6" })
        .setLngLat([s.lng, s.lat]) // [lng, lat]
        .setPopup(
          new vietmapgl.Popup().setHTML(
            `<b>${s.name || `Trạm ${i + 1}`}</b><br>${s.lat}, ${s.lng}`
          )
        )
        .addTo(map);

      stationMarkersRef.current.push(mk);
      bounds.extend([s.lng, s.lat]);
    });

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, { padding: 48, duration: 600 });
    }
  }, [stations]);

  // === Marker vị trí người dùng (update thay vì tạo mới liên tục) ===
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !userLocation) return;

    // userLocation đang là [lng, lat] từ Stations.jsx
    const lngLat = userLocation;

    if (userMarkerRef.current) {
      userMarkerRef.current.setLngLat(lngLat);
    } else {
      userMarkerRef.current = new vietmapgl.Marker({ color: "red" })
        .setLngLat(lngLat)
        .setPopup(new vietmapgl.Popup().setText("📍 Vị trí của bạn"))
        .addTo(map);
    }

    setCoords({ lat: lngLat[1].toFixed(6), lng: lngLat[0].toFixed(6) });

    // chỉ flyTo nhẹ: nếu muốn đỡ “giật”, có thể bỏ hoặc throttle
    map.flyTo({ center: lngLat, zoom: 13 });
  }, [userLocation]);

  // === Vẽ route + marker đích (quản lý riêng) ===
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !route) return;

    if (map.getSource("route")) {
      if (map.getLayer("route-layer")) map.removeLayer("route-layer");
      map.removeSource("route");
    }

    map.addSource("route", { type: "geojson", data: route });
    map.addLayer({
      id: "route-layer",
      type: "line",
      source: "route",
      paint: { "line-color": "#2563eb", "line-width": 5 },
    });

    // marker đích
    if (routeInfo?.dest?.lng != null && routeInfo?.dest?.lat != null) {
      if (destMarkerRef.current) destMarkerRef.current.remove();
      destMarkerRef.current = new vietmapgl.Marker({ color: "#16a34a" })
        .setLngLat([routeInfo.dest.lng, routeInfo.dest.lat]) // [lng, lat]
        .setPopup(
          new vietmapgl.Popup({ offset: 25 }).setHTML(
            `<b>🏁 Đến đích</b><br>Khoảng cách: ${routeInfo.distance} km<br>Thời gian: ${routeInfo.time} phút`
          )
        )
        .addTo(map);

      // Fit 2 đầu: user & đích
      if (Array.isArray(userLocation)) {
        const bounds = new vietmapgl.LngLatBounds();
        bounds.extend(userLocation); // [lng, lat]
        bounds.extend([routeInfo.dest.lng, routeInfo.dest.lat]);
        map.fitBounds(bounds, { padding: 80, duration: 800 });
      }
    }
  }, [route, routeInfo, userLocation]);

  return (
    <div className="p-2 w-full">
      <h2 className="text-2xl font-bold mb-2 text-[#001f54] text-center">
        Bản đồ tìm đường đến trạm
      </h2>

      {coords && (
        <div className="text-center text-sm text-gray-700 mb-2">
          <span className="font-semibold text-blue-700">📍 Tọa độ hiện tại:</span>{" "}
          <span>Lat: {coords.lat}</span> | <span>Lng: {coords.lng}</span>
        </div>
      )}

      <div
        ref={mapContainer}
        className="w-full h-[500px] md:h-[600px] rounded-2xl shadow-md overflow-hidden border border-gray-200"
      />
    </div>
  );
}
