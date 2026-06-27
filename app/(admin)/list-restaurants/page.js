"use client";

import React, { useState, useEffect } from "react";
import ListRestaurant from "@/pages/ListRestaurant/ListRestaurant";
import MapComponent from "@/map/MapComponent";

export default function Page() {
  const [mapView, setMapView] = useState(false);

  useEffect(() => {
    // Initial load
    setMapView(localStorage.getItem("mapView") === "true");

    const update = () => {
      setMapView(localStorage.getItem("mapView") === "true");
    };

    window.addEventListener("storage", update);
    window.addEventListener("mapViewChange", update);

    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("mapViewChange", update);
    };
  }, []);

  return (
    <div style={{ display: "flex" }}>
      {/* LEFT - 70% */}
      <div style={{ flex: mapView ? 6 : 10, overflowY: "auto" }}>
        <ListRestaurant />
      </div>

      {/* RIGHT - 30% */}
      <div style={{ flex: mapView ? 4 : 0, height: "88vh", overflowY: "auto" }}>
        {mapView && <MapComponent />}
      </div>
    </div>
  );
}
