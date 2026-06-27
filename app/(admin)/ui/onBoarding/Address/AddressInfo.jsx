import { Paper, Typography, Snackbar, Alert } from "@mui/material";
import { useState, useEffect, useCallback } from "react";
import AddressInfoForm from "./AddressInfoForm";
import AddressInfoMap from "./AddressInfoMap";
import instanceV1 from "../../restaurant/authaxios";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AddressInfo = ({ datas, action, setAction }) => {
    useEffect(() => {
        console.log('datas', datas)
    }, [datas])

    const [cityId, setCityId] = useState(null);
    const [data, setData] = useState({
        address_1: "",
        address_2: "",
        city: "",
        state: "",
        country: "India",
        latitude: "",
        longitude: "",
    });
    const [pincode, setPinCode] = useState("");
    const [alert, setAlert] = useState({ open: false, severity: "info", message: "" });
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [position, setPosition] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const OlaApiKey = import.meta.env.VITE_OLAMAP_API_KEY;
    const token = localStorage.getItem("authToken");
    const api = instanceV1(token);

    // --- Prefill from datas prop
    useEffect(() => {
        if (datas && typeof datas === "object") {
            // Convert to array if it's an object
            const dataArray = Array.isArray(datas) ? datas : Object.values(datas);

            if (dataArray.length > 0) {
                const d = dataArray[0];
                setData({
                    address_1: d.address_1 || "",
                    address_2: d.address_2 || "",
                    city: d.city_name || "",
                    state: d.state_name || "",
                    country: d.country_name || "India",
                    latitude: d.latitude || "",
                    longitude: d.longitude || "",
                });
                setPinCode(d.pin_code || "");
                if (d.latitude && d.longitude) setPosition({ lat: d.latitude, lng: d.longitude });
                setSearchQuery(d.full_address || "");
            }
        }
    }, [datas]);


    // --- Fill address from coordinates
    const fillAddressFromCoords = useCallback(async (lat, lon) => {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`);
            const result = await res.json();
            const addr = result.address || {};
            const displayParts = result.display_name ? result.display_name.split(",") : [];
            const address_1 = displayParts[0]?.trim() || "";
            const address_2 = displayParts.slice(1, -3).map(p => p.trim()).join(", ");


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

    // --- Get place details
    const getPlaceDetails = async (placeId) => {
        try {
            const res = await axios.get(`https://api.olamaps.io/places/v1/details`, {
                params: { place_id: placeId, api_key: OlaApiKey }
            });
            if (res.data?.result) {
                const loc = res.data.result.geometry?.location;
                const formatedAddress = res.data.result.formatted_address;
                const shortAddress = formatedAddress.split(",")[0].trim();
                const parts = formatedAddress.split(",").map(p => p.trim());
                const address2 = parts.slice(1, -3).join(", ");
                const components = res.data.result.address_components || [];
                const sublocality = components.find(c => c.types.includes("sublocality") || c.types.includes("neighborhood"));
                const cityComp = components.find(c => c.types.includes("locality") || c.types.includes("administrative_area_level_2"));
                const stateComp = components.find(c => c.types.includes("administrative_area_level_1"));
                const postal = components.find(c => c.types.includes("postal_code"));

                const address_1 = shortAddress || "";
                const address_2 = address2 || "";
                const city = cityComp?.long_name || "";
                const state = stateComp?.long_name || "";
                const pin = postal?.long_name || "";

                if (loc) setPosition({ lat: loc.lat, lng: loc.lng });
                setData(prev => ({
                    ...prev,
                    address_1,
                    address_2,
                    city,
                    state,
                    latitude: loc?.lat || prev.latitude,
                    longitude: loc?.lng || prev.longitude,
                }));
                setPinCode(pin);
                setSearchQuery(res.data.result.formatted_address || "");
            }
        } catch (err) {
            console.error("Error fetching place details:", err);
        }
    };

    // --- Get current location
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

    // --- Search locations
    useEffect(() => {
        const t = setTimeout(async () => {
            if (!searchQuery || searchQuery.length < 3) return setSearchResults([]);
            setIsSearching(true);
            try {
                const response = await axios.get(`https://api.olamaps.io/places/v1/autocomplete`, {
                    params: { input: searchQuery, api_key: OlaApiKey }
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
        }, 500);
        return () => clearTimeout(t);
    }, [searchQuery, OlaApiKey]);

    const navigate = useNavigate();

    const check = localStorage.getItem("cafeListId");
    if (!check) {
        navigate('/onboarding/settings')
    }
    // --- Submit data
    const submitData = async () => {
        try {
            const cafe_list_id = localStorage.getItem("cafeListId");
            const payload = {
                cafe_list_id: cafe_list_id,
                city_id: cityId,
                address_1: data.address_1,
                address_2: data.address_2,
                pin_code: pincode,
                latitude: data.latitude,
                longitude: data.longitude,
                full_address: `${data.address_1}, ${data.address_2}, ${data.city}, ${pincode}`
            };
            await api.post("/api/admin/onboard/v1/cafe/address", payload);
            setAction(() => !action)
            navigate('/onboarding/imggallery')

            setAlert({ open: true, severity: "success", message: "Address saved successfully" });
        } catch (err) {
            console.error(err);
            setAlert({ open: true, severity: "error", message: "Failed to save address" });
        }
    };

    return (
        <Paper sx={{ p: 3, width: '100%' }}>
            <Typography variant="h5" gutterBottom>Address Info</Typography>
            {isOffline && <Typography variant="body2" color="error">You are offline. Fields disabled.</Typography>}

            <AddressInfoForm
                cityId={cityId} setCityId={setCityId}
                data={data} setData={setData} pincode={pincode} setPinCode={setPinCode} isOffline={isOffline}
                searchQuery={searchQuery} setSearchQuery={setSearchQuery} searchResults={searchResults} isSearching={isSearching}
                getPlaceDetails={getPlaceDetails} getCurrentLocation={getCurrentLocation} submitData={submitData}
            />

            <AddressInfoMap
                OlaApiKey={OlaApiKey} position={position} setPosition={setPosition} fillAddressFromCoords={fillAddressFromCoords}
            />

            <Snackbar open={alert.open} autoHideDuration={3000} onClose={() => setAlert({ ...alert, open: false })}>
                <Alert severity={alert.severity}>{alert.message}</Alert>
            </Snackbar>
        </Paper>
    );
};

export default AddressInfo;
