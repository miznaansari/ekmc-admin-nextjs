import { Alert, Autocomplete, Box, Button, Grid, Paper, Snackbar, TextField, Typography, InputAdornment, IconButton } from "@mui/material";
import { Search, MyLocation, Clear, Add, Remove } from "@mui/icons-material";
import axios from "axios";
import { useEffect, useState, useCallback, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { OlaMaps } from 'olamaps-web-sdk'

const AddressInfo = ({ cafeId, mapContainerId }) => {
    const { control, handleSubmit, reset, getValues, watch, formState: { errors }, setValue } = useForm({
        defaultValues: {
            address_1: "",
            address_2: "",
            city_name: "",
            city_id: null,
            pin_code: "",
            latitude: "",
            longitude: "",
        },
        mode: 'onBlur' 
    });

    const [alert, setAlert] = useState({
        open: false,
        severity: "info",
        message: ""
    });
    const [isOffline, setIsOffline] = useState(!navigator.onLine); 
    const baseUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL; 
    const token = localStorage.getItem("authToken");
    const [searchCityQuery, setSearchCityQuery] = useState("");
    const [cityOptions, setCityOptions] = useState([]);
    const [selectedCity, setSelectedCity] = useState(null);
    const [initialSelectedCity, setInitialSelectedCity] = useState(null);
    const [position, setPosition] = useState(null);
    const [initialPosition, setInitialPosition] = useState(null);
    const [initialFormValues, setInitialFormValues] = useState(null);
    const [isFormModified, setIsFormModified] = useState(false);
    const OlaApiKey = import.meta.env.VITE_OLAMAP_API_KEY;

    // Search location states
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);
    // NEW: State for selected address text
    const [selectedAddressText, setSelectedAddressText] = useState("");
    // NEW: State for initial address text (for comparison)
    const [initialAddressText, setInitialAddressText] = useState("");
    const resolvedMapContainerId = mapContainerId || `map-${cafeId}`;

    // Refs to store map and marker instances
    const mapRef = useRef(null);
    const markerRef = useRef(null);
    const popupRef = useRef(null);
    const olaMapsRef = useRef(null);
    const mapInitialized = useRef(false);

    // Validation rules
    const validationRules = {
        address_1: {
            required: "Address 1 is required"
        },
        city_id: {
            required: "City is required"
        },
        pin_code: {
            required: "Pin code is required",
            pattern: {
                value: /^\d{6}$/,
                message: "Pin code must be 6 digits"
            }
        }
    };

    // Watch all form fields for changes
    const formValues = watch();

    // NEW: Function to extract pincode from address components
    const extractPincode = (addressComponents) => {
        if (!addressComponents || !Array.isArray(addressComponents)) return null;
        
        const postalCodeComponent = addressComponents.find(component => 
            component.types && component.types.includes('postal_code')
        );
        
        return postalCodeComponent ? postalCodeComponent.long_name : null;
    };

    // Check if form data is modified
    const checkIfDataModified = useCallback(() => {
        if (!initialFormValues) return false;
        
        const currentValues = getValues();
        
        // Check if text fields have changed
        const isTextFieldsChanged = 
            currentValues.address_1 !== initialFormValues.address_1 ||
            currentValues.address_2 !== initialFormValues.address_2 ||
            currentValues.pin_code !== initialFormValues.pin_code;
            
        // Check if city selection has changed
        const isCityChanged = 
            selectedCity?.value !== initialSelectedCity?.value;
            
        // Check if map location has changed
        const isPositionChanged = 
            !initialPosition ? !!position :
            !position ? !!initialPosition :
            Math.abs(position.lat - initialPosition.lat) > 0.000001 || 
            Math.abs(position.lng - initialPosition.lng) > 0.000001;
            
        // NEW: Check if address text has changed
        const isAddressTextChanged = selectedAddressText !== initialAddressText;
            
        return isTextFieldsChanged || isCityChanged || isPositionChanged || isAddressTextChanged;
    }, [getValues, initialFormValues, selectedCity, initialSelectedCity, position, initialPosition, selectedAddressText, initialAddressText]);

    // Update the modified status whenever relevant state changes
    useEffect(() => {
        setIsFormModified(checkIfDataModified());
    }, [formValues, selectedCity, position, selectedAddressText, checkIfDataModified]);

    // Zoom functions
    const zoomIn = useCallback(() => {
        if (mapRef.current) {
            const currentZoom = mapRef.current.getZoom();
            mapRef.current.setZoom(currentZoom + 1);
        }
    }, []);

    const zoomOut = useCallback(() => {
        if (mapRef.current) {
            const currentZoom = mapRef.current.getZoom();
            mapRef.current.setZoom(currentZoom - 1);
        }
    }, []);

    // Initialize OLA Maps only once
    useEffect(() => {
        if (!OlaApiKey || mapInitialized.current) return;

        let isMounted = true;

        olaMapsRef.current = new OlaMaps({
            apiKey: OlaApiKey,
        });

        const defaultCenter = [77.61648476788898, 12.931423492103944];
        
        const mapInitResult = olaMapsRef.current.init({
            style: "https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json",
            container: resolvedMapContainerId,
            center: defaultCenter,
            zoom: 15,
        });

        const setupMap = (mapInstance) => {
            if (!isMounted) {
                if (mapInstance && typeof mapInstance.remove === "function") {
                    mapInstance.remove();
                }
                return;
            }
            mapRef.current = mapInstance;
            
            if (mapInstance && typeof mapInstance.on === "function") {
                // Add click event listener to map
                mapInstance.on("click", (e) => {
                    const { lat, lng } = e.lngLat;
                    console.log("Map clicked - lat and lng:", lat, lng);
                    
                    const newPos = { 
                        lat: parseFloat(lat.toFixed(6)), 
                        lng: parseFloat(lng.toFixed(6)) 
                    };

                    updateMarkerPosition(newPos, false); // Don't center map on click
                    setPosition(newPos);
                    
                    // NEW: Get address for clicked location and update pincode
                    reverseGeocode(newPos);
                });
            }

            if (position) {
                updateMarkerPosition(position);
            }
        };

        if (mapInitResult instanceof Promise || (mapInitResult && typeof mapInitResult.then === "function")) {
            mapInitResult.then(setupMap).catch((err) => {
                console.error("Failed to initialize OLA Maps:", err);
            });
        } else {
            setupMap(mapInitResult);
        }

        mapInitialized.current = true;

        // Cleanup function
        return () => {
            isMounted = false;
            if (mapRef.current) {
                if (typeof mapRef.current.remove === "function") {
                    mapRef.current.remove();
                }
                mapRef.current = null;
                markerRef.current = null;
                popupRef.current = null;
                mapInitialized.current = false;
            }
        };
    }, [OlaApiKey, resolvedMapContainerId]);

    // NEW: Function to perform reverse geocoding and get address details
    const reverseGeocode = async (position) => {
        try {
            const response = await axios.get(
                `https://api.olamaps.io/places/v1/reverse-geocode`,
                {
                    params: {
                        latlng: `${position.lat},${position.lng}`,
                        api_key: OlaApiKey
                    }
                }
            );

            if (response.data && response.data.results && response.data.results.length > 0) {
                const result = response.data.results[0];
                const formattedAddress = result.formatted_address;
                
                // Extract pincode from address components
                const pincode = extractPincode(result.address_components);
                
                // Update search field with the address
                setSelectedAddressText(formattedAddress);
                setSearchQuery(formattedAddress);
                
                // Update pincode if found
                if (pincode) {
                    setValue('pin_code', pincode);
                }
                
                console.log('Reverse geocoded address:', formattedAddress);
                console.log('Extracted pincode:', pincode);
            }
        } catch (error) {
            console.error('Error reverse geocoding:', error);
        }
    };

    // Function to update marker position
    const updateMarkerPosition = useCallback((newPosition, shouldCenterMap = true) => {
        if (!mapRef.current || !olaMapsRef.current) return;

        const { lat, lng } = newPosition;

        if (!markerRef.current) {
            // Create marker if it doesn't exist
            markerRef.current = olaMapsRef.current
                .addMarker({
                    offset: [0, -20],
                    anchor: "bottom",
                    color: "#FF0000",
                    draggable: true,
                })
                .setLngLat([lng, lat])
                .addTo(mapRef.current);

            // Create popup
            popupRef.current = olaMapsRef.current.addPopup({
                offset: [0, -30],
                anchor: "top",
            });

            markerRef.current.setPopup(popupRef.current);

            // Add drag event listener
            markerRef.current.on("dragend", () => {
                const { lat: dragLat, lng: dragLng } = markerRef.current.getLngLat();
                const posData = {
                    lat: parseFloat(dragLat.toFixed(6)),
                    lng: parseFloat(dragLng.toFixed(6)),
                };
                setPosition(posData);
                updatePopupText(posData);
                // NEW: Get address for dragged location and update pincode
                reverseGeocode(posData);
            });

            // Only center map when marker is first created or when explicitly requested
            if (shouldCenterMap) {
                mapRef.current.flyTo({
                    center: [lng, lat],
                    zoom: 15,
                    duration: 1000
                });
            }
        } else {
            // Update existing marker position
            markerRef.current.setLngLat([lng, lat]);
            
            // Only center map if explicitly requested, and preserve current zoom
            if (shouldCenterMap) {
                const currentZoom = mapRef.current.getZoom();
                mapRef.current.flyTo({
                    center: [lng, lat],
                    zoom: currentZoom, // Preserve current zoom level
                    duration: 1000
                });
            }
        }

        updatePopupText(newPosition);
    }, []);

    // Function to update popup text
    const updatePopupText = useCallback((pos) => {
        if (popupRef.current) {
            //popupRef.current.setText(`Lat: ${pos.lat}, Lng: ${pos.lng}`);
            if (!popupRef.current.isOpen()) {
                markerRef.current.togglePopup();
            }
        }
    }, []);

    // Function to search locations using Ola Maps API
    const searchLocation = async (query) => {
        if (!query.trim() || query.length < 3) {
            setSearchResults([]);
            setShowSearchResults(false);
            return;
        }

        setIsSearching(true);
        try {
            const response = await axios.get(
                `https://api.olamaps.io/places/v1/autocomplete`,
                {
                    params: {
                        input: query,
                        api_key: OlaApiKey,
                        // You can add more parameters like location bias, radius, etc.
                        // location: `${position?.lat},${position?.lng}`, // Bias search around current location
                        // radius: 50000 // 50km radius
                    }
                }
            );

            if (response.data && response.data.predictions) {
                const results = response.data.predictions.map((prediction) => ({
                    id: prediction.place_id,
                    title: prediction.structured_formatting?.main_text || prediction.description,
                    subtitle: prediction.structured_formatting?.secondary_text || '',
                    fullAddress: prediction.description,
                    placeId: prediction.place_id
                }));
                setSearchResults(results);
                setShowSearchResults(true);
            }
        } catch (error) {
            console.error('Error searching locations:', error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    // Function to get place details and coordinates
    const getPlaceDetails = async (placeId) => {
        try {
            const response = await axios.get(
                `https://api.olamaps.io/places/v1/details`,
                {
                    params: {
                        place_id: placeId,
                        api_key: OlaApiKey
                    }
                }
            );

            if (response.data && response.data.result) {
                const place = response.data.result;
                const location = place.geometry?.location;
                
                if (location) {
                    const newPosition = {
                        lat: parseFloat(location.lat.toFixed(6)),
                        lng: parseFloat(location.lng.toFixed(6))
                    };
                    
                    setPosition(newPosition);
                    updateMarkerPosition(newPosition);
                    
                    // NEW: Set the selected address text and update pincode
                    const selectedResult = searchResults.find(r => r.placeId === placeId);
                    if (selectedResult) {
                        setSelectedAddressText(selectedResult.fullAddress);
                        setSearchQuery(selectedResult.fullAddress);
                        
                        // Extract pincode from place details
                        const pincode = extractPincode(place.address_components);
                        if (pincode) {
                            setValue('pin_code', pincode);
                        }
                    }
                    
                    // Clear search results
                    setSearchResults([]);
                    setShowSearchResults(false);
                }
            }
        } catch (error) {
            console.error('Error getting place details:', error);
        }
    };

    // Function to get current location
    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            setAlert({
                open: true,
                severity: "error",
                message: "Geolocation is not supported by this browser",
            });
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const newPos = {
                    lat: parseFloat(position.coords.latitude.toFixed(6)),
                    lng: parseFloat(position.coords.longitude.toFixed(6))
                };
                setPosition(newPos);
                updateMarkerPosition(newPos);
                
                // NEW: Get address for current location and update pincode
                reverseGeocode(newPos);
                
                setAlert({
                    open: true,
                    severity: "success",
                    message: "Location updated to your current position",
                });
            },
            (error) => {
                console.error('Error getting current location:', error);
                setAlert({
                    open: true,
                    severity: "error",
                    message: "Unable to get your current location",
                });
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            }
        );
    };

    // NEW: Function to clear address text
    const clearAddressText = () => {
        setSelectedAddressText("");
        setSearchQuery("");
        setSearchResults([]);
        setShowSearchResults(false);
    };

    // NEW: Handle search input change
    const handleSearchInputChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        
        // If user is typing and the value doesn't match selectedAddressText, clear it
        if (value !== selectedAddressText) {
            setSelectedAddressText("");
        }
    };

    // NEW: Handle backspace/delete key to clear address
    const handleSearchKeyDown = (e) => {
        if ((e.key === 'Backspace' || e.key === 'Delete') && searchQuery === selectedAddressText) {
            // If user presses backspace on the full address, clear it
            clearAddressText();
        }
    };

    // Debounced search - only search if not showing selected address
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (searchQuery.trim() && searchQuery !== selectedAddressText) {
                searchLocation(searchQuery);
            } else if (!searchQuery.trim()) {
                setSearchResults([]);
                setShowSearchResults(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [searchQuery, selectedAddressText]);
    
    useEffect(() => {
        if (position && mapRef.current) {
            updateMarkerPosition(position);
        }
    }, [position, updateMarkerPosition]);

    // Fetch address info api
    const fetchAddress = async () => {
        try {
            const response = await axios.get(`${baseUrl}/api/user/admin/restaurant-all-info/${cafeId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log("response in address info - ", response.data?.data);
            const [data] = response.data.data;
            
            // Set form values
            const formData = {
                address_1: data.address_1 || "",
                address_2: data.address_2 || "",
                city_name: data.city_name || "",
                pin_code: data.pin_code || "",
                latitude: data.latitude || "",
                longitude: data.longitude || "",
                city_id: data.city_id || null,
            };
            
            reset(formData);
            
            // Set city data
            const cityData = {label: data.city_name, value: data.city_id};
            setSelectedCity(cityData);
            setInitialSelectedCity(cityData);
            
            // Set position data
            if (data.latitude && data.longitude) {
                const posData = {
                    lat: parseFloat(data.latitude),
                    lng: parseFloat(data.longitude),
                };
                setPosition(posData);
                setInitialPosition({...posData});
                
                // NEW: Get address text for the existing location
                reverseGeocode(posData).then(() => {
                    setInitialAddressText(selectedAddressText);
                });
            }
            
            // Store initial form values for comparison
            setInitialFormValues({...formData});
            
            // Reset modification status
            setIsFormModified(false);
        } catch(e) {
            console.log("error during address fetch- ", e);
        }
    };

    useEffect(() => {
        if (cafeId) {
            fetchAddress();
        }
    }, [cafeId]);

    // Fetch city dropdown
    const fetchCity = async () => {
        try {
            const response = await axios.get(`${baseUrl}/api/v1/city-list`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {
                    search: searchCityQuery
                }
            });
            console.log("city list- ", response.data.data);
            const options = response.data?.data.map((city) => ({
                label: city.city_name,
                value: city.city_id,
                state: city.state_name
            }));
            console.log("city options- ", options);
            setCityOptions(options);
        } catch(e) {
            console.log("error during fetch city - ", e);
        }
    };

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if(searchCityQuery.trim().length >= 1) {
                fetchCity();
            }
        }, 300);
        return () => clearTimeout(delayDebounce);
    }, [searchCityQuery]);

    // Edit Addressinfo
    const editAddressInfo = async (data) => {
        console.log("position inside edit - ", position);
        console.log("form data - ", data.latitude, data.longitude);
        
        // Check if there's no location data at all
        // Should show error only when BOTH conditions are true:
        // 1. No position from map interaction
        // 2. No existing latitude/longitude data
        if (!position && (!data.latitude || !data.longitude)) {
            setAlert({
                open: true, 
                severity: "error", 
                message: "Error: Please Select Location on map!"
            });
            return;
        }
        
        const newData = {
            ...data,
            city_id: selectedCity?.value || data.city_id,
            latitude: position?.lat || data.latitude,    
            longitude: position?.lng || data.longitude, 
        };
        console.log("payload- ", newData);

        try {
            const response = await axios.post(
                `${baseUrl}/api/user/admin/restaurant-edit-address-information/${cafeId}`,
                newData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            console.log("Address info updated:", response.data);
            
            // Show success alert
            setAlert({
                open: true,
                severity: "success",
                message: "Address info updated successfully",
            });
            
            // Update all initial values to match current values
            setInitialFormValues({...getValues()});
            setInitialSelectedCity({...selectedCity});
            setInitialPosition(position ? {...position} : null);
            // NEW: Update initial address text
            setInitialAddressText(selectedAddressText);
            
            // Reset modification status
            setIsFormModified(false);
            
        } catch(e) {
            console.log("error during submiting addressinfo- ", e);
            setAlert({
                open: true,
                severity: "error",
                message: "Error updating address info",
            });
        }
    };

    return (
        <Paper sx={{ p: 0 }}>
            <Typography variant="h5" gutterBottom>Address Info</Typography>
            {isOffline && (
                <Typography variant="body2" color="error" gutterBottom>
                    You are offline. All fields are disabled.
                </Typography>
            )}
            <Grid container spacing={2}>
                <Grid size={6}>
                    <Controller
                        name="address_1"
                        control={control}
                        rules={validationRules.address_1}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Address 1 *"
                                fullWidth
                                size="small"
                                disabled={isOffline}
                                error={!!errors.address_1}
                                helperText={errors.address_1?.message}
                                InputProps={{
                                    sx: {
                                      '& .MuiOutlinedInput-notchedOutline': {
                                      borderRadius: '4px',
                                    },
                                    }
                                  }}
                            />
                        )}
                    />
                </Grid>

                <Grid size={6}>
                <Controller
                        name="address_2"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Address 2"
                                fullWidth
                                size="small"
                                disabled={isOffline}
                                InputProps={{
                                    sx: {
                                      '& .MuiOutlinedInput-notchedOutline': {
                                      borderRadius: '4px',
                                    },
                                    }
                                  }}
                            />
                        )}
                    />
                </Grid>
              <Grid size={6}>
                    <Controller
                        name="city_id"
                        control={control}
                        rules={validationRules.city_id}
                        render={({field:{onChange}}) => (
                            <Box>
                               <Autocomplete
  options={cityOptions}
  value={selectedCity}
  getOptionLabel={(option) => option?.label || ""}
  isOptionEqualToValue={(option, value) =>
    option?.value === value?.value
  }
  onChange={(_, newValue) => {
    onChange(newValue?.value || null);
    setSelectedCity(newValue);
  }}
  onInputChange={(_, inputValue) => {
    setCityOptions([]);
    setSearchCityQuery(inputValue);
  }}
  sx={{
    "& .MuiOutlinedInput-root": {
      borderRadius: "4px",
    },
  }}
  renderOption={(props, option) => (
    <li {...props} key={option.value}>
      <span className="text-sm font-medium text-gray-900">
        {option.label}
      </span>
      {option.state && (
        <span className="text-xs text-gray-500">
          , {option.state}
        </span>
      )}
    </li>
  )}
  renderInput={(params) => (
    <TextField
      {...params}
      label="City *"
      fullWidth
      size="small"
      disabled={isOffline}
      error={
        !!errors.city_id ||
        (!selectedCity?.value && formValues.city_id !== null)
      }
      helperText={
        errors.city_id?.message ||
        (!selectedCity?.value && formValues.city_id !== null
          ? "City is required"
          : "")
      }
    />
  )}
/>


                            </Box>
                        )}
                    />
                </Grid>

                <Grid size={6}>
                <Controller
                        name="pin_code"
                        control={control}
                        rules={validationRules.pin_code}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Pin code *"
                                fullWidth
                                size="small"
                                disabled={isOffline}
                                error={!!errors.pin_code}
                                helperText={errors.pin_code?.message}
                                InputProps={{
                                    sx: {
                                      '& .MuiOutlinedInput-notchedOutline': {
                                      borderRadius: '4px',
                                    },
                                    }
                                  }}

                            />
                        )}
                    />
                </Grid>
                
                <Grid size={12}>
                    <Typography variant="subtitle1">Location on Map</Typography>
                    
                    {/* Search Location Box */}
                    <Box sx={{ mb: 2, position: 'relative' }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search for a location..."
                            value={searchQuery}
                            onChange={handleSearchInputChange}
                            onKeyDown={handleSearchKeyDown}
                            disabled={isOffline}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search color="action" />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            size="small"
                                            onClick={getCurrentLocation}
                                            title="Use current location"
                                            disabled={isOffline}
                                        >
                                            <MyLocation />
                                        </IconButton>
                                        {(searchQuery || selectedAddressText) && (
                                            <IconButton
                                                size="small"
                                                onClick={clearAddressText}
                                                title="Clear address"
                                            >
                                                <Clear />
                                            </IconButton>
                                        )}
                                    </InputAdornment>
                                ),
                                sx: {
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderRadius: '4px',
                                    },
                                }
                            }}
                        />
                        
                        {/* Search Results Dropdown */}
                        {showSearchResults && searchResults.length > 0 && (
                            <Paper
                                sx={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    right: 0,
                                    zIndex: 1000,
                                    maxHeight: 300,
                                    overflow: 'auto',
                                    mt: 0.5
                                }}
                                elevation={3}
                            >
                                {searchResults.map((result) => (
                                    <Box
                                        key={result.id}
                                        sx={{
                                            p: 2,
                                            cursor: 'pointer',
                                            '&:hover': {
                                                backgroundColor: 'grey.100'
                                            },
                                            borderBottom: '1px solid',
                                            borderColor: 'grey.200'
                                        }}
                                        onClick={() => getPlaceDetails(result.placeId)}
                                    >
                                        <Typography variant="body2" fontWeight="medium">
                                            {result.title}
                                        </Typography>
                                        {result.subtitle && (
                                            <Typography variant="caption" color="text.secondary">
                                                {result.subtitle}
                                            </Typography>
                                        )}
                                    </Box>
                                ))}
                            </Paper>
                        )}
                        
                        {/* Loading indicator */}
                        {isSearching && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Searching...
                                </Typography>
                            </Box>
                        )}
                    </Box>
                    
                    <Grid size={12}>
                        <Box sx={{ height: "400px", width: "100%", mb: 2, position: 'relative' }}>
                            <div id={resolvedMapContainerId} style={{ height: "100%", width: "100%" }} />
                            
                            {/* Zoom Controls */}
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: 10,
                                    right: 10,
                                    zIndex: 1000,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 0
                                }}
                            >
                                {/* Zoom In Button */}
                                <IconButton
                                    onClick={zoomIn}
                                    disabled={isOffline}
                                    sx={{
                                        backgroundColor: 'white',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px 4px 0 0',
                                        width: 40,
                                        height: 40,
                                        '&:hover': {
                                            backgroundColor: '#f5f5f5'
                                        },
                                        '&:disabled': {
                                            backgroundColor: '#f9f9f9',
                                            color: '#ccc'
                                        }
                                    }}
                                    title="Zoom in"
                                >
                                    <Add fontSize="small" />
                                </IconButton>
                                
                                {/* Zoom Out Button */}
                                <IconButton
                                    onClick={zoomOut}
                                    disabled={isOffline}
                                    sx={{
                                        backgroundColor: 'white',
                                        border: '1px solid #ccc',
                                        borderTop: 0,
                                        borderRadius: '0 0 4px 4px',
                                        width: 40,
                                        height: 40,
                                        '&:hover': {
                                            backgroundColor: '#f5f5f5'
                                        },
                                        '&:disabled': {
                                            backgroundColor: '#f9f9f9',
                                            color: '#ccc'
                                        }
                                    }}
                                    title="Zoom out"
                                >
                                    <Remove fontSize="small" />
                                </IconButton>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
                <Grid size={12}>
                    <Button 
                        variant="contained" 
                        onClick={handleSubmit(editAddressInfo)}
                        disabled={!isFormModified || isOffline}
                    >
                        Save
                    </Button>
                </Grid>
            </Grid>
            {/* 🔔 Alert Snackbar */}
            <Snackbar
                open={alert.open}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                autoHideDuration={3000}
                onClose={() => setAlert({ ...alert, open: false })}
            >
                <Alert severity={alert.severity} sx={{ width: "100%" }}>
                    {alert.message}
                </Alert>
            </Snackbar>
        </Paper>
    );
};

export default AddressInfo;