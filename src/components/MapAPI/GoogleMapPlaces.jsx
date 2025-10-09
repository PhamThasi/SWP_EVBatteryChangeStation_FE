import React, { useEffect, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px",
  borderRadius: "15px",
};

export default function GoogleMapPlaces() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  const [map, setMap] = useState(null);
  const [places, setPlaces] = useState([]);
  const [location, setLocation] = useState({ lat: 10.7769, lng: 106.7009 }); // default: HCM

  // Lấy vị trí hiện tại
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => console.warn("Không lấy được vị trí user.")
      );
    }
  }, []);
  
  const onLoad = (mapInstance) => {
    setMap(mapInstance);
    const service = new window.google.maps.places.PlacesService(mapInstance);

    const request = {
      location,
      radius: 5000, // 5km
      keyword: "EV battery swap station", // hoặc “EV charging station”
    };

    service.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        setPlaces(results);
      }
    });
  };

  if (!isLoaded) return <p>Đang tải Google Map...</p>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={location}
      zoom={13}
      onLoad={onLoad}
    >
      {/* marker user */}
      <Marker position={location} icon="http://maps.google.com/mapfiles/ms/icons/blue-dot.png" />

      {/* marker trạm */}
      {places.map((p, idx) => (
        <Marker
          key={idx}
          position={{
            lat: p.geometry.location.lat(),
            lng: p.geometry.location.lng(),
          }}
          title={p.name}
        />
      ))}
    </GoogleMap>
  );
}
