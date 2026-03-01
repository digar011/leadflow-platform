export default function ReportsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-28 bg-white/10 rounded" />
          <div className="h-4 w-52 bg-white/5 rounded" />
        </div>
        <div className="h-9 w-36 bg-white/10 rounded-lg" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-white/5 bg-background-card p-6"
          >
            <div className="h-5 w-32 bg-white/10 rounded mb-4" />
            <div className="h-[200px] bg-white/5 rounded-lg" />
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-white/5 bg-background-card p-6">
        <div className="h-5 w-40 bg-white/10 rounded mb-4" />
        <div className="h-[300px] bg-white/5 rounded-lg" />
      </div>
    </div>
  );
}
