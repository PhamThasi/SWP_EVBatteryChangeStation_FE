import React, { useEffect, useRef, useState } from "react";
import * as vietmapgl from "@vietmap/vietmap-gl-js";
import "./../../../node_modules/@vietmap/vietmap-gl-js/dist/vietmap-gl.css";

export default function VietMapPlaces({
  stations = [],
  route = null,
  routeInfo = null,
  userLocation = null,
  API_KEY,
  mode = "display",
}) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const [coords, setCoords] = useState(null); // hiển_: lưu toạ độ hiển thị

  // === Khởi tạo map ===
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

  // === Render marker trạm ===
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    document.querySelectorAll(".vietmapgl-marker").forEach((m) => m.remove());
    if (!stations.length) return;

    const bounds = new vietmapgl.LngLatBounds();
    stations.forEach((s, i) => {
      new vietmapgl.Marker({ color: "#3b82f6" })
        .setLngLat([s.lng, s.lat])
        .setPopup(
          new vietmapgl.Popup().setHTML(
            `<b>${s.name || `Trạm ${i + 1}`}</b><br>${s.lat}, ${s.lng}`
          )
        )
        .addTo(map);
      bounds.extend([s.lng, s.lat]);
    });
    if (!bounds.isEmpty()) map.fitBounds(bounds, { padding: 48, duration: 600 });
  }, [stations]);

  // === Hiển thị vị trí người dùng ===
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !userLocation) return;

    new vietmapgl.Marker({ color: "red" })
      .setLngLat(userLocation)
      .setPopup(new vietmapgl.Popup().setText("📍 Vị trí của bạn"))
      .addTo(map);

    // hiển_: lưu toạ độ hiện tại để hiển thị text
    setCoords({
      lat: userLocation[1].toFixed(6),
      lng: userLocation[0].toFixed(6),
    });

    map.flyTo({ center: userLocation, zoom: 13 });
  }, [userLocation]);

  // === Vẽ route ===
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !route) return;

    if (map.getSource("route")) {
      map.removeLayer("route-layer");
      map.removeSource("route");
    }

    map.addSource("route", { type: "geojson", data: route });
    map.addLayer({
      id: "route-layer",
      type: "line",
      source: "route",
      paint: { "line-color": "#2563eb", "line-width": 5 },
    });

    if (routeInfo?.dest && routeInfo?.distance && routeInfo?.time) {
      new vietmapgl.Marker({ color: "#16a34a" })
        .setLngLat([routeInfo.dest.lng, routeInfo.dest.lat])
        .setPopup(
          new vietmapgl.Popup({ offset: 25 }).setHTML(
            `<b>🏁 Đến đích</b><br>
            Khoảng cách: ${routeInfo.distance} km<br>
            Thời gian: ${routeInfo.time} phút`
          )
        )
        .addTo(map);

      map.fitBounds(
        new vietmapgl.LngLatBounds()
          .extend(userLocation)
          .extend([routeInfo.dest.lng, routeInfo.dest.lat]),
        { padding: 80, duration: 800 }
      );
    }
  }, [route, routeInfo, userLocation]);

  return (
    <div className="p-2 w-full">
      <h2 className="text-2xl font-bold mb-2 text-[#001f54] text-center">
        Bản đồ tìm đường đến trạm
      </h2>

      {/* hiển_: hiển thị tọa độ user ngay trên bản đồ */}
      {coords && (
        <div className="text-center text-sm text-gray-700 mb-2">
          <span className="font-semibold text-blue-700">
            📍 Tọa độ hiện tại:
          </span>{" "}
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
