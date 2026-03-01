export default function SettingsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-7 w-28 bg-white/10 rounded" />
        <div className="h-4 w-56 bg-white/5 rounded" />
      </div>

      <div className="flex gap-2 border-b border-white/5 pb-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-8 w-24 bg-white/10 rounded-lg" />
        ))}
      </div>

      <div className="rounded-xl border border-white/5 bg-background-card p-6 space-y-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-28 bg-white/10 rounded" />
            <div className="h-10 w-full bg-white/5 rounded-lg" />
          </div>
        ))}
        <div className="h-10 w-24 bg-white/10 rounded-lg" />
      </div>
    </div>
  );
}
