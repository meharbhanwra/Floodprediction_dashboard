// src/components/MapDisplay.jsx

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import Routing from './Routing'; 
import L from 'leaflet'; // Import the main Leaflet library
import 'leaflet/dist/leaflet.css';

// Custom marker icons for different risk levels
const redIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const orangeIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const greenIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// The simplified map component
function MapDisplay({ locations, onMarkerClick, selectedLocationId }) {
  const chennaiCoords = [13.0827, 80.2707];

  // Helper to get icon based on risk score
  const getIcon = (riskScore) => {
    if (riskScore >= 0.7) return redIcon;
    if (riskScore >= 0.4) return orangeIcon;
    return greenIcon;
  };

  // Optional: Highlight selected marker (e.g., larger icon or different style)
  const isSelected = (locId) => locId === selectedLocationId;

  return (
    <div className="map-container">
      <MapContainer center={chennaiCoords} zoom={12}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {/* Loop through all locations to create a colored marker for each */}
        {locations.map((loc) => {
          const icon = getIcon(loc.riskScore);
          const selectedStyle = isSelected(loc.id) ? { transform: 'scale(1.2)', zIndexOffset: 1000 } : {}; // Simple highlight for selected

          return (
            <Marker
              key={loc.id}
              position={[loc.lat, loc.lon]}
              icon={icon}
              eventHandlers={{
                click: () => {
                  // ✅ FIXED: Pass loc.id (string) instead of entire loc object
                  // This matches the expected param in App.jsx's handleLocationSelect
                  onMarkerClick(loc.id);
                },
              }}
              // Optional: Apply style for selected marker
              {...(isSelected(loc.id) && { zIndexOffset: 1000 })}
            >
              <Popup>
                <b>{loc.name}</b><br />
                Risk Score: {loc.riskScore.toFixed(2)}<br />
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

export default MapDisplay;
