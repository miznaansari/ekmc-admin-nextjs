import React, { useRef, useEffect } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px'
};

const GoogleMapWrapper = ({ position, onMapClick, onMarkerDragEnd, apiKey }) => {
  const mapRef = useRef(null);
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: ['places']
  });

  useEffect(() => {
    if (mapRef.current && position) {
      mapRef.current.panTo(position);
    }
  }, [position]);

  if (!isLoaded) return <div>Loading Map...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={position || { lat: 20.5937, lng: 78.9629 }}
      zoom={position ? 15 : 5}
      onClick={onMapClick}
      onLoad={map => (mapRef.current = map)}
    >
      {position && (
        <Marker
          position={position}
          draggable
          onDragEnd={onMarkerDragEnd}
        />
      )}
    </GoogleMap>
  );
};

export default GoogleMapWrapper;
