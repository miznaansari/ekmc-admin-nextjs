import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Grid,
  Paper,
  Snackbar,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText
} from '@mui/material';
import { Search, MyLocation, Clear } from "@mui/icons-material";
import axios from "axios";
import { useEffect, useState, useCallback, useRef } from "react";
import { OlaMaps } from 'olamaps-web-sdk';

const AddressInfo = () => {
  const [pincode, setPinCode] = useState("");
  const [data, setData] = useState({
    address_1: "",
    address_2: "",
    city: "",
    state: "",
    country: "India",
    latitude: "",
    longitude: "",
  });
  const [alert, setAlert] = useState({ open: false, severity: "info", message: "" });
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const [position, setPosition] = useState(null);
  const OlaApiKey = process.env.VITE_OLAMAP_API_KEY;

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const popupRef = useRef(null);
  const olaMapsRef = useRef(null);
  const mapInitialized = useRef(false);

  // Reverse geocode for coordinates to fill address
  const fillAddressFromCoords = useCallback(async (lat, lon) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`);
      const result = await res.json();
      const addr = result.address || {};

      // Split display_name into address_1 and address_2
      const displayParts = result.display_name ? result.display_name.split(",") : [];
      const address_1 = displayParts[0]?.trim() || "";
      const address_2 = displayParts.slice(1, displayParts.length - 3).join(", ").trim(); // exclude city, state, pincode, country

      setData(prev => ({
        ...prev,
        address_1,
        address_2,
        city: addr.city || addr.town || addr.village || "",
        state: addr.state || "",
        latitude: lat,
        longitude: lon,
      }));

      setPinCode(addr.postcode || "");
      setSearchQuery(result.display_name || "");
    } catch (err) {
      console.error("Reverse geocoding failed", err);
    }
  }, []);

  // Initialize map
  useEffect(() => {
    if (!OlaApiKey || mapInitialized.current) return;

    olaMapsRef.current = new OlaMaps({ apiKey: OlaApiKey });

    mapRef.current = olaMapsRef.current.init({
      style: "https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json",
      container: "map",
      center: [77.61648476788898, 12.931423492103944],
      zoom: 12,
    });

    mapRef.current.on("click", (e) => {
      const { lat, lng } = e.lngLat;
      setPosition({ lat, lng });
      fillAddressFromCoords(lat, lng);
    });

    mapInitialized.current = true;

    return () => {
      if (mapRef.current) mapRef.current.remove();
      markerRef.current = null;
      popupRef.current = null;
      mapInitialized.current = false;
    };
  }, [OlaApiKey, fillAddressFromCoords]);

  // Update marker
  const updateMarkerPosition = useCallback((pos) => {
    if (!mapRef.current || !olaMapsRef.current) return;
    const { lat, lng } = pos;

    if (!markerRef.current) {
      markerRef.current = olaMapsRef.current
        .addMarker({ offset: [0, -20], anchor: "bottom", color: "#FF0000", draggable: true })
        .setLngLat([lng, lat])
        .addTo(mapRef.current);

      popupRef.current = olaMapsRef.current.addPopup({ offset: [0, -30], anchor: "top" });
      markerRef.current.setPopup(popupRef.current);

      markerRef.current.on("dragend", () => {
        const { lat: dragLat, lng: dragLng } = markerRef.current.getLngLat();
        const newPos = { lat: dragLat, lng: dragLng };
        setPosition(newPos);
        fillAddressFromCoords(dragLat, dragLng);
      });
    } else {
      markerRef.current.setLngLat([lng, lat]);
    }

    mapRef.current.flyTo({ center: [lng, lat], zoom: 15, duration: 1000 });
  }, [fillAddressFromCoords]);

  useEffect(() => { if (position) updateMarkerPosition(position); }, [position, updateMarkerPosition]);

  // Search autocomplete using Ola Maps
  const searchLocation = async (query) => {
    if (!query.trim() || query.length < 3) return setSearchResults([]);
    setIsSearching(true);
    try {
      const response = await axios.get(`https://api.olamaps.io/places/v1/autocomplete`, {
        params: { input: query, api_key: OlaApiKey }
      });
      if (response.data?.predictions) {
        setSearchResults(response.data.predictions.map(p => ({
          id: p.place_id,
          title: p.structured_formatting?.main_text || p.description,
          subtitle: p.structured_formatting?.secondary_text || '',
          placeId: p.place_id
        })));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const getPlaceDetails = async (placeId) => {
    try {
      const res = await axios.get(`https://api.olamaps.io/places/v1/details`, {
        params: { place_id: placeId, api_key: OlaApiKey }
      });
      if (res.data?.result) {
        const loc = res.data.result.geometry?.location;
        if (loc) setPosition({ lat: loc.lat, lng: loc.lng });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition({ lat: latitude, lng: longitude });
        fillAddressFromCoords(latitude, longitude);
        setAlert({ open: true, severity: "success", message: "Updated to your current location" });
      },
      () => setAlert({ open: true, severity: "error", message: "Unable to get location" }),
      { enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    const t = setTimeout(() => { if (searchQuery) searchLocation(searchQuery); }, 500);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const submitData = () => {
    console.log("Submit data →", { ...data, pincode });
    setAlert({ open: true, severity: "success", message: "Data saved (mock)" });
  };

  return (
    <Paper sx={{ p: 3, width: '100%' }}>
      <Typography variant="h5" gutterBottom>Address Info</Typography>
      {isOffline && <Typography variant="body2" color="error">You are offline. Fields disabled.</Typography>}
      <Grid container spacing={2}>
        <Grid size={6}>
          <TextField label="Address 1" name="address_1" value={data.address_1} onChange={handleChange} fullWidth size="small" disabled={isOffline} />
        </Grid>
        <Grid size={6}>
          <TextField label="Address 2" name="address_2" value={data.address_2} onChange={handleChange} fullWidth size="small" disabled={isOffline} />
        </Grid>
        <Grid size={6}>
          <TextField label="City" name="city" value={data.city} onChange={handleChange} fullWidth size="small" disabled={isOffline} />
        </Grid>
        <Grid size={6}>
          <TextField label="State" name="state" value={data.state} onChange={handleChange} fullWidth size="small" disabled={isOffline} />
        </Grid>
        <Grid size={6}>
          <TextField label="Pincode" value={pincode} onChange={(e) => setPinCode(e.target.value)} fullWidth size="small" disabled={isOffline} />
        </Grid>
        <Grid size={12}>
          <Autocomplete
            fullWidth
            freeSolo
            options={searchResults}
            getOptionLabel={(o) => o.title || ""}
            loading={isSearching}
            onInputChange={(e, v) => setSearchQuery(v)}
            onChange={(e, v) => { if (v) getPlaceDetails(v.placeId); }}
            inputValue={searchQuery}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Location on Map"
                size="small"
                disabled={isOffline}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
                  endAdornment: (
                    <>
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={getCurrentLocation} disabled={isOffline}><MyLocation /></IconButton>
                        {searchQuery && <IconButton size="small" onClick={() => setSearchQuery("")}><Clear /></IconButton>}
                      </InputAdornment>
                      {params.InputProps.endAdornment}
                    </>
                  )
                }}
              />
            )}
          />
          <Box sx={{ height: 400, mt: 2 }}>
            <div id="map" style={{ height: "100%", width: "100%" }} />
          </Box>
        </Grid>
        <Grid size={12}>
          <Button variant="contained" onClick={submitData} disabled={isOffline}>Save</Button>
        </Grid>
      </Grid>
      <Snackbar open={alert.open} autoHideDuration={3000} onClose={() => setAlert({ ...alert, open: false })}>
        <Alert severity={alert.severity}>{alert.message}</Alert>
      </Snackbar>
    </Paper>
  );
};

export default AddressInfo;
