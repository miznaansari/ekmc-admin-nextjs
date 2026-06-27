import { useEffect, useRef, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import db from "../indexedDB/db";

export default function MapComponent() {
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const allEateriesRef = useRef([]);

  const [zoomLevel, setZoomLevel] = useState(10);

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [filterUnclaimed, setFilterUnclaimed] = useState("all");
  const [filterPublished, setFilterPublished] = useState("all");

  const olamapKey = process.env.VITE_OLAMAP_API_KEY;
  const olamapProjectKey = process.env.VITE_OLAMAP_PROJECT_KEY;

  // 🔥 Apply Filters and Update Map
  const applyFilters = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    let source;
    try {
      source = map.getSource("eateries");
    } catch (err) {
      // Style not loaded yet
      return;
    }

    if (!source) return;

    const unique = new Map();

    allEateriesRef.current.forEach((i) => {
      // Apply Dropdown Filters
      if (filterUnclaimed !== "all" && String(i.is_unclaimed) !== filterUnclaimed) return;
      if (filterPublished !== "all" && String(i.is_published) !== filterPublished) return;

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

    source.setData(geojsonData);
  }, [filterUnclaimed, filterPublished]);

  // Trigger filters when dropdowns change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // 🔥 Fetch Data ONCE
  const fetchInitialData = async (map) => {
    console.log("📦 LOADING DATA FROM INDEXEDDB...");
    const all = [];

    await db.eatery_list.each((item) => {
      if (item.is_crawler === 1 || item.is_crawler === "1") {
        all.push(item);
      }
    });

    allEateriesRef.current = all;
    console.log("🕷️ CRAWLER ITEMS LOADED:", all.length);

    // Apply initial filters to populate map
    applyFilters();
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
        clusterRadius: 40, // Reduced from 50 to make clusters smaller and more dispersed
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
            18, // Reduced sizes so they don't cover city names entirely
            100,
            24,
            750,
            30,
          ],
          "circle-opacity": 0.75, // Makes the cluster semi-transparent to read city names
          "circle-stroke-width": 2,
          "circle-stroke-color": "rgba(255, 255, 255, 0.75)",
        },
      });

      // Cluster count text layer
      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "eateries",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
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

      // Load blue teardrop marker for selected state
      const blueMarkerSvg = `<svg width="40" height="56" viewBox="0 0 40 56" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 0C8.954 0 0 8.954 0 20c0 14.838 18.232 34.618 19.167 35.614a1.136 1.136 0 0 0 1.666 0C21.768 54.618 40 34.838 40 20 40 8.954 31.046 0 20 0zm0 30a10 10 0 1 1 0-20 10 10 0 0 1 0 20z" fill="#3b82f6"/></svg>`;
      const imgBlue = new Image();
      imgBlue.onload = () => {
        if (!map.hasImage("blue-marker")) {
          map.addImage("blue-marker", imgBlue);
        }
      };
      imgBlue.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(blueMarkerSvg);

      // Unclustered point layer (Custom Teardrop Marker)
      map.addLayer({
        id: "unclustered-point",
        type: "symbol",
        source: "eateries",
        filter: ["!", ["has", "point_count"]],
        layout: {
          "icon-image": "custom-marker",
          "icon-size": 0.65,
          "icon-anchor": "bottom",
          "icon-allow-overlap": true,
        },
      });

      // Highlighted Selected Point Layer
      map.addLayer({
        id: "selected-point",
        type: "symbol",
        source: "eateries",
        filter: ["==", ["to-string", ["get", "id"]], "nothing"],
        layout: {
          "icon-image": "blue-marker",
          "icon-size": 0.8,
          "icon-anchor": "bottom",
          "icon-allow-overlap": true,
          "icon-ignore-placement": true,
        },
      });

      // 🔥 POPUP ON CLICK
      map.on("click", "unclustered-point", (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const name = e.features[0].properties.name;
        const id = String(e.features[0].properties.id);

        if (map.getLayer("selected-point")) {
          map.setFilter("selected-point", ["==", ["to-string", ["get", "id"]], id]);
        }

        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        const popup = new maplibregl.Popup()
          .setLngLat(coordinates)
          .setHTML(`<div style="padding: 4px; font-weight: bold; font-family: sans-serif;">${name}</div>`)
          .addTo(map);

        popup.on("close", () => {
          if (map.getLayer("selected-point")) {
            const currentFilter = map.getFilter("selected-point");
            if (currentFilter && currentFilter[2] === id) {
              map.setFilter("selected-point", ["==", ["to-string", ["get", "id"]], "nothing"]);
            }
          }
        });
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

      // Fetch data ONCE and initialize
      fetchInitialData(map);
    });

    map.on("zoom", () => {
      setZoomLevel(Math.round(map.getZoom() * 10) / 10);
    });

    return () => map.remove();
  }, []); // Map initialization should only run once on mount

  // UI Handlers
  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setSearchResults([]);
      return;
    }

    const q = text.toLowerCase();
    const results = [];

    for (let i = 0; i < allEateriesRef.current.length; i++) {
      const item = allEateriesRef.current[i];
      const name = (item.cafe_name || "").toLowerCase();
      const city = (item.city_name || "").toLowerCase();

      if (name.includes(q) || city.includes(q)) {
        results.push(item);
        if (results.length >= 30) break; // Increased to 30 for scrollable list
      }
    }
    setSearchResults(results);
  };

  const handleResultClick = (res) => {
    const latRaw = res.lat ?? res.latitude;
    const lngRaw = res.lng ?? res.longitude;

    if (latRaw && lngRaw) {
      const lat = Number(latRaw);
      const lng = Number(lngRaw);

      if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
        mapRef.current?.flyTo({ center: [lng, lat], zoom: 16, essential: true });

        const id = String(res.id);

        if (mapRef.current?.getLayer("selected-point")) {
          mapRef.current.setFilter("selected-point", ["==", ["to-string", ["get", "id"]], id]);
        }

        const popup = new maplibregl.Popup()
          .setLngLat([lng, lat])
          .setHTML(`<div style="padding: 4px; font-weight: bold; font-family: sans-serif;">${res.cafe_name}</div>`)
          .addTo(mapRef.current);

        popup.on("close", () => {
          if (mapRef.current?.getLayer("selected-point")) {
            const currentFilter = mapRef.current.getFilter("selected-point");
            if (currentFilter && currentFilter[2] === id) {
              mapRef.current.setFilter("selected-point", ["==", ["to-string", ["get", "id"]], "nothing"]);
            }
          }
        });
      }
    }

    setSearchQuery(res.cafe_name || res.city_name || "");
    setSearchResults([]);
  };

  return (
    <div style={{ position: "relative", height: "100vh", width: "100%" }}>
      <div ref={containerRef} style={{ height: "100%", width: "100%" }} />

      {/* TOP LEFT PANEL: SEARCH & FILTERS */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          zIndex: 10,
          fontFamily: "sans-serif",
          width: "320px",
        }}
      >
        {/* Search Bar */}
        <div style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="Search eatery or city..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              fontSize: "14px",
              boxSizing: "border-box",
              outline: "none",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
            onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
          />

          {/* Autocomplete Dropdown */}
          {searchResults.length > 0 && (
            <div style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              background: "white",
              borderRadius: "8px",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
              marginTop: "6px",
              overflowY: "auto",
              overflowX: "hidden",
              maxHeight: "300px",
              border: "1px solid #f3f4f6"
            }}>
              {searchResults.map((res, idx) => (
                <div
                  key={res.id || idx}
                  onClick={() => handleResultClick(res)}
                  style={{
                    padding: "10px 14px",
                    cursor: "pointer",
                    borderBottom: idx !== searchResults.length - 1 ? "1px solid #f3f4f6" : "none",
                    fontSize: "13px",
                    transition: "background 0.2s"
                  }}
                  onMouseOver={e => e.currentTarget.style.background = "#f9fafb"}
                  onMouseOut={e => e.currentTarget.style.background = "white"}
                >
                  <div style={{ fontWeight: "600", color: "#1f2937", marginBottom: "2px" }}>{res.cafe_name}</div>
                  <div style={{ color: "#6b7280", fontSize: "11px" }}>{res.city_name || "Unknown City"}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Filters Box */}
        <div style={{
          display: "flex",
          gap: "12px",
          background: "white",
          padding: "12px",
          borderRadius: "8px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          border: "1px solid #e5e7eb"
        }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#4b5563", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Unclaimed
            </label>
            <select
              value={filterUnclaimed}
              onChange={(e) => setFilterUnclaimed(e.target.value)}
              style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "13px", outline: "none", cursor: "pointer", backgroundColor: "#f9fafb" }}
            >
              <option value="all">All</option>
              <option value="1">Yes (1)</option>
              <option value="0">No (0)</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#4b5563", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Published
            </label>
            <select
              value={filterPublished}
              onChange={(e) => setFilterPublished(e.target.value)}
              style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "13px", outline: "none", cursor: "pointer", backgroundColor: "#f9fafb" }}
            >
              <option value="all">All</option>
              <option value="1">Yes (1)</option>
              <option value="0">No (0)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ZOOM CONTROLS (Bottom Right) */}
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
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
          border: "1px solid #e5e7eb",
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