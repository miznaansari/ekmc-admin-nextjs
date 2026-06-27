import { useEffect, useRef } from "react";
import { OlaMaps } from "olamaps-web-sdk";

const AddressInfoMap = ({ OlaApiKey, position, setPosition, fillAddressFromCoords }) => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const popupRef = useRef(null);
  const olaMapsRef = useRef(null);
  const mapInitialized = useRef(false);

  // Initialize map
  useEffect(() => {
    if (!OlaApiKey || !containerRef.current || mapInitialized.current) return;

    try {
      olaMapsRef.current = new OlaMaps({ apiKey: OlaApiKey });

      mapRef.current = olaMapsRef.current.init({
        style: "https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json",
        container: containerRef.current,
        center: [77.61648476788898, 12.931423492103944],
        zoom: 12,
      });

      if (mapRef.current && typeof mapRef.current.on === "function") {
        mapRef.current.on("click", (e) => {
          if (e && e.lngLat) {
            const { lat, lng } = e.lngLat;
            setPosition({ lat, lng });
            fillAddressFromCoords(lat, lng);
          }
        });
      }

      mapInitialized.current = true;
    } catch (err) {
      console.error("OlaMap initialization failed", err);
    }

    return () => {
      try {
        if (mapRef.current && typeof mapRef.current.remove === "function") {
          mapRef.current.remove();
        }
      } catch (err) {
        console.error("OlaMap cleanup failed", err);
      }
      mapRef.current = null;
      markerRef.current = null;
      popupRef.current = null;
      mapInitialized.current = false;
    };
  }, [OlaApiKey, fillAddressFromCoords, setPosition]);

  // Update marker
  useEffect(() => {
    if (!position || !mapRef.current || !olaMapsRef.current) return;
    const { lat, lng } = position;

    try {
      if (!markerRef.current) {
        markerRef.current = olaMapsRef.current
          .addMarker({ offset: [0, -20], anchor: "bottom", color: "#FF0000", draggable: true })
          .setLngLat([lng, lat])
          .addTo(mapRef.current);

        popupRef.current = olaMapsRef.current.addPopup({ offset: [0, -30], anchor: "top" });
        markerRef.current.setPopup(popupRef.current);

        markerRef.current.on("dragend", () => {
          if (markerRef.current) {
            const { lat: dragLat, lng: dragLng } = markerRef.current.getLngLat();
            setPosition({ lat: dragLat, lng: dragLng });
            fillAddressFromCoords(dragLat, dragLng);
          }
        });
      } else {
        markerRef.current.setLngLat([lng, lat]);
      }

      if (typeof mapRef.current.flyTo === "function") {
        mapRef.current.flyTo({ center: [lng, lat], zoom: 15, duration: 1000 });
      }
    } catch (err) {
      console.error("OlaMap marker update failed", err);
    }
  }, [position, setPosition]);

  return <div ref={containerRef} style={{ height: "400px", width: "100%", marginTop: 16 }} />;
};

export default AddressInfoMap;
