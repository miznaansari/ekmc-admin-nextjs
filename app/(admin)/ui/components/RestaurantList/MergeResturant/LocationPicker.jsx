import { useState } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const defaultCenter = {
  lat: 20.5937, // Default center (India)
  lng: 78.9629,
};

export default function LocationPicker({ onLocationSelect }) {
  const [marker, setMarker] = useState(null);

  const handleClick = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setMarker({ lat, lng });
    onLocationSelect(lat, lng);
  };

  return (
    <LoadScript googleMapsApiKey={process.env.VITE_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={marker || defaultCenter}
        zoom={marker ? 15 : 5}
        onClick={handleClick}
      >
        {marker && <Marker position={marker} />}
      </GoogleMap>
    </LoadScript>
  );
}
