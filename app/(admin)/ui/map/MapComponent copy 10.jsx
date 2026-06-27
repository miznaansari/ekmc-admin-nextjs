import { useEffect, useRef, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import db from "../indexedDB/db";
import {
  Box,
  TextField,
  Paper,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  InputAdornment,
  Collapse
} from "@mui/material";
import { Add as AddIcon, Remove as RemoveIcon, Search as SearchIcon, Tune as TuneIcon, MyLocation as MyLocationIcon, Close } from "@mui/icons-material";

export default function MapComponent() {
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const allEateriesRef = useRef([]);
  const userLocationRef = useRef(null);

  const [zoomLevel, setZoomLevel] = useState(10);

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [filterUnclaimed, setFilterUnclaimed] = useState("all");
  const [filterPublished, setFilterPublished] = useState("all");
  const [filterCrawler, setFilterCrawler] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

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
      if (filterCrawler !== "all" && String(i.is_crawler) !== filterCrawler) return;

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
  }, [filterUnclaimed, filterPublished, filterCrawler]);

  // Trigger filters when dropdowns change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // 🔥 Focus Cafe Helper
  const handleFocusCafe = useCallback((res) => {
    const latRaw = res.lat ?? res.latitude;
    const lngRaw = res.lng ?? res.longitude;

    if (latRaw && lngRaw) {
      const lat = Number(latRaw);
      const lng = Number(lngRaw);

      if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
        if (res.isCity) {
          mapRef.current?.flyTo({ center: [lng, lat], zoom: 12, essential: true });
          setSearchQuery(res.city_name);
          setSearchResults([]);
          return;
        }

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
  }, []);

  // Robust detection for global map view change events
  useEffect(() => {
    const checkPendingMapView = async () => {
      const cafeId = localStorage.getItem("mapViewData");
      if (cafeId && localStorage.getItem("mapView") === "true") {

        if (!mapRef.current) return; // wait for map instance

        let cafe = allEateriesRef.current.find((c) => String(c.id) === String(cafeId));

        // Fallback: If not in our filtered list, fetch directly from DB
        if (!cafe) {
          try {
            const allItems = await db.eatery_list.toArray();
            cafe = allItems.find((c) => String(c.id) === String(cafeId));
          } catch (e) { }
        }

        if (cafe) {
          const lat = Number(cafe.lat ?? cafe.latitude);
          const lng = Number(cafe.lng ?? cafe.longitude);

          if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
            // Ensure map style and our custom source are fully loaded before flying
            if (mapRef.current.isStyleLoaded() && mapRef.current.getSource("eateries")) {
              handleFocusCafe(cafe);
              localStorage.removeItem("mapViewData"); // Mark as consumed so we don't refocus repeatedly
            }
          } else {
            alert("Error: Location data (latitude/longitude) is missing for this eatery.");
            localStorage.removeItem("mapViewData"); // Mark as consumed to prevent loop
          }
        }
      }
    };

    // Poll every 800ms to catch any missed events during routing or slow map loads
    const intervalId = setInterval(checkPendingMapView, 800);

    // Also respond instantly to the event if the map is already open
    window.addEventListener("mapViewChange", checkPendingMapView);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("mapViewChange", checkPendingMapView);
    };
  }, [handleFocusCafe]);

  // 🔥 Fetch Data ONCE
  const fetchInitialData = async (map) => {
    console.log("📦 LOADING DATA FROM INDEXEDDB...");
    const all = [];

    await db.eatery_list.each((item) => {
      all.push(item);
    });

    allEateriesRef.current = all;
    console.log("📍 ALL EATERIES LOADED:", all.length);

    // Apply initial filters to populate map
    applyFilters();
  };

  useEffect(() => {
    let initialCenter = [75.7873, 26.9124]; // Default to Jaipur
    let initialZoom = 10;
    const savedViewStr = localStorage.getItem("map_last_view");
    let hasSavedView = false;

    if (savedViewStr) {
      try {
        const savedView = JSON.parse(savedViewStr);
        if (savedView.center && savedView.zoom) {
          initialCenter = savedView.center;
          initialZoom = savedView.zoom;
          hasSavedView = true;
        }
      } catch (e) { }
    }

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
      center: initialCenter,
      zoom: initialZoom,
    });

    mapRef.current = map;

    // Save map view on move/zoom
    map.on("moveend", () => {
      localStorage.setItem(
        "map_last_view",
        JSON.stringify({
          center: map.getCenter().toArray(),
          zoom: map.getZoom(),
        })
      );
    });

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

      // User Location Marker & Initial FlyTo
      let userMarker = null;

      if ("geolocation" in navigator) {
        navigator.geolocation.watchPosition(
          (pos) => {
            const lng = pos.coords.longitude;
            const lat = pos.coords.latitude;
            userLocationRef.current = [lng, lat];

            if (!userMarker) {
              const el = document.createElement("div");
              el.style.width = "18px";
              el.style.height = "18px";
              el.style.backgroundColor = "#3b82f6";
              el.style.border = "3px solid white";
              el.style.borderRadius = "50%";
              el.style.boxShadow = "0 0 8px rgba(0,0,0,0.4)";

              userMarker = new maplibregl.Marker({ element: el })
                .setLngLat([lng, lat])
                .addTo(map);
            } else {
              userMarker.setLngLat([lng, lat]);
            }
          },
          () => { },
          { enableHighAccuracy: true }
        );

        if (!hasSavedView) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              map.flyTo({
                center: [pos.coords.longitude, pos.coords.latitude],
                zoom: 12,
                essential: true
              });
            },
            () => { }
          );
        }
      }

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

  const handleLocateUser = () => {
    if (userLocationRef.current) {
      // Instant snap if we already have the tracked position
      mapRef.current?.flyTo({
        center: userLocationRef.current,
        zoom: 14,
        essential: true,
      });
    } else if ("geolocation" in navigator) {
      // Fallback if watchPosition hasn't fired yet
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = [pos.coords.longitude, pos.coords.latitude];
          userLocationRef.current = coords;
          mapRef.current?.flyTo({
            center: coords,
            zoom: 14,
            essential: true,
          });
        },
        (err) => {
          console.warn("High accuracy failed, trying low accuracy", err);
          // Retry without high accuracy
          navigator.geolocation.getCurrentPosition(
            (pos2) => {
              const coords = [pos2.coords.longitude, pos2.coords.latitude];
              userLocationRef.current = coords;
              mapRef.current?.flyTo({
                center: coords,
                zoom: 14,
                essential: true,
              });
            },
            (err2) => {
              console.error("Could not fetch location", err2);
              alert("Could not fetch your location. Please check your browser permissions.");
            },
            { timeout: 10000 }
          );
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

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
    handleFocusCafe(res);
    setSearchQuery(res.cafe_name || res.city_name || "");
    setSearchResults([]);
  };

  return (
    <Box position="relative" overflow="hidden" sx={{ height: "100%", width: "100%" }}>
      <div ref={containerRef} style={{ height: "100%", width: "100%" }} />

      {/* TOP RIGHT PANEL: CLOSE BUTTON */}
      <Box position="absolute" top={20} right={20} zIndex={10}>
        <Paper elevation={1} sx={{ borderRadius: 2 }}>
          <IconButton
            onClick={() => {
              localStorage.setItem("mapView", "false");
              window.dispatchEvent(new Event("mapViewChange"));
            }}
            size="small"
            sx={{ backgroundColor: "white", "&:hover": { backgroundColor: "#f3f4f6" }, p: 1 }}
            title="Close Map View"
          >
            <Close />
          </IconButton>
        </Paper>
      </Box>

      {/* TOP LEFT PANEL: SEARCH & FILTERS */}
      <Box position="absolute" top={20} left={20} zIndex={10} sx={{ display: "flex", flexDirection: "column", gap: 1.5, width: 360 }}>
        {/* Search Bar Row */}
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
          <Box position="relative" sx={{ flex: 1 }}>
            <TextField
              fullWidth
              placeholder="Search eatery or city..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{
                backgroundColor: "white",
                borderRadius: 2,
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                "& fieldset": { border: "none" },
              }}
            />

            {/* Autocomplete Dropdown */}
            {searchResults.length > 0 && (
              <Paper
                elevation={3}
                sx={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  mt: 1,
                  overflowY: "auto",
                  overflowX: "hidden",
                  maxHeight: 300,
                  borderRadius: 2,
                }}
              >
                <List disablePadding>
                  {searchResults.map((res, idx) => (
                    <ListItemButton
                      key={res.id || idx}
                      onClick={() => handleResultClick(res)}
                      divider={idx !== searchResults.length - 1}
                      sx={{ py: 1, px: 2 }}
                    >
                      <ListItemText
                        primary={res.cafe_name}
                        secondary={res.city_name || "Unknown City"}
                        primaryTypographyProps={{ variant: "body2", fontWeight: 600, color: "text.primary" }}
                        secondaryTypographyProps={{ variant: "caption", color: "text.secondary" }}
                      />
                    </ListItemButton>
                  ))}
                </List>
              </Paper>
            )}
          </Box>

          {/* Filter Toggle Button */}
          <Paper
            elevation={1}
            sx={{
              backgroundColor: showFilters ? "#f3f4f6" : "white",
              borderRadius: 2,
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 40,
              height: 40,
              flexShrink: 0,
              transition: "background-color 0.2s"
            }}
          >
            <IconButton
              onClick={() => setShowFilters(!showFilters)}
              size="small"
              color={showFilters ? "primary" : "default"}
            >
              <TuneIcon fontSize="small" />
            </IconButton>
          </Paper>
        </Box>

        {/* Filters Box (Collapsible) */}
        <Collapse in={showFilters}>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              display: "flex",
              gap: 2,
              borderRadius: 2,
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            }}
          >
            <FormControl fullWidth size="small">
              <InputLabel id="unclaimed-label" sx={{ fontSize: "14px" }}>Unclaimed</InputLabel>
              <Select
                labelId="unclaimed-label"
                value={filterUnclaimed}
                label="Unclaimed"
                onChange={(e) => setFilterUnclaimed(e.target.value)}
                sx={{ backgroundColor: "#f9fafb", fontSize: "14px", borderRadius: 1.5 }}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="1">Yes (1)</MenuItem>
                <MenuItem value="0">No (0)</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel id="published-label" sx={{ fontSize: "14px" }}>Published</InputLabel>
              <Select
                labelId="published-label"
                value={filterPublished}
                label="Published"
                onChange={(e) => setFilterPublished(e.target.value)}
                sx={{ backgroundColor: "#f9fafb", fontSize: "14px", borderRadius: 1.5 }}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="1">Yes (1)</MenuItem>
                <MenuItem value="0">No (0)</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel id="crawler-label" sx={{ fontSize: "14px" }}>Crawler</InputLabel>
              <Select
                labelId="crawler-label"
                value={filterCrawler}
                label="Crawler"
                onChange={(e) => setFilterCrawler(e.target.value)}
                sx={{ backgroundColor: "#f9fafb", fontSize: "14px", borderRadius: 1.5 }}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="1">Yes (1)</MenuItem>
                <MenuItem value="0">No (0)</MenuItem>
              </Select>
            </FormControl>
          </Paper>
        </Collapse>
      </Box>

      {/* LOCATION & ZOOM CONTROLS (Bottom Right) */}
      <Box position="absolute" bottom={40} right={20} zIndex={10} sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {/* Locate User Button */}
        <Paper
          elevation={1}
          sx={{
            p: 0.5,
            borderRadius: 2,
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
          }}
        >
          <IconButton
            onClick={handleLocateUser}
            size="small"
            sx={{ backgroundColor: "#f3f4f6", "&:hover": { backgroundColor: "#e5e7eb" }, borderRadius: 1.5 }}
            title="Find My Location"
          >
            <MyLocationIcon fontSize="small" />
          </IconButton>
        </Paper>

        {/* Zoom Controls */}
        <Paper
          elevation={1}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 0.5,
            p: 0.5,
            borderRadius: 2,
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
          }}
        >
          <IconButton
            onClick={handleZoomIn}
            size="small"
            sx={{ backgroundColor: "#f3f4f6", "&:hover": { backgroundColor: "#e5e7eb" }, borderRadius: 1.5 }}
            title="Zoom In"
          >
            <AddIcon fontSize="small" />
          </IconButton>

          <Typography variant="caption" fontWeight="bold" textAlign="center" color="text.secondary" sx={{ my: 0.5 }}>
            {zoomLevel.toFixed(1)}z
          </Typography>

          <IconButton
            onClick={handleZoomOut}
            size="small"
            sx={{ backgroundColor: "#f3f4f6", "&:hover": { backgroundColor: "#e5e7eb" }, borderRadius: 1.5 }}
            title="Zoom Out"
          >
            <RemoveIcon fontSize="small" />
          </IconButton>
        </Paper>
      </Box>
    </Box>
  );
}