import React, { useEffect, useRef, useState } from "react";
import * as vietmapgl from "@vietmap/vietmap-gl-js";
import "./../../../node_modules/@vietmap/vietmap-gl-js/dist/vietmap-gl.css";

export default function VietMapPlaces() {
  const mapContainer = useRef(null);
  const [map, setMap] = useState(null);

  const API_KEY = import.meta.env.VITE_APP_VIETMAP_API_KEY;

  const sampleStations = [
    { name: "Trạm sạc EV01 - Cần Thơ", lat: 10.045, lng: 105.746 },
    { name: "Trạm sạc EV02 - Vĩnh Long", lat: 10.253, lng: 105.958 },
    { name: "Trạm sạc EV03 - Đồng Tháp", lat: 10.467, lng: 105.634 },
  ];

  useEffect(() => {
    if (!mapContainer.current) return;

    const mapInstance = new vietmapgl.Map({
      container: mapContainer.current,
      style: `https://maps.vietmap.vn/mt/tm/style.json?apikey=${API_KEY}`,
      center: [105.7, 10.3],
      zoom: 8,
      accessToken: API_KEY,
    });

    setMap(mapInstance);
    return () => mapInstance.remove();
  }, [API_KEY]);

  useEffect(() => {
    if (!map) return;

    const bounds = new vietmapgl.LngLatBounds();
    sampleStations.forEach((station) => {
      bounds.extend([station.lng, station.lat]);
      new vietmapgl.Marker({ color: "#3b82f6" })
        .setLngLat([station.lng, station.lat])
        .setPopup(
          new vietmapgl.Popup().setHTML(`
            <div style="font-family:sans-serif;font-size:14px;">
              <strong>${station.name}</strong><br/>
              📍 ${station.lat.toFixed(3)}, ${station.lng.toFixed(3)}
            </div>
          `)
        )
        .addTo(map);
    });

    map.fitBounds(bounds, { padding: 60 });
  }, [map]);

  return (
    <div className="p-2 w-full">
      <h2 className="text-2xl font-bold mb-2 text-[#001f54] text-center">
        Bản đồ trạm sạc xe điện
      </h2>
      <div
        ref={mapContainer}
        className="w-full h-[400px] md:h-[500px] rounded-2xl shadow-md overflow-hidden border border-gray-200"
      />
    </div>
  );
}
