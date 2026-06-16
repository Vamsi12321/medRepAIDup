"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";

// Dynamically import map to avoid SSR issues with Leaflet
const MapWithNoSSR = dynamic(() => import("./LocationMapInner"), { ssr: false });

export default function LocationMapPicker({ value, lat, lng, onChange }) {
  const [showMap, setShowMap] = useState(false);
  const [search, setSearch]   = useState("");
  const [searching, setSearching] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [position, setPosition] = useState(
    lat && lng ? [parseFloat(lat), parseFloat(lng)] : null
  );
  const [address, setAddress] = useState(value || "");

  const handleSearchSubmit = async () => {
    if (!search.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(search)}&format=json&limit=1`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();
      if (data[0]) {
        const pos = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        setPosition(pos);
        const addr = data[0].display_name;
        setAddress(addr);
        onChange({ address: addr, latitude: pos[0], longitude: pos[1] });
      }
    } catch {}
    setSearching(false);
  };

  const handleUseGPS = () => {
    if (!navigator.geolocation) { alert("GPS not supported"); return; }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);
        // Reverse geocode
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          const addr = data.display_name || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
          setAddress(addr);
          onChange({ address: addr, latitude, longitude });
        } catch {
          const addr = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
          setAddress(addr);
          onChange({ address: addr, latitude, longitude });
        }
        setGpsLoading(false);
      },
      () => { alert("GPS access denied"); setGpsLoading(false); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleMapClick = useCallback(async (latlng) => {
    setPosition([latlng.lat, latlng.lng]);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latlng.lat}&lon=${latlng.lng}&format=json`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();
      const addr = data.display_name || `${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)}`;
      setAddress(addr);
      onChange({ address: addr, latitude: latlng.lat, longitude: latlng.lng });
    } catch {
      const addr = `${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)}`;
      setAddress(addr);
      onChange({ address: addr, latitude: latlng.lat, longitude: latlng.lng });
    }
  }, [onChange]);

  return (
    <div className="space-y-2">
      {/* Address display + open map button */}
      <div className="flex gap-2">
        <input
          type="text"
          readOnly
          value={address}
          placeholder="Click 'Pick on Map' to select location…"
          className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-700 outline-none cursor-pointer"
          onClick={() => setShowMap(true)}
        />
        <button type="button" onClick={() => setShowMap(true)}
          className="px-3 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Pick on Map
        </button>
      </div>

      {/* Coords display */}
      {position && (
        <p className="text-[10px] text-gray-400 font-medium">
          📍 {position[0].toFixed(6)}, {position[1].toFixed(6)}
        </p>
      )}

      {/* Map Modal */}
      {showMap && (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
              <div>
                <p className="text-sm font-bold text-gray-900">Pick Doctor Location</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Search, use GPS, or click on the map to drop a pin</p>
              </div>
              <button onClick={() => setShowMap(false)}
                className="text-gray-400 hover:text-gray-700 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-xl">×</button>
            </div>

            {/* Search + GPS row */}
            <div className="flex gap-2 px-5 py-3 border-b border-gray-100">
              <div className="flex gap-2 flex-1">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleSearchSubmit())}
                  placeholder="Search: Apollo Hospital Hyderabad…"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-purple-200"
                />
                <button type="button" onClick={handleSearchSubmit} disabled={searching}
                  className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50">
                  {searching ? "…" : "Search"}
                </button>
              </div>
              <button type="button" onClick={handleUseGPS} disabled={gpsLoading}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition-all disabled:opacity-50 whitespace-nowrap">
                {gpsLoading
                  ? <span className="animate-spin">🔄</span>
                  : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 0v4m0 12v4M2 12h4m12 0h4" /></svg>
                }
                My Location
              </button>
            </div>

            {/* Map */}
            <div style={{ height: "380px" }}>
              <MapWithNoSSR
                position={position}
                onMapClick={handleMapClick}
              />
            </div>

            {/* Selected address */}
            {address && (
              <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-start gap-2">
                <svg className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <p className="text-xs text-gray-600 leading-relaxed flex-1">{address}</p>
              </div>
            )}

            {/* Confirm button */}
            <div className="px-5 py-3 border-t border-gray-100 flex justify-end gap-2">
              <button type="button" onClick={() => setShowMap(false)}
                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-xs font-semibold hover:bg-gray-50">
                Cancel
              </button>
              <button type="button" onClick={() => setShowMap(false)}
                disabled={!position}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm disabled:opacity-50">
                ✓ Confirm Location
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
