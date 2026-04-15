"use client";
import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api";

export default function CompanyProfileModal({ onClose }) {
  const { data, isLoading } = useQuery({
    queryKey: ["company-profile"],
    queryFn: () => get("/api/v1/profile/company"),
    staleTime: 300000,
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={(e) => e.stopPropagation()}>

        {/* Blue banner — logo inside, no overlap */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {data?.company_logo_url ? (
              <div className="bg-white rounded-xl px-3 py-1.5 shadow flex items-center">
                <img src={data.company_logo_url} alt="logo"
                  className="h-8 w-auto object-contain" style={{maxWidth:"120px"}} />
              </div>
            ) : (
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                {data?.company_name?.charAt(0)?.toUpperCase() || "C"}
              </div>
            )}
            <div>
              <p className="text-white font-bold text-sm leading-tight">{data?.company_name || "—"}</p>
              {data?.company_industry && <p className="text-blue-200 text-xs">{data.company_industry}</p>}
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white text-xl leading-none ml-2">&times;</button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {isLoading ? (
            <div className="space-y-2">{[1,2,3].map((i) => <div key={i} className="h-8 bg-gray-100 rounded-xl animate-pulse" />)}</div>
          ) : (
            <>
              {data?.company_description && (
                <p className="text-gray-500 text-sm leading-relaxed">{data.company_description}</p>
              )}
              <div className="grid grid-cols-2 gap-2">
                {(data?.company_city || data?.company_state) && (
                  <div className="col-span-2 bg-gray-50 rounded-xl px-3 py-2">
                    <p className="text-xs text-gray-400 font-medium"> Location</p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">
                      {[data.company_city, data.company_state, data.company_country].filter(Boolean).join(", ")}
                    </p>
                  </div>
                )}
                {data?.company_founded_year && (
                  <div className="bg-blue-50 rounded-xl px-3 py-2">
                    <p className="text-xs text-blue-400 font-medium"> Founded</p>
                    <p className="text-sm font-bold text-gray-800 mt-0.5">{data.company_founded_year}</p>
                  </div>
                )}
                {data?.company_size && (
                  <div className="bg-indigo-50 rounded-xl px-3 py-2">
                    <p className="text-xs text-indigo-400 font-medium"> Size</p>
                    <p className="text-sm font-bold text-gray-800 mt-0.5">{data.company_size}</p>
                  </div>
                )}
                {data?.company_website && (
                  <div className="col-span-2 bg-gray-50 rounded-xl px-3 py-2">
                    <p className="text-xs text-gray-400 font-medium"> Website</p>
                    <a href={data.company_website?.startsWith("http") ? data.company_website : `https://${data.company_website}`}
                      target="_blank" rel="noopener noreferrer"
                      className="text-sm font-semibold text-blue-600 hover:underline truncate block mt-0.5">
                      {data.company_website}
                    </a>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
