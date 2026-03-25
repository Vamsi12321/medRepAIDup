"use client";
import { useEffect } from "react";

const icons = {
  success: { emoji: "✅", bg: "bg-green-50", border: "border-green-200", text: "text-green-800" },
  error:   { emoji: "❌", bg: "bg-red-50",   border: "border-red-200",   text: "text-red-800"   },
  info:    { emoji: "ℹ️", bg: "bg-blue-50",  border: "border-blue-200",  text: "text-blue-800"  },
};

export default function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const s = icons[type];
  return (
    <div className={`fixed top-6 right-6 z-[100] flex items-center space-x-3 px-5 py-4 rounded-2xl shadow-2xl border-2 ${s.bg} ${s.border} max-w-sm animate-slideIn`}>
      <span className="text-2xl">{s.emoji}</span>
      <p className={`font-semibold text-sm ${s.text}`}>{message}</p>
      <button onClick={onClose} className={`ml-2 ${s.text} hover:opacity-60`}>✕</button>
    </div>
  );
}
