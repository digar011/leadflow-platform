export default function LeadsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-32 bg-white/10 rounded" />
          <div className="h-4 w-56 bg-white/5 rounded" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-28 bg-white/10 rounded-lg" />
          <div className="h-9 w-28 bg-white/10 rounded-lg" />
        </div>
      </div>

      {/* Filters skeleton */}
      <div className="flex gap-3">
        <div className="h-10 w-64 bg-white/10 rounded-lg" />
        <div className="h-10 w-32 bg-white/10 rounded-lg" />
        <div className="h-10 w-32 bg-white/10 rounded-lg" />
      </div>

      {/* Table skeleton */}
      <div className="rounded-xl border border-white/5 bg-background-card">
        <div className="border-b border-white/5 p-4">
          <div className="grid grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-white/10 rounded" />
            ))}
          </div>
        </div>
        {[...Array(8)].map((_, i) => (
          <div key={i} className="border-b border-white/5 p-4">
            <div className="grid grid-cols-5 gap-4">
              {[...Array(5)].map((_, j) => (
                <div key={j} className="h-4 bg-white/5 rounded" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
