export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-40 bg-white/10 rounded" />
          <div className="h-4 w-64 bg-white/5 rounded" />
        </div>
        <div className="h-9 w-48 bg-white/10 rounded-lg" />
      </div>

      {/* KPI Cards skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-white/5 bg-background-card p-6"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 w-24 bg-white/10 rounded" />
                <div className="h-8 w-32 bg-white/10 rounded" />
              </div>
              <div className="h-12 w-12 bg-white/10 rounded-lg" />
            </div>
            <div className="mt-4 h-4 w-36 bg-white/5 rounded" />
          </div>
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-white/5 bg-background-card p-6"
          >
            <div className="h-5 w-40 bg-white/10 rounded mb-4" />
            <div className="h-[300px] bg-white/5 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
