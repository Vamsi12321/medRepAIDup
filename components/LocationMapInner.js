"use client";
import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";

// Fix Leaflet default icon in Next.js
import "leaflet/dist/leaflet.css";
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:       "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Custom purple pin icon
const pinIcon = new L.Icon({
  iconUrl: "data:image/svg+xml;base64," + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" width="24" height="32">
      <path d="M12 0C7.589 0 4 3.589 4 8c0 6.516 8 16 8 16s8-9.484 8-16c0-4.411-3.589-8-8-8z"
        fill="#7c3aed" stroke="#fff" stroke-width="1.5"/>
      <circle cx="12" cy="8" r="3.5" fill="#fff"/>
    </svg>
  `),
  iconSize:     [24, 32],
  iconAnchor:   [12, 32],
  popupAnchor:  [0, -32],
});

// Sub-component: handle map clicks + fly-to on position change
function MapController({ position, onMapClick }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, Math.max(map.getZoom(), 15), { duration: 1 });
    }
  }, [position, map]);

  useMapEvents({
    click(e) {
      onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  return null;
}

export default function LocationMapInner({ position, onMapClick }) {
  const defaultCenter = position || [17.385, 78.486]; // Hyderabad default

  return (
    <MapContainer
      center={defaultCenter}
      zoom={position ? 15 : 12}
      style={{ height: "100%", width: "100%", cursor: "crosshair" }}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <MapController position={position} onMapClick={onMapClick} />
      {position && <Marker position={position} icon={pinIcon} />}

      {/* Attribution small */}
      <div className="leaflet-bottom leaflet-right">
        <div className="leaflet-control leaflet-attribution" style={{ fontSize:"9px", background:"rgba(255,255,255,0.7)", padding:"1px 4px" }}>
          © OpenStreetMap
        </div>
      </div>
    </MapContainer>
  );
}
