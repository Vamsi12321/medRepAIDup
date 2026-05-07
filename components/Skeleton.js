// Pulse shimmer base
const Pulse = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
);

// Single table row skeleton
export function TableRowSkeleton({ cols = 5 }) {
  return (
    <tr className="border-b border-gray-100">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-5 py-4">
          <Pulse className="h-4 w-full" />
          {i === 0 && <Pulse className="h-3 w-2/3 mt-2" />}
        </td>
      ))}
    </tr>
  );
}

// Table skeleton (thead + n rows)
export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="h-12 bg-gray-100 animate-pulse" />
      <table className="w-full">
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRowSkeleton key={i} cols={cols} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Card skeleton (for grid layouts like companies)
export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 space-y-3 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Pulse className="h-5 w-1/2" />
          <Pulse className="h-3 w-1/3" />
        </div>
        <Pulse className="h-8 w-16 rounded-xl" />
      </div>
      <Pulse className="h-3 w-full" />
      <Pulse className="h-3 w-3/4" />
      <div className="flex space-x-2 pt-2">
        <Pulse className="h-9 flex-1 rounded-lg" />
        <Pulse className="h-9 flex-1 rounded-lg" />
        <Pulse className="h-9 w-24 rounded-xl" />
      </div>
    </div>
  );
}

// Stat card skeleton
export function StatSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 animate-pulse">
      <Pulse className="h-10 w-10 rounded-xl mb-4" />
      <Pulse className="h-8 w-16 mb-2" />
      <Pulse className="h-4 w-24" />
    </div>
  );
}

// Grid of stat skeletons
export function StatGridSkeleton({ count = 3 }) {
  const colClass = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-4" }[count] || "sm:grid-cols-3";
  return (
    <div className={`grid grid-cols-1 ${colClass} gap-4 sm:gap-6 mb-6`}>
      {Array.from({ length: count }).map((_, i) => <StatSkeleton key={i} />)}
    </div>
  );
}
