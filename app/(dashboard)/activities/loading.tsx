export default function ActivitiesLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-36 bg-white/10 rounded" />
          <div className="h-4 w-52 bg-white/5 rounded" />
        </div>
      </div>

      <div className="flex gap-3">
        <div className="h-10 w-48 bg-white/10 rounded-lg" />
        <div className="h-10 w-32 bg-white/10 rounded-lg" />
      </div>

      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="flex gap-4 rounded-xl border border-white/5 bg-background-card p-4"
          >
            <div className="h-10 w-10 bg-white/10 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-48 bg-white/10 rounded" />
              <div className="h-3 w-72 bg-white/5 rounded" />
              <div className="h-3 w-24 bg-white/5 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
