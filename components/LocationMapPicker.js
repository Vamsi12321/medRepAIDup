"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";

const MapBox = dynamic(() => import("./LocationMapInner"), {
  ssr: false,
  loading: () => (
    <div style={{ height:"100%", background:"#f3f4f6", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <span style={{ fontSize:"12px", color:"#9ca3af" }}>Loading map…</span>
    </div>
  ),
});

async function reverseGeocode(lat, lng) {
  try {
    const r = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/api/v1/geocode?lat=${lat}&lng=${lng}`);
    const d = await r.json();
    return { display_name: d.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`, structured: d.structured || {} };
  } catch { return { display_name: `${lat.toFixed(5)}, ${lng.toFixed(5)}`, structured: {} }; }
}

export default function LocationMapPicker({ value, lat, lng, onChange }) {
  const [showMap,    setShowMap]    = useState(false);
  const [search,     setSearch]     = useState("");
  const [searching,  setSearching]  = useState(false);
  const [results,    setResults]    = useState([]);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [position,   setPosition]   = useState(lat && lng ? [parseFloat(lat), parseFloat(lng)] : null);
  const [address,    setAddress]    = useState(value || "");
  const [mounted,    setMounted]    = useState(false);

  // Use ref to always have latest onChange without causing useCallback recreation
  const onChangeRef = useRef(onChange);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  useEffect(() => { setMounted(true); }, []);

  const doSearch = async () => {
    const q = search.trim();
    if (!q) return;
    setSearching(true); setResults([]);
    try {
      const r = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/api/v1/geocode?q=${encodeURIComponent(q)}`);
      setResults(await r.json());
    } catch {}
    setSearching(false);
  };

  const pick = (r) => {
    const pos  = [parseFloat(r.lat), parseFloat(r.lon)];
    const addr = r.display_name;
    setPosition(pos); setAddress(addr);
    setSearch(r.name || r.display_name.split(",")[0]);
    setResults([]);
    onChangeRef.current({ address: addr, latitude: pos[0], longitude: pos[1], structured: r.structured || {} });
  };

  const handleMapClick = useCallback(async ({ lat, lng }) => {
    const pos  = [lat, lng];
    setPosition(pos);
    setResults([]);
    const geo = await reverseGeocode(lat, lng);
    setAddress(geo.display_name);
    onChangeRef.current({ address: geo.display_name, latitude: lat, longitude: lng, structured: geo.structured || {} });
  }, []);

  const handleGPS = () => {
    if (!navigator.geolocation) { alert("GPS not supported"); return; }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      const pos  = [coords.latitude, coords.longitude];
      setPosition(pos); setResults([]);
      const geo = await reverseGeocode(coords.latitude, coords.longitude);
      setAddress(geo.display_name);
      onChangeRef.current({ address: geo.display_name, latitude: coords.latitude, longitude: coords.longitude, structured: geo.structured || {} });
      setGpsLoading(false);
    }, () => { alert("GPS access denied"); setGpsLoading(false); }, { enableHighAccuracy: true, timeout: 10000 });
  };

  const modal = mounted && showMap ? createPortal(
    <div style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,0.55)",
      zIndex:2147483647,
      display:"flex", alignItems:"center", justifyContent:"center", padding:"20px"
    }} onClick={(e) => { if (e.target === e.currentTarget) { setShowMap(false); setResults([]); } }}>
      <div style={{
        background:"white", borderRadius:"20px",
        boxShadow:"0 25px 60px rgba(0,0,0,0.3)",
        width:"100%", maxWidth:"520px",
        display:"flex", flexDirection:"column",
        overflow:"hidden",
        maxHeight:"85vh",
        animation: "fadeInScale 0.2s ease-out"
      }}>

        {/* ─── Header ─────────────────────────────────── */}
        <div style={{
          padding:"16px 20px", 
          background:"linear-gradient(135deg, #7c3aed, #a855f7)",
          display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0
        }}>
          <div>
            <p style={{ fontWeight:800, fontSize:"14px", color:"white", margin:0, letterSpacing:"-0.3px" }}>📍 Pick Location</p>
            <p style={{ fontSize:"10px", color:"rgba(255,255,255,0.7)", margin:"2px 0 0" }}>Search, use GPS, or tap the map</p>
          </div>
          <button type="button" onClick={() => { setShowMap(false); setResults([]); }}
            style={{ fontSize:"18px", color:"rgba(255,255,255,0.8)", background:"rgba(255,255,255,0.15)", border:"none", cursor:"pointer", lineHeight:1, width:"30px", height:"30px", borderRadius:"8px", display:"flex", alignItems:"center", justifyContent:"center" }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.25)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}>×</button>
        </div>

        {/* ─── Search bar ─────────────────────────────── */}
        <div style={{ padding:"12px 16px", background:"#fafafa", borderBottom:"1px solid #f3f4f6", display:"flex", gap:"6px", alignItems:"center", flexShrink:0 }}>
          <div style={{ flex:1, position:"relative" }}>
            <input
              type="text" value={search}
              onChange={(e) => { setSearch(e.target.value); setResults([]); }}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), doSearch())}
              placeholder="Search hospital, clinic..."
              style={{ width:"100%", padding:"8px 10px 8px 30px", border:"1.5px solid #e5e7eb", borderRadius:"10px", fontSize:"12px", outline:"none", boxSizing:"border-box", background:"white" }}
            />
            <span style={{ position:"absolute", left:"10px", top:"50%", transform:"translateY(-50%)", fontSize:"12px", color:"#9ca3af", pointerEvents:"none" }}>🔍</span>
          </div>
          <button type="button" onClick={doSearch} disabled={searching}
            style={{ padding:"8px 14px", background: searching ? "#a78bfa" : "#7c3aed", color:"white", border:"none", borderRadius:"10px", fontSize:"11px", fontWeight:700, cursor:"pointer", whiteSpace:"nowrap", flexShrink:0 }}>
            {searching ? "…" : "Search"}
          </button>
          <button type="button" onClick={handleGPS} disabled={gpsLoading}
            style={{ padding:"8px 12px", background:"white", color:"#15803d", border:"1.5px solid #d1d5db", borderRadius:"10px", fontSize:"11px", fontWeight:600, cursor:"pointer", whiteSpace:"nowrap", flexShrink:0, display:"flex", alignItems:"center", gap:"4px" }}>
            {gpsLoading ? "⏳" : "📍"} GPS
          </button>
        </div>

        {/* ─── Search results ─────────────────────────── */}
        {results.length > 0 && (
          <div style={{ flexShrink:0, borderBottom:"1px solid #e5e7eb", maxHeight:"150px", overflowY:"auto", background:"white" }}>
            {results.map((r, i) => (
              <button key={i} type="button" onClick={() => pick(r)}
                style={{ display:"flex", alignItems:"center", gap:"8px", width:"100%", textAlign:"left", padding:"8px 16px",
                  borderBottom: i < results.length-1 ? "1px solid #f9fafb" : "none",
                  background:"none", cursor:"pointer", border:"none" }}
                onMouseEnter={(e) => e.currentTarget.style.background="#f5f3ff"}
                onMouseLeave={(e) => e.currentTarget.style.background="none"}>
                <span style={{ fontSize:"14px", flexShrink:0, color:"#7c3aed" }}>📍</span>
                <div style={{ overflow:"hidden", flex:1 }}>
                  <div style={{ fontWeight:600, fontSize:"11px", color:"#111827", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {r.name || r.display_name.split(",")[0]}
                  </div>
                  <div style={{ fontSize:"9px", color:"#9ca3af", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", marginTop:"1px" }}>
                    {r.display_name.split(",").slice(1, 3).join(",")}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* ─── Map ────────────────────────────────────── */}
        <div style={{ height:"260px", width:"100%", flexShrink:0, position:"relative" }}>
          <MapBox position={position} onMapClick={handleMapClick} />
        </div>

        {/* ─── Selected address + Actions ─────────────── */}
        <div style={{ padding:"12px 16px", borderTop:"1px solid #f3f4f6", background:"#fafafa", display:"flex", alignItems:"center", gap:"10px", flexShrink:0 }}>
          <div style={{ flex:1, minWidth:0 }}>
            {address ? (
              <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
                <span style={{ color:"#7c3aed", fontSize:"13px", flexShrink:0 }}>📍</span>
                <p style={{ fontSize:"10px", color:"#374151", lineHeight:"1.4", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{address}</p>
              </div>
            ) : (
              <p style={{ fontSize:"10px", color:"#9ca3af", margin:0, fontStyle:"italic" }}>Tap on the map or search to select a location</p>
            )}
          </div>
          <div style={{ display:"flex", gap:"6px", flexShrink:0 }}>
            <button type="button" onClick={() => { setShowMap(false); setResults([]); }}
              style={{ padding:"7px 14px", border:"1.5px solid #e5e7eb", background:"white", color:"#374151", borderRadius:"10px", fontSize:"11px", fontWeight:600, cursor:"pointer" }}>
              Cancel
            </button>
            <button type="button" onClick={() => { setShowMap(false); setResults([]); }} disabled={!position}
              style={{ padding:"7px 16px", background: position ? "#7c3aed" : "#d1d5db", color:"white", border:"none", borderRadius:"10px", fontSize:"11px", fontWeight:700, cursor: position ? "pointer" : "not-allowed" }}>
              ✓ Confirm
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>,
    document.body
  ) : null;

  return (
    <div>
      <div style={{ display:"flex", gap:"8px" }}>
        <input type="text" readOnly value={address}
          placeholder="Click to select location on map…"
          onClick={() => setShowMap(true)}
          style={{ flex:1, padding:"9px 12px", border:"1.5px solid #e5e7eb", borderRadius:"10px", fontSize:"12px", background:"#fafafa", color:"#374151", cursor:"pointer", outline:"none", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}
        />
        <button type="button" onClick={() => setShowMap(true)}
          style={{ padding:"9px 14px", background:"#7c3aed", color:"white", border:"none", borderRadius:"10px", fontSize:"11px", fontWeight:700, cursor:"pointer", whiteSpace:"nowrap", display:"flex", alignItems:"center", gap:"5px" }}>
          📍 Pick
        </button>
      </div>
      {position && (
        <p style={{ fontSize:"10px", color:"#9ca3af", marginTop:"4px" }}>
          📍 {position[0].toFixed(6)}, {position[1].toFixed(6)}
        </p>
      )}
      {modal}
    </div>
  );
}
