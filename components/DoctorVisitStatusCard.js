"use client";
import { useState } from "react";

/**
 * DoctorVisitStatusCard - Displays doctor visit status with visit counts
 * Shows "Never visited", "Not visited", visit stats, and optional actions
 */
export default function DoctorVisitStatusCard({
  doctor,
  variant = "compact", // compact | expanded | admin
  onPlanVisit,
  onViewDetails,
  actionLoading = false,
}) {
  const [expanded, setExpanded] = useState(false);

  // Extract data
  const docName = doctor.doctor_name || doctor.name || "Unknown";
  const specialty = doctor.specialty || doctor.doctor_specialty || "—";
  const rawLocation = doctor.location;
  const locationStr = rawLocation && typeof rawLocation === "object"
    ? rawLocation.location_name || rawLocation.temporary_location?.name || rawLocation.name || ""
    : rawLocation || "";
  const area = locationStr || doctor.area || doctor.city || "—";

  const classification = doctor.classification || doctor.doctor_class || "—";
  const visitStatus = doctor.visit_status || doctor.status || "not_visited"; // never_visited | not_visited | visited
  const visitCount = doctor.visit_count || doctor.total_visits || 0;
  const targetVisits = doctor.target_visits || doctor.required_visits || 0;
  const lastVisited = doctor.last_visited || null;
  const salesIndex = doctor.sales_index || doctor.rx_commitment_percentage || 0;
  const shortfallCount = targetVisits > 0 ? Math.max(0, targetVisits - visitCount) : 0;

  // Status badge styling
  const statusConfig = {
    never_visited: {
      badge: "Never visited",
      badgeBg: "bg-red-50",
      badgeText: "text-red-700",
      icon: "❌",
      color: "text-red-600",
    },
    not_visited: {
      badge: "Not visited",
      badgeBg: "bg-orange-50",
      badgeText: "text-orange-700",
      icon: "⚠️",
      color: "text-orange-600",
    },
    visited: {
      badge: "Visited",
      badgeBg: "bg-emerald-50",
      badgeText: "text-emerald-700",
      icon: "✅",
      color: "text-emerald-600",
    },
  };

  const statusStyle = statusConfig[visitStatus] || statusConfig.not_visited;

  // Class badge color
  const classColor = {
    A: "bg-red-100 text-red-700",
    B: "bg-blue-100 text-blue-700",
    C: "bg-gray-100 text-gray-700",
  };

  // Score circle color based on sales index
  const scoreColor =
    salesIndex >= 80
      ? "bg-orange-100 text-orange-600"
      : salesIndex >= 60
        ? "bg-yellow-100 text-yellow-600"
        : "bg-gray-100 text-gray-600";

  if (variant === "admin") {
    // Admin expandable card with full details
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full p-4 flex items-start justify-between hover:bg-gray-50 transition-colors text-left"
        >
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Avatar */}
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${statusStyle.badgeBg} ${statusStyle.badgeText}`}
            >
              {docName?.charAt(0)?.toUpperCase()}
            </div>

            {/* Doctor info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900">{docName}</p>
              <p className="text-xs text-gray-400">{specialty}</p>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${classColor[classification] || "bg-gray-100 text-gray-700"}`}>
                  Class {classification}
                </span>
                {lastVisited && (
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">
                    📅 {new Date(lastVisited).toLocaleDateString("en-IN")}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right side: Status + Toggle */}
          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${statusStyle.badgeBg} ${statusStyle.badgeText}`}>
              {statusStyle.badge}
            </span>
            <span className="text-gray-400 text-sm">{expanded ? "▲" : "▼"}</span>
          </div>
        </button>

        {expanded && (
          <div className="border-t border-gray-100 px-4 py-3 bg-gray-50/50 space-y-3">
            {/* Visit stats grid */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white rounded-lg p-2.5 border border-gray-100 text-center">
                <p className="text-sm font-extrabold text-gray-900">{visitCount}</p>
                <p className="text-[9px] text-gray-400 font-medium">Visits</p>
              </div>
              <div className="bg-white rounded-lg p-2.5 border border-gray-100 text-center">
                <p className="text-sm font-extrabold text-gray-900">{targetVisits}</p>
                <p className="text-[9px] text-gray-400 font-medium">Target</p>
              </div>
              <div className="bg-white rounded-lg p-2.5 border border-orange-100 text-center">
                <p className="text-sm font-extrabold text-orange-600">{shortfallCount}</p>
                <p className="text-[9px] text-gray-400 font-medium">Short</p>
              </div>
            </div>

            {/* Additional info */}
            {area && <p className="text-xs text-gray-600">📍 {area}</p>}
            {salesIndex > 0 && (
              <div className="text-xs">
                <span className="text-gray-500">Sales Index:</span>
                <span className={`ml-1 font-bold ${salesIndex >= 80 ? "text-orange-600" : "text-gray-600"}`}>
                  {salesIndex.toFixed(0)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  if (variant === "compact") {
    // Compact card for MR visits page (similar to your image)
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              {/* Doctor name + class */}
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-gray-900 text-sm truncate">{docName}</h3>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold flex-shrink-0 ${classColor[classification] || "bg-gray-100 text-gray-700"}`}>
                  Class {classification}
                </span>
              </div>

              {/* Specialty + area */}
              <p className="text-xs text-gray-400">{specialty}</p>
              {area && <p className="text-xs text-gray-400">{area}</p>}

              {/* Visit status badge */}
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusStyle.badgeBg} ${statusStyle.badgeText}`}>
                  {statusStyle.icon} {statusStyle.badge}
                </span>
                {lastVisited && (
                  <span className="text-[10px] text-gray-500 bg-gray-50 px-2 py-0.5 rounded">
                    Last: {new Date(lastVisited).toLocaleDateString("en-IN")}
                  </span>
                )}
              </div>
            </div>

            {/* Right side: Score circle */}
            <div className="flex flex-col items-center gap-2 flex-shrink-0 ml-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-extrabold text-sm ${scoreColor}`}>
                {salesIndex.toFixed(0)}
              </div>
              <span className="text-[9px] text-gray-400 font-medium">Sales Index</span>
            </div>
          </div>

          {/* Visit stats bar */}
          <div className="flex items-center gap-2 mb-3">
            {/* Visit count + target */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-medium text-gray-600">
                  {visitCount}/{targetVisits} visits
                </span>
                <span className="text-[10px] text-orange-600 font-bold">{shortfallCount} short</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    visitCount >= targetVisits ? "bg-emerald-500" : visitCount > 0 ? "bg-orange-500" : "bg-red-500"
                  }`}
                  style={{
                    width: targetVisits > 0 ? Math.min(100, (visitCount / targetVisits) * 100) + "%" : "0%",
                  }}
                />
              </div>
            </div>

            {/* Sales index bar */}
            <div className="w-20">
              <div className="text-[9px] text-gray-400 font-medium text-right mb-0.5">Rx {salesIndex.toFixed(0)}%</div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${salesIndex >= 80 ? "bg-orange-500" : "bg-gray-300"}`}
                  style={{ width: Math.min(100, salesIndex) + "%" }}
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            {onPlanVisit && (
              <button
                onClick={onPlanVisit}
                disabled={actionLoading}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-lg font-bold text-[11px] shadow-sm transition-all disabled:opacity-50 whitespace-nowrap"
              >
                {actionLoading ? "..." : "📍 Plan Visit"}
              </button>
            )}
            {onViewDetails && (
              <button
                onClick={onViewDetails}
                className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-600 px-3 py-2 rounded-lg font-bold text-[11px] border border-gray-200 transition-all"
              >
                📋 Details
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Expanded variant (default)
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-bold text-gray-900">{docName}</h3>
          <p className="text-xs text-gray-400">{specialty}</p>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${statusStyle.badgeBg} ${statusStyle.badgeText}`}>
          {statusStyle.badge}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Visits: {visitCount}/{targetVisits}</span>
          <span className="text-orange-600 font-bold">{shortfallCount} short</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-orange-500 transition-all"
            style={{
              width: targetVisits > 0 ? Math.min(100, (visitCount / targetVisits) * 100) + "%" : "0%",
            }}
          />
        </div>
      </div>
    </div>
  );
}
