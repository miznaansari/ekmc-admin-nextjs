import React, { useState, useEffect } from 'react';
import {
  Grid,
  TextField,
  Button,
  Snackbar,
  Alert,
  MenuItem,
  Container,
  Typography,
  Card,
  CardContent,
} from '@mui/material';
import AddLocationIcon from '@mui/icons-material/AddLocation';

import axios from 'axios';
import { Tooltip, Marker, Polygon, useMapEvents, MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import statesCitiesData from '../../StatesCities/StatesCities.json'; // Import your JSON file

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org/search?";
const baseUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL ;

const FindEateries = () => {
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [markers, setMarkers] = useState([]);
  const [polygonCoords, setPolygonCoords] = useState([]);
  const [cityCoordinates, setCityCoordinates] = useState([26.9124, 75.7873]); // Default coordinates
  const [cityParts, setCityParts] = useState([]); // City parts from API
  const [loading, setLoading] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState({ show: false, message: '', severity: 'info' });
  const [title, setTitle] = useState(''); // New city part name

  const token = localStorage.getItem('authToken');

  // Fetch states and cities from the JSON file on component mount
  useEffect(() => {
    setStates(statesCitiesData.states);
  }, []);

  // Fetch city parts from the API on page load
  useEffect(() => {
    fetchCityPartsFromAPI();
  }, []);

  const fetchCityPartsFromAPI = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${baseUrl}/api/admin/city-part`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        setCityParts(response.data.data); // Store fetched city parts
        showNotification('City parts fetched successfully!', 'success');
      }
    } catch (error) {
      console.error('Error fetching city parts:', error);
      showNotification('Failed to fetch city parts', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle state selection and update cities
  const handleStateChange = (event) => {
    const selectedState = event.target.value;
    setState(selectedState);
    const foundState = states.find((s) => s.state_name === selectedState);
    if (foundState) {
      setCities(foundState.cities || []);
    }
    setCity('');
  };

  // Handle city selection and fetch city coordinates
  const handleCityChange = (event) => {
    const selectedCity = event.target.value;
    setCity(selectedCity);
    fetchCityCoordinatesFromAPI(selectedCity);
  };

  const fetchCityCoordinatesFromAPI = async (cityName) => {
    try {
      const response = await axios.get(`${NOMINATIM_BASE_URL}q=${cityName}&format=json&limit=1`);
      if (response.data.length > 0) {
        const { lat, lon } = response.data[0];
        setCityCoordinates([parseFloat(lat), parseFloat(lon)]);
      }
    } catch (error) {
      console.error('Error fetching city coordinates from API:', error);
    }
  };

  // Handle creating a new city part
  const handleCreateCityPart = async () => {
    if (markers.length < 4) {
      showNotification('Please mark 4 points to create an area.', 'error');
      return;
    }

    const cityPartData = {
      city_part_name: title,
      city_name: city,
      state_name: state,
      x1: markers[0][0].toString(),
      y1: markers[0][1].toString(),
      x2: markers[1][0].toString(),
      y2: markers[1][1].toString(),
      x3: markers[2][0].toString(),
      y3: markers[2][1].toString(),
      x4: markers[3][0].toString(),
      y4: markers[3][1].toString(),
    };

    setLoading(true);
    try {
      const response = await axios.post(`${baseUrl}/api/admin/city-part`, cityPartData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 201) {
        showNotification('City part added successfully!', 'success');
        fetchCityPartsFromAPI(); // Refresh city parts
      } else {
        showNotification('Error adding city part', 'error');
      }
    } catch (error) {
      console.error('Error adding city part:', error);
      showNotification('Failed to add city part', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, severity) => {
    setShowSnackbar({ show: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setShowSnackbar({ ...showSnackbar, show: false });
  };

  // Generate 4 points around the clicked position to form a square
  const generateSquareAroundPoint = (lat, lng, distance = 0.01) => {
    return [
      [lat + distance, lng + distance], // Top-right
      [lat + distance, lng - distance], // Top-left
      [lat - distance, lng - distance], // Bottom-left
      [lat - distance, lng + distance], // Bottom-right
    ];
  };
  const handleMarkerDrag = (event, index) => {
    const { lat, lng } = event.target.getLatLng();
    const updatedMarkers = [...markers];
    updatedMarkers[index] = [lat, lng]; // Update the marker position
    setMarkers(updatedMarkers);
    setPolygonCoords(updatedMarkers); // Update polygon coordinates
    calculateArea(updatedMarkers); // Recalculate area after marker drag
  };

 
  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        const squareMarkers = generateSquareAroundPoint(lat, lng);
        setMarkers(squareMarkers);
        setPolygonCoords(squareMarkers); // Update polygon coordinates
      },
    });
    return null;
  };

  return (
    <Container>
      <Card sx={{ marginBottom: 3, width: '93vw' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Add a City Part
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid
              size={{
                xs: 12,
                md: 3
              }}>
              <TextField
                label="City Part Name"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                fullWidth
              />
            </Grid>

            {/* State Dropdown */}
            <Grid
              size={{
                xs: 12,
                md: 3
              }}>
              <TextField
                select
                label="State"
                value={state}
                onChange={handleStateChange}
                fullWidth
              >
                {states.length > 0 ? (
                  states.map((s) => (
                    <MenuItem key={s.state_name} value={s.state_name}>
                      {s.state_name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No States Available</MenuItem>
                )}
              </TextField>
            </Grid>

            {/* City Dropdown */}
            <Grid
              size={{
                xs: 12,
                md: 3
              }}>
              <TextField
                select
                label="City"
                value={city}
                onChange={handleCityChange}
                fullWidth
                disabled={!state}
              >
                {cities.length > 0 ? (
                  cities.map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No Cities Available</MenuItem>
                )}
              </TextField>
            </Grid>

            {/* Create City Part Button */}
            <Grid
              size={{
                xs: 12,
                md: 3
              }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleCreateCityPart}
                disabled={loading || markers.length < 4}
                startIcon={<AddLocationIcon />}
              >
                {loading ? 'Processing...' : 'Create City Part'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      {/* Map Container */}
      <Card sx={{ width: '93vw' }}>
  <CardContent>
    <Typography variant="h6" gutterBottom>
      Map
    </Typography>
    <MapContainer center={cityCoordinates} zoom={13} style={{ height: '50vh', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MapClickHandler /> {/* Map click handler to generate square markers */}

      {/* Render markers for the square */}
      {markers.map((position, idx) => (
        <Marker
        key={`marker-${idx}`}
        position={position}
        draggable={true}
        eventHandlers={{
          dragend: (event) => handleMarkerDrag(event, idx), // Handle marker drag
        }}
      />
      ))}

      {/* Draw polygon based on the 4 markers */}
      {polygonCoords.length === 4 && (
        <Polygon positions={polygonCoords} color="orange" />
      )}

      {/* Render existing city parts from the API */}
      {cityParts.map((part, index) => (
        <Polygon
          key={index}
          positions={[
            [parseFloat(part.x1), parseFloat(part.y1)],
            [parseFloat(part.x2), parseFloat(part.y2)],
            [parseFloat(part.x3), parseFloat(part.y3)],
            [parseFloat(part.x4), parseFloat(part.y4)],
            [parseFloat(part.x1), parseFloat(part.y1)], // Close the polygon
          ]}
          color="gray"
        >
          <Tooltip>
            <div>
              <strong>{part.city_part_name}</strong>
            </div>
          </Tooltip>
        </Polygon>
      ))}
    </MapContainer>
  </CardContent>
</Card>
      {/* Snackbar for notifications */}
      <Snackbar
        open={showSnackbar.show}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={showSnackbar.severity}>
          {showSnackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default FindEateries;

