import React, { useState } from "react";
import { IndiaMap } from "@vishalvoid/react-india-map";

const MapView = () => {
  const [hoveredState, setHoveredState] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // ---------- STATIC DATA ----------
    const stateStats = [
        {
            id: "IN-MH",
            customData: {
                name: "Maharashtra",
                restaurants: 120,
                revenue: "₹9,50,000",
                orders: 8500,
                users: 4300,
            },
        },
        {
            id: "IN-GJ",
            customData: {
                name: "Gujarat",
                restaurants: 80,
                revenue: "₹5,10,000",
                orders: 5600,
                users: 2900,
            },
        },
        {
            id: "IN-UP",
            customData: {
                name: "Uttar Pradesh",
                restaurants: 150,
                revenue: "₹7,90,000",
                orders: 9100,
                users: 5200,
            },
        },
        {
            id: "IN-TN",
            customData: {
                name: "Tamil Nadu",
                restaurants: 110,
                revenue: "₹6,20,000",
                orders: 7700,
                users: 3800,
            },
        },
        {
            id: "IN-KA",
            customData: {
                name: "Karnataka",
                restaurants: 95,
                revenue: "₹4,80,000",
                orders: 6000,
                users: 3200,
            },
        },
        {
            id: "IN-RJ",
            customData: {
                name: "Rajasthan",
                restaurants: 70,
                revenue: "₹3,40,000",
                orders: 4500,
                users: 2100,
            },
        },
    ];
  return (
    <div
      style={{ width: "100%", height: "100%", position: "relative" }}
      onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
    >
      {/* <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        India Restaurant Analytics
      </h2> */}

    <div style={{ width: "800px", margin: "0 auto" }}>   {/* 👈 Change size here */}
  <IndiaMap
    mapStyle={{
      backgroundColor: "#eef2f7",
      hoverColor: "#90e0ef",
  size:10,
      stroke: "black",
      strokeWidth: 1,
      tooltipConfig: {
        backgroundColor: "transparent",
        textColor: "transparent",
      },
    }}
    stateData={stateStats}
    onStateHover={(stateId, stateInfo) =>
      setHoveredState(stateInfo?.customData || null)
    }
    onStateLeave={() => setHoveredState(null)}
  />
</div>


      {/* ---------- TOOLTIP ---------- */}
      {hoveredState && (
        <div
          style={{
            position: "fixed",
            top: mousePos.y + 15,
            left: mousePos.x + 15,
            padding: "12px 16px",
            background: "#1e293b",
            color: "white",
            borderRadius: "8px",
            fontSize: "14px",
            boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
            pointerEvents: "none",
            zIndex: 9999,
            border: "2px solid black",
          }}
        >
          <strong>{hoveredState.name}</strong>
          <br />🍽 Restaurants: {hoveredState.restaurants}
          <br />💰 Revenue: {hoveredState.revenue}
          <br />📦 Orders: {hoveredState.orders}
          <br />👤 Users: {hoveredState.users}
        </div>
      )}
    </div>
  );
};

export default MapView;
