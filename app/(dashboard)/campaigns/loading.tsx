export default function CampaignsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-36 bg-white/10 rounded" />
          <div className="h-4 w-56 bg-white/5 rounded" />
        </div>
        <div className="h-9 w-36 bg-white/10 rounded-lg" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-white/5 bg-background-card p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-5 w-40 bg-white/10 rounded" />
              <div className="h-5 w-16 bg-white/10 rounded-full" />
            </div>
            <div className="h-3 w-full bg-white/5 rounded" />
            <div className="h-3 w-3/4 bg-white/5 rounded" />
            <div className="flex justify-between pt-2">
              <div className="h-4 w-20 bg-white/10 rounded" />
              <div className="h-4 w-24 bg-white/10 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
