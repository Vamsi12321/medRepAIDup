"use client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { get, post, put } from "@/lib/api";
import LocationMapPicker from "@/components/LocationMapPicker";

export default function DoctorLocationsModal({ doctor, onClose }) {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd]     = useState(false);
  const [editLoc, setEditLoc]     = useState(null); // location object being edited
  const [togglingId, setTogglingId] = useState(null);
  const doctorId = doctor?.id || doctor?._id;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["doctor-locations", doctorId],
    queryFn: () => get(`/api/v1/doctors/${doctorId}/locations`),
    enabled: !!doctorId,
    staleTime: 0,
  });

  const { data: sugData, refetch: refetchSug } = useQuery({
    queryKey: ["doctor-location-suggestions", doctorId],
    queryFn: () => get(`/api/v1/doctors/${doctorId}/location-suggestions`),
    enabled: !!doctorId,
    staleTime: 0,
  });

  const locations   = data?.locations   || [];
  const suggestions = sugData?.suggestions || [];

  const handleApproveSuggestion = async (sugId, radius = 100) => {
    try {
      await put(`/api/v1/doctors/${doctorId}/location-suggestions/${sugId}/approve`, {
        notes: "Approved by admin", geofence_radius: radius,
      });
      refetch(); refetchSug();
    } catch (err) { alert(err.message || "Failed to approve"); }
  };

  const handleToggleActive = async (loc) => {
    setTogglingId(loc.id);
    try {
      await put(`/api/v1/doctors/${doctorId}/locations/${loc.id}`, {
        is_active: !loc.is_active,
      });
      refetch();
    } catch (err) {
      alert(err.message || "Failed to update status");
    }
    setTogglingId(null);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center overflow-y-auto py-6 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-600 to-pink-600 rounded-t-2xl">
          <div>
            <p className="text-sm font-bold text-white">Clinic Locations — {doctor?.name}</p>
            <p className="text-[11px] text-purple-200 mt-0.5">Manage permanent locations and geofence settings</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setShowAdd(true); setEditLoc(null); }}
              className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
            >
              + Add Location
            </button>
            <button onClick={onClose} className="text-white/70 hover:text-white text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10">×</button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Existing locations */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Saved Locations ({locations.length})</p>
            {isLoading ? (
              <div className="space-y-2">{[1,2].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
            ) : locations.length === 0 ? (
              <div className="bg-gray-50 rounded-xl border border-dashed border-gray-200 p-8 text-center">
                <p className="text-gray-400 text-sm">No locations added yet.</p>
                <button onClick={() => setShowAdd(true)} className="mt-3 text-purple-600 text-xs font-semibold hover:underline">
                  Add first location →
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {locations.map((loc) => (
                  <div
                    key={loc.id}
                    className={`bg-white border rounded-xl p-4 shadow-sm transition-all ${
                      loc.is_active === false ? "border-gray-200 opacity-60" : "border-gray-100"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="text-sm font-bold text-gray-900">{loc.name}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            loc.type === "hospital" ? "bg-blue-50 text-blue-700" :
                            loc.type === "polyclinic" ? "bg-purple-50 text-purple-700" :
                            "bg-emerald-50 text-emerald-700"
                          }`}>
                            {loc.type === "hospital" ? "🏥 Hospital" : loc.type === "polyclinic" ? "🏢 Polyclinic" : loc.type === "solo_clinic" ? "🩺 Solo Clinic" : loc.type}
                          </span>
                          {loc.is_active === false && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-500">Inactive</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate">{loc.address}</p>
                        {(loc.area || loc.district || loc.state) && (
                          <p className="text-[10px] text-gray-500 mt-0.5">
                            {[loc.area, loc.district, loc.state].filter(Boolean).join(", ")}
                          </p>
                        )}
                        <p className="text-[10px] text-gray-400 mt-1">
                          📍 {loc.latitude?.toFixed(5)}, {loc.longitude?.toFixed(5)}
                          {loc.geofence_radius && ` · Geofence: ${loc.geofence_radius}m`}
                        </p>
                      </div>
                      {/* Action buttons */}
                      <div className="flex flex-col gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => { setEditLoc(loc); setShowAdd(false); }}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all border border-blue-100"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleToggleActive(loc)}
                          disabled={togglingId === loc.id}
                          className={`text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all border ${
                            loc.is_active === false
                              ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-100"
                              : "bg-red-50 hover:bg-red-100 text-red-600 border-red-100"
                          } disabled:opacity-50`}
                        >
                          {togglingId === loc.id ? "…" : loc.is_active === false ? "✓ Activate" : "✕ Deactivate"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending suggestions */}
          {suggestions.length > 0 && (
            <div>
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-3">
                ⏳ Pending Suggestions ({suggestions.length})
              </p>
              <div className="space-y-2">
                {suggestions.map((sug) => (
                  <div key={sug.id} className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-900">{sug.name}</p>
                        <p className="text-xs text-gray-500">{sug.address || `${sug.latitude?.toFixed(5)}, ${sug.longitude?.toFixed(5)}`}</p>
                        <p className="text-[10px] text-gray-400 mt-1">
                          Used {sug.usage_count} times · Last: {sug.last_used ? new Date(sug.last_used).toLocaleDateString() : "—"}
                        </p>
                      </div>
                      <button onClick={() => handleApproveSuggestion(sug.id)}
                        className="ml-3 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all">
                        ✓ Approve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Add form inline at bottom */}
        {showAdd && !editLoc && (
          <AddLocationForm
            doctorId={doctorId}
            onClose={() => setShowAdd(false)}
            onAdded={() => { setShowAdd(false); refetch(); }}
          />
        )}

        {/* Edit form inline at bottom */}
        {editLoc && (
          <EditLocationForm
            doctorId={doctorId}
            location={editLoc}
            onClose={() => setEditLoc(null)}
            onSaved={() => { setEditLoc(null); refetch(); }}
          />
        )}
      </div>
    </div>
  );
}

// ── Add Location Form ────────────────────────────────────────────────────────
function AddLocationForm({ doctorId, onClose, onAdded }) {
  const [loc, setLoc]   = useState({ name: "", address: "", country: "India", state: "", district: "", city: "", area: "", latitude: "", longitude: "", type: "hospital", geofence_radius: "100" });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  const handleSave = async () => {
    if (!loc.name || !loc.latitude || !loc.longitude) {
      setError("Name and map location are required"); return;
    }
    if (!loc.state || !loc.district || !loc.city || !loc.area) {
      setError("State, District, City, and Area are required"); return;
    }
    setSaving(true); setError("");
    try {
      await post(`/api/v1/doctors/${doctorId}/locations`, {
        name:            loc.name,
        address:         loc.address,
        country:         loc.country || "India",
        state:           loc.state,
        district:        loc.district,
        city:            loc.city,
        area:            loc.area,
        latitude:        parseFloat(loc.latitude),
        longitude:       parseFloat(loc.longitude),
        type:            loc.type,
        geofence_radius: parseInt(loc.geofence_radius) || 100,
      });
      onAdded();
    } catch (err) { setError(err.message || "Failed to add location"); }
    setSaving(false);
  };

  return (
    <div className="border-t border-gray-100 p-5 bg-gray-50 rounded-b-2xl">
      <p className="text-sm font-bold text-gray-900 mb-4">➕ Add New Location</p>
      {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-xl mb-3">{error}</p>}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Location Name *</label>
            <input type="text" value={loc.name} onChange={(e) => setLoc({...loc, name: e.target.value})}
              placeholder="e.g. Apollo Hospital - Jubilee Hills"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-200" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Type *</label>
            <select value={loc.type} onChange={(e) => setLoc({...loc, type: e.target.value})}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-200 bg-white">
              <option value="hospital">Hospital</option>
              <option value="solo_clinic">Solo Clinic</option>
              <option value="polyclinic">Polyclinic</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Country</label>
            <input type="text" value={loc.country} onChange={(e) => setLoc({...loc, country: e.target.value})}
              placeholder="India"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-200" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">State *</label>
            <input type="text" value={loc.state} onChange={(e) => setLoc({...loc, state: e.target.value})}
              placeholder="e.g. Telangana"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-200" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">District *</label>
            <input type="text" value={loc.district} onChange={(e) => setLoc({...loc, district: e.target.value})}
              placeholder="e.g. Ranga Reddy"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-200" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">City *</label>
            <input type="text" value={loc.city} onChange={(e) => setLoc({...loc, city: e.target.value})}
              placeholder="e.g. Hyderabad"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-200" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Area *</label>
            <input type="text" value={loc.area} onChange={(e) => setLoc({...loc, area: e.target.value})}
              placeholder="e.g. Jubilee Hills"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-200" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Geofence Radius (meters)</label>
          <input type="number" value={loc.geofence_radius} onChange={(e) => setLoc({...loc, geofence_radius: e.target.value})}
            min="10" max="1000" placeholder="100"
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-200" />
          <p className="text-[10px] text-gray-400 mt-1">MR must be within this radius to check in without photo</p>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Location on Map *</label>
          <LocationMapPicker
            value={loc.address}
            lat={loc.latitude}
            lng={loc.longitude}
            onChange={({ address, latitude, longitude, structured }) => {
              const s = structured || {};
              setLoc(l => ({
                ...l,
                address,
                latitude: String(latitude),
                longitude: String(longitude),
                country: s.country || "India",
                state: s.state || "",
                district: s.district || "",
                city: s.city || "",
                area: s.area || "",
                name: l.name || s.name || "",
              }));
            }}
          />
        </div>
      </div>
      <div className="flex gap-3 mt-4">
        <button type="button" onClick={onClose}
          className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-xs font-semibold hover:bg-gray-50">Cancel</button>
        <button type="button" onClick={handleSave} disabled={saving}
          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-xl text-xs font-bold disabled:opacity-50">
          {saving ? "Saving…" : "Save Location"}
        </button>
      </div>
    </div>
  );
}

// ── Edit Location Form ───────────────────────────────────────────────────────
function EditLocationForm({ doctorId, location, onClose, onSaved }) {
  const [loc, setLoc] = useState({
    name:            location.name            || "",
    address:         location.address         || "",
    country:         location.country         || "India",
    state:           location.state           || "",
    district:        location.district        || "",
    city:            location.city            || "",
    area:            location.area            || "",
    latitude:        location.latitude        ? String(location.latitude)  : "",
    longitude:       location.longitude       ? String(location.longitude) : "",
    type:            location.type            || "hospital",
    geofence_radius: location.geofence_radius ? String(location.geofence_radius) : "100",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  const handleSave = async () => {
    if (!loc.name) { setError("Location name is required"); return; }
    setSaving(true); setError("");
    try {
      const payload = {};
      if (loc.name)            payload.name            = loc.name;
      if (loc.address)         payload.address         = loc.address;
      if (loc.country)         payload.country         = loc.country;
      if (loc.state)           payload.state           = loc.state;
      if (loc.district)        payload.district        = loc.district;
      if (loc.city)            payload.city            = loc.city;
      if (loc.area)            payload.area            = loc.area;
      if (loc.latitude)        payload.latitude        = parseFloat(loc.latitude);
      if (loc.longitude)       payload.longitude       = parseFloat(loc.longitude);
      if (loc.type)            payload.type            = loc.type;
      if (loc.geofence_radius) payload.geofence_radius = parseInt(loc.geofence_radius) || 100;

      await put(`/api/v1/doctors/${doctorId}/locations/${location.id}`, payload);
      onSaved();
    } catch (err) { setError(err.message || "Failed to update location"); }
    setSaving(false);
  };

  return (
    <div className="border-t border-blue-100 p-5 bg-blue-50/40 rounded-b-2xl">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-bold text-gray-900">✏️ Edit Location</p>
        <span className="text-[10px] text-blue-500 bg-blue-100 px-2 py-0.5 rounded font-mono">{location.id?.slice(-8)}</span>
      </div>
      {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-xl mb-3">{error}</p>}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Location Name *</label>
            <input type="text" value={loc.name} onChange={(e) => setLoc({...loc, name: e.target.value})}
              placeholder="e.g. Apollo Hospital - Jubilee Hills"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-200 bg-white" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Type *</label>
            <select value={loc.type} onChange={(e) => setLoc({...loc, type: e.target.value})}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-200 bg-white">
              <option value="hospital">Hospital</option>
              <option value="solo_clinic">Solo Clinic</option>
              <option value="polyclinic">Polyclinic</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Country</label>
            <input type="text" value={loc.country} onChange={(e) => setLoc({...loc, country: e.target.value})}
              placeholder="India"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-200 bg-white" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">State</label>
            <input type="text" value={loc.state} onChange={(e) => setLoc({...loc, state: e.target.value})}
              placeholder="e.g. Telangana"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-200 bg-white" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">District</label>
            <input type="text" value={loc.district} onChange={(e) => setLoc({...loc, district: e.target.value})}
              placeholder="e.g. Ranga Reddy"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-200 bg-white" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">City</label>
            <input type="text" value={loc.city} onChange={(e) => setLoc({...loc, city: e.target.value})}
              placeholder="e.g. Hyderabad"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-200 bg-white" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Area</label>
            <input type="text" value={loc.area} onChange={(e) => setLoc({...loc, area: e.target.value})}
              placeholder="e.g. Jubilee Hills"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-200 bg-white" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Geofence Radius (meters)</label>
          <input type="number" value={loc.geofence_radius} onChange={(e) => setLoc({...loc, geofence_radius: e.target.value})}
            min="10" max="1000" placeholder="100"
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-200 bg-white" />
          <p className="text-[10px] text-gray-400 mt-1">MR must be within this radius to check in without photo</p>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Update Location on Map</label>
          <LocationMapPicker
            value={loc.address}
            lat={loc.latitude}
            lng={loc.longitude}
            onChange={({ address, latitude, longitude, structured }) => {
              const s = structured || {};
              setLoc(l => ({
                ...l,
                address,
                latitude: String(latitude),
                longitude: String(longitude),
                country: s.country || "India",
                state: s.state || "",
                district: s.district || "",
                city: s.city || "",
                area: s.area || "",
              }));
            }}
          />
          {loc.latitude && loc.longitude && (
            <p className="text-[10px] text-blue-600 mt-1 font-mono">
              📍 {parseFloat(loc.latitude).toFixed(5)}, {parseFloat(loc.longitude).toFixed(5)}
            </p>
          )}
        </div>
      </div>
      <div className="flex gap-3 mt-4">
        <button type="button" onClick={onClose}
          className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-xs font-semibold hover:bg-gray-50 bg-white">Cancel</button>
        <button type="button" onClick={handleSave} disabled={saving}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-xs font-bold disabled:opacity-50">
          {saving ? "Updating…" : "Update Location"}
        </button>
      </div>
    </div>
  );
}
