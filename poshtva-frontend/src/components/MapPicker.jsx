import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const MapPicker = ({ onLocationSelect, initialPosition }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY
  });

  const [markerPosition, setMarkerPosition] = useState(
    initialPosition ? { lat: initialPosition[0], lng: initialPosition[1] } : null
  );

  const defaultCenter = initialPosition 
    ? { lat: initialPosition[0], lng: initialPosition[1] } 
    : { lat: 29.4727, lng: 77.7085 }; // Muzaffarnagar

  const onMapClick = useCallback((e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    const newPos = { lat, lng };
    setMarkerPosition(newPos);
    onLocationSelect(newPos);
  }, [onLocationSelect]);

  return isLoaded ? (
    <div className="h-[300px] w-full rounded-2xl overflow-hidden border-2 border-forest-100 shadow-inner mt-4 relative z-0">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={markerPosition || defaultCenter}
        zoom={13}
        onClick={onMapClick}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
      >
        {markerPosition && <Marker position={markerPosition} />}
      </GoogleMap>
      <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg text-[10px] text-gray-500 z-[1000] pointer-events-none shadow-sm">
        Tap on map for exact delivery location
      </div>
    </div>
  ) : (
    <div className="h-[300px] w-full bg-gray-100 rounded-2xl animate-pulse flex items-center justify-center text-gray-400 text-xs mt-4">
      Loading Maps...
    </div>
  );
};

export default React.memo(MapPicker);
