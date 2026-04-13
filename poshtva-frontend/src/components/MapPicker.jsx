import React, { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { FiCrosshair } from 'react-icons/fi';
import toast from 'react-hot-toast';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const MapPicker = ({ onLocationSelect, onAddressDetect, initialPosition }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY
  });

  const mapRef = useRef(null);
  const geocoderRef = useRef(null);
  const [markerPosition, setMarkerPosition] = useState(
    initialPosition ? { lat: initialPosition[0], lng: initialPosition[1] } : null
  );

  const defaultCenter = initialPosition 
    ? { lat: initialPosition[0], lng: initialPosition[1] } 
    : { lat: 29.4727, lng: 77.7085 }; // Muzaffarnagar

  const reverseGeocode = useCallback((lat, lng) => {
    if (!geocoderRef.current) geocoderRef.current = new window.google.maps.Geocoder();

    geocoderRef.current.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const components = results[0].address_components;
        const address = {
          street: results[0].formatted_address.split(',').slice(0, 2).join(', '),
          city: '',
          state: '',
          pincode: ''
        };

        components.forEach(c => {
          if (c.types.includes('locality')) address.city = c.long_name;
          if (c.types.includes('administrative_area_level_1')) address.state = c.long_name;
          if (c.types.includes('postal_code')) address.pincode = c.long_name;
          // Fallback for city if locality is missing
          if (!address.city && c.types.includes('administrative_area_level_2')) address.city = c.long_name;
        });

        if (onAddressDetect) onAddressDetect(address);
      }
    });
  }, [onAddressDetect]);

  const onMapClick = useCallback((e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    const newPos = { lat, lng };
    setMarkerPosition(newPos);
    onLocationSelect(newPos);
    reverseGeocode(lat, lng);
  }, [onLocationSelect, reverseGeocode]);

  const onLoad = useCallback((map) => {
    mapRef.current = map;
    geocoderRef.current = new window.google.maps.Geocoder();
  }, []);

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newPos = { lat: latitude, lng: longitude };
        setMarkerPosition(newPos);
        onLocationSelect(newPos);
        reverseGeocode(latitude, longitude);
        if (mapRef.current) {
          mapRef.current.panTo(newPos);
          mapRef.current.setZoom(16);
        }
      },
      () => {
        toast.error('Unable to retrieve your location. Please check your permissions.');
      }
    );
  };

  return isLoaded ? (
    <div className="h-[350px] w-full rounded-2xl overflow-hidden border-2 border-forest-100 shadow-inner mt-4 relative z-0">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={markerPosition || defaultCenter}
        zoom={13}
        onClick={onMapClick}
        onLoad={onLoad}
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
      
      {/* Locate Me Button */}
      <button 
        type="button"
        onClick={handleLocateMe}
        className="absolute top-2 right-2 bg-white p-2.5 rounded-xl shadow-lg hover:bg-gray-50 text-forest-600 transition-all z-[1000] border border-gray-100 flex items-center gap-2 font-semibold text-xs"
      >
        <FiCrosshair className="text-lg" />
        <span>Use My Location</span>
      </button>

      <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg text-[10px] text-gray-500 z-[1000] pointer-events-none shadow-sm">
        Tap on map for exact delivery location
      </div>
    </div>
  ) : (
    <div className="h-[350px] w-full bg-gray-100 rounded-2xl animate-pulse flex items-center justify-center text-gray-400 text-xs mt-4">
      Loading Maps...
    </div>
  );
};

export default React.memo(MapPicker);
