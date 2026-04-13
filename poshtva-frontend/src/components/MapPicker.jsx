import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet when using Webpack/Vite
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const LocationMarker = ({ position, onClick }) => {
  const map = useMap();
  
  useEffect(() => {
    if (position) {
      map.flyTo(position, 15);
    }
  }, [position, map]);

  useMapEvents({
    click(e) {
      onClick(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position} />
  );
};

const MapPicker = ({ onLocationSelect, initialPosition }) => {
  const [position, setPosition] = useState(initialPosition || null);

  // Default to Muzaffarnagar coords if nothing provided
  const center = initialPosition || [29.4727, 77.7085];

  const handleMapClick = (latlng) => {
    setPosition(latlng);
    onLocationSelect({ lat: latlng.lat, lng: latlng.lng });
  };

  return (
    <div className="h-[300px] w-full rounded-2xl overflow-hidden border-2 border-forest-100 shadow-inner mt-4 relative z-0">
      <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} onClick={handleMapClick} />
      </MapContainer>
      <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg text-[10px] text-gray-500 z-[1000] pointer-events-none shadow-sm">
        Tap on map for exact delivery location
      </div>
    </div>
  );
};

export default MapPicker;
