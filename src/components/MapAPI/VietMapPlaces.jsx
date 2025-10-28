import React, { useEffect, useRef } from "react";
import * as vietmapgl from "@vietmap/vietmap-gl-js";
import "./../../../node_modules/@vietmap/vietmap-gl-js/dist/vietmap-gl.css";

export default function VietMapPlaces({
  stations = [],
  route = null,
  userLocation = null,
  API_KEY,
  mode = "display", // 🔹 'display' (Home) | 'route' (Stations)
}) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);

  // === Khởi tạo map ===
  useEffect(() => {
    if (mapRef.current) return;
    const map = new vietmapgl.Map({
      container: mapContainer.current,
      style: `https://maps.vietmap.vn/maps/styles/tm/style.json?apikey=${API_KEY}`,
      center: [105.7, 10.3],
      zoom: 8,
      accessToken: API_KEY,
    });
    mapRef.current = map;

    return () => map.remove();
  }, [API_KEY]);

  // === Render các trạm ===
  useEffect(() => {
    const map = mapRef.current;
    if (!map || stations.length === 0) return;

    // clear old markers
    document.querySelectorAll(".vietmapgl-marker").forEach((m) => m.remove());

    stations.forEach((s) => {
      new vietmapgl.Marker({ color: "#3b82f6" })
        .setLngLat([s.lng, s.lat])
        .setPopup(
          new vietmapgl.Popup().setHTML(`<b>${s.name}</b><br>${s.lat}, ${s.lng}`)
        )
        .addTo(map);
    });
  }, [stations]);

  // === Render route khi ở chế độ route ===
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !route || mode !== "route") return;

    if (map.getSource("route")) {
      map.getSource("route").setData(route);
    } else {
      map.addSource("route", { type: "geojson", data: route });
      map.addLayer({
        id: "route-layer",
        type: "line",
        source: "route",
        paint: { "line-color": "#2563eb", "line-width": 5 },
      });
    }
  }, [route, mode]);

  // === Render user location nếu có (và chỉ khi ở mode route) ===
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !userLocation || mode !== "route") return;
    new vietmapgl.Marker({ color: "red" })
      .setLngLat(userLocation)
      .setPopup(new vietmapgl.Popup().setText("📍 Vị trí của bạn"))
      .addTo(map);
    map.flyTo({ center: userLocation, zoom: 12 });
  }, [userLocation, mode]);

  return (
    <div className="p-2 w-full">
      <h2 className="text-2xl font-bold mb-2 text-[#001f54] text-center">
        {mode === "route" ? "Bản đồ tìm đường đến trạm" : "Bản đồ trạm đổi pin"}
      </h2>
      <div
        ref={mapContainer}
        className="w-full h-[400px] md:h-[550px] rounded-2xl shadow-md overflow-hidden border border-gray-200"
      />
    </div>
  );
}
