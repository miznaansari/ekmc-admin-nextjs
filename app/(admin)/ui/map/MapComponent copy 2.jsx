import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import db from "../indexedDB/db";

export default function MapComponent() {
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const [zoomLevel, setZoomLevel] = useState(10);

  const olamapKey = process.env.VITE_OLAMAP_API_KEY;
  const olamapProjectKey = process.env.VITE_OLAMAP_PROJECT_KEY;

  // 🔥 ONE-TIME LOAD FROM DB INTO GEOJSON
  const loadDataToGeoJSON = async (map) => {
    console.log("📦 LOADING DATA FROM INDEXEDDB...");
    const all = [];

    // Read all once and filter
    await db.eatery_list.each((item) => {
      if (item.is_crawler === 1 || item.is_crawler === "1") {
        all.push(item);
      }
    });

    console.log("🕷️ CRAWLER ITEMS:", all.length);

    // 🔥 deduplicate same lat/lng
    const unique = new Map();

    all.forEach((i) => {
      const lat = Number(i.lat ?? i.latitude);
      const lng = Number(i.lng ?? i.longitude);

      if (isNaN(lat) || isNaN(lng)) return;

      const key = `${lat.toFixed(5)}_${lng.toFixed(5)}`;

      if (!unique.has(key)) {
        unique.set(key, {
          id: i.id,
          name: i.cafe_name || "Restaurant",
          lat,
          lng,
        });
      }
    });

    const uniquePoints = Array.from(unique.values());
    console.log("📍 UNIQUE POINTS:", uniquePoints.length);

    // Convert to GeoJSON FeatureCollection
    const features = uniquePoints.map((p) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [p.lng, p.lat],
      },
      properties: {
        id: p.id,
        name: p.name,
      },
    }));

    const geojsonData = {
      type: "FeatureCollection",
      features: features,
    };

    // Update map source
    const source = map.getSource("eateries");
    if (source) {
      source.setData(geojsonData);
      console.log("✅ MAP DATA UPDATED (GEOJSON)");
    }
  };

  useEffect(() => {
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          carto: {
            type: "raster",
            tiles: [
              "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
              "https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
              "https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
              "https://d.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
            ],
            tileSize: 256,
          },
        },
        layers: [
          {
            id: "carto-layer",
            type: "raster",
            source: "carto",
          },
        ],
      },
      center: [77.391, 28.6139],
      zoom: 10,
    });

    mapRef.current = map;

    // 🔥 REMOVE BROKEN 3D LAYERS
    map.on("styledata", () => {
      const style = map.getStyle();
      if (!style?.layers) return;

      style.layers.forEach((layer) => {
        const id = layer.id.toLowerCase();

        if (id.includes("3d")) {
          try {
            if (map.getLayer(layer.id)) {
              map.removeLayer(layer.id);
            }
          } catch { }
        }
      });
    });

    map.on("load", () => {
      console.log("✅ MAP READY");

      // Add clustered source
      map.addSource("eateries", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
        cluster: true,
        clusterMaxZoom: 13, // Clustering stops at zoom 13. Zoom 14+ will show individual markers.
        clusterRadius: 50, // Radius of each cluster
      });

      // Cluster circle layer
      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "eateries",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": [
            "step",
            ["get", "point_count"],
            "#51bbd6", // color for < 100 points
            100,
            "#f1f075", // color for > 100 points
            750,
            "#f28cb1", // color for > 750 points
          ],
          "circle-radius": [
            "step",
            ["get", "point_count"],
            20,
            100,
            30,
            750,
            40,
          ],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      });

      // Cluster count text layer
      // Note: If you face font-loading errors, the font stack might not be supported by Olamaps default style.
      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "eateries",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          // Fallback array of fonts usually available
          "text-font": ["Open Sans Regular", "Arial Unicode MS Regular", "Metropolis Regular"],
          "text-size": 12,
        },
        paint: {
          "text-color": "#222222",
        },
      });

      // Load custom teardrop marker image
      const greenMarkerSvg = `<svg width="40" height="56" viewBox="0 0 40 56" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 0C8.954 0 0 8.954 0 20c0 14.838 18.232 34.618 19.167 35.614a1.136 1.136 0 0 0 1.666 0C21.768 54.618 40 34.838 40 20 40 8.954 31.046 0 20 0zm0 30a10 10 0 1 1 0-20 10 10 0 0 1 0 20z" fill="#22c55e"/></svg>`;
      const img = new Image();
      img.onload = () => {
        if (!map.hasImage("custom-marker")) {
          map.addImage("custom-marker", img);
        }
      };
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(greenMarkerSvg);

      // Unclustered point layer (Custom Teardrop Marker)
      map.addLayer({
        id: "unclustered-point",
        type: "symbol",
        source: "eateries",
        filter: ["!", ["has", "point_count"]],
        layout: {
          "icon-image": "custom-marker",
          "icon-size": 0.65, // Adjust size (0.65 * 40 = 26px width)
          "icon-anchor": "bottom", // The bottom tip points to the coordinate
          "icon-allow-overlap": true, // Ensure markers aren't hidden
        },
      });

      // 🔥 POPUP ON CLICK
      map.on("click", "unclustered-point", (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const name = e.features[0].properties.name;

        // Ensure popup points to correct location on zoom
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new maplibregl.Popup()
          .setLngLat(coordinates)
          .setHTML(`<div style="padding: 4px; font-weight: bold; font-family: sans-serif;">${name}</div>`)
          .addTo(map);
      });

      // ZOOM INTO CLUSTER ON CLICK
      map.on("click", "clusters", (e) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ["clusters"],
        });
        const clusterId = features[0].properties.cluster_id;
        map.getSource("eateries").getClusterExpansionZoom(
          clusterId,
          (err, zoom) => {
            if (err) return;
            map.easeTo({
              center: features[0].geometry.coordinates,
              zoom: zoom,
            });
          }
        );
      });

      // HOVER EFFECTS
      map.on("mouseenter", "unclustered-point", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "unclustered-point", () => {
        map.getCanvas().style.cursor = "";
      });

      map.on("mouseenter", "clusters", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "clusters", () => {
        map.getCanvas().style.cursor = "";
      });

      // Load data asynchronously to not block the initial render
      loadDataToGeoJSON(map);
    });

    map.on("zoom", () => {
      setZoomLevel(Math.round(map.getZoom() * 10) / 10);
    });

    return () => map.remove();
  }, []);

  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();

  return (
    <div style={{ position: "relative", height: "100vh", width: "100%" }}>
      <div ref={containerRef} style={{ height: "100%", width: "100%" }} />

      {/* ZOOM CONTROLS */}
      <div
        style={{
          position: "absolute",
          bottom: "40px",
          right: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          background: "white",
          padding: "6px",
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
          zIndex: 10,
          fontFamily: "sans-serif",
          width: "48px",
          boxSizing: "border-box"
        }}
      >
        <button
          onClick={handleZoomIn}
          style={{
            width: "36px",
            height: "36px",
            cursor: "pointer",
            border: "none",
            background: "#f3f4f6",
            borderRadius: "6px",
            fontSize: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#374151",
            transition: "background 0.2s",
          }}
          onMouseOver={(e) => (e.target.style.background = "#e5e7eb")}
          onMouseOut={(e) => (e.target.style.background = "#f3f4f6")}
          title="Zoom In"
        >
          +
        </button>

        <div
          style={{
            fontSize: "11px",
            fontWeight: "bold",
            textAlign: "center",
            margin: "4px 0",
            color: "#4b5563",
          }}
          title="Current Zoom Level"
        >
          {zoomLevel.toFixed(1)}z
        </div>

        <button
          onClick={handleZoomOut}
          style={{
            width: "36px",
            height: "36px",
            cursor: "pointer",
            border: "none",
            background: "#f3f4f6",
            borderRadius: "6px",
            fontSize: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#374151",
            transition: "background 0.2s",
          }}
          onMouseOver={(e) => (e.target.style.background = "#e5e7eb")}
          onMouseOut={(e) => (e.target.style.background = "#f3f4f6")}
          title="Zoom Out"
        >
          −
        </button>
      </div>
    </div>
  );
}