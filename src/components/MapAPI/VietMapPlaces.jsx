import React, { useEffect, useRef, useState } from "react";
import * as vietmapgl from "@vietmap/vietmap-gl-js";
import "./../../../node_modules/@vietmap/vietmap-gl-js/dist/vietmap-gl.css";

export default function VietMapPlaces({ searchTerm }) {
  const mapContainer = useRef(null);
  const [map, setMap] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
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
      style: `https://maps.vietmap.vn/maps/styles/tm/style.json?apikey=${API_KEY}`,
      center: [105.7, 10.3],
      zoom: 8,
      accessToken: API_KEY,
    });
    setMap(mapInstance);
    return () => mapInstance.remove();
  }, [API_KEY]);


  useEffect(() => {
    if (!map) return;
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = [pos.coords.longitude, pos.coords.latitude];
          setUserLocation(coords);
          new vietmapgl.Marker({ color: "red" })
            .setLngLat(coords)
            .setPopup(new vietmapgl.Popup().setText("Vị trí của bạn"))
            .addTo(map);
          map.flyTo({ center: coords, zoom: 12 });
        },
        (err) => console.error("Không thể lấy vị trí:", err)
      );
    }
  }, [map]);

 
  useEffect(() => {
    if (!map) return;
    const bounds = new vietmapgl.LngLatBounds();
    sampleStations.forEach((station) => {
      bounds.extend([station.lng, station.lat]);
      new vietmapgl.Marker({ color: "#3b82f6" })
        .setLngLat([station.lng, station.lat])
        .setPopup(
          new vietmapgl.Popup().setHTML(`
            <div><strong>${station.name}</strong><br/>📍 ${station.lat.toFixed(
              3
            )}, ${station.lng.toFixed(3)}</div>`)
        )
        .addTo(map);
    });
    map.fitBounds(bounds, { padding: 60 });
  }, [map]);


  useEffect(() => {
    if (!map || !searchTerm || !userLocation) return;

    const fetchAndDrawRoute = async () => {
      try {
        const searchRes = await fetch(
          `https://maps.vietmap.vn/api/search/v4?apikey=${API_KEY}&text=${encodeURIComponent(
            searchTerm
          )}`
        );
        const searchData = await searchRes.json();
        const dest = searchData?.data?.[0];
        if (!dest) return alert("Không tìm thấy trạm!");

        const destCoords = [dest.geometry.coordinates[0], dest.geometry.coordinates[1]];

        const routeRes = await fetch(
          `https://maps.vietmap.vn/api/route/v1/driving/${userLocation[0]},${userLocation[1]};${destCoords[0]},${destCoords[1]}?apikey=${API_KEY}`
        );
        const routeData = await routeRes.json();
        const route = routeData?.routes?.[0];

        if (!route) return alert("Không tìm được đường đi!");

        const geojson = {
          type: "Feature",
          geometry: route.geometry,
        };

        if (map.getSource("route")) {
          map.getSource("route").setData(geojson);
        } else {
          map.addSource("route", { type: "geojson", data: geojson });
          map.addLayer({
            id: "route-layer",
            type: "line",
            source: "route",
            layout: { "line-join": "round", "line-cap": "round" },
            paint: { "line-color": "#2563eb", "line-width": 5 },
          });
        }

        // focus both user & destination
        map.fitBounds([userLocation, destCoords], { padding: 80 });
      } catch (err) {
        console.error("Lỗi khi vẽ đường:", err);
      }
    };

    fetchAndDrawRoute();
  }, [searchTerm, userLocation]);

  return (
    <div className="p-2 w-full">
      <h2 className="text-2xl font-bold mb-2 text-[#001f54] text-center">
        Bản đồ trạm đổi pin
      </h2>
      <div
        ref={mapContainer}
        className="w-full h-[400px] md:h-[550px] rounded-2xl shadow-md overflow-hidden border border-gray-200"
      />
    </div>
  );
}
