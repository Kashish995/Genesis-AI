export function SkeletonCard({ className = '' }) {
  return (
    <div className={`rounded-2xl border border-white/[0.06] p-6 ${className}`}
      style={{ background: 'rgba(255,255,255,0.02)' }}>
      <div className="flex items-start justify-between mb-5">
        <div className="h-10 w-10 rounded-xl skeleton" />
        <div className="h-5 w-16 rounded-full skeleton" />
      </div>
      <div className="h-5 w-32 rounded-lg skeleton mb-2" />
      <div className="h-4 w-48 rounded-lg skeleton mb-1" />
      <div className="h-4 w-36 rounded-lg skeleton mt-4" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-6 py-4 border-b border-white/[0.04]">
      <div className="h-8 w-8 rounded-lg skeleton shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-40 rounded skeleton" />
        <div className="h-3 w-24 rounded skeleton" />
      </div>
      <div className="h-5 w-16 rounded-full skeleton" />
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div className="rounded-2xl border border-white/[0.06] p-6"
      style={{ background: 'rgba(255,255,255,0.02)' }}>
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <div className="h-3 w-20 rounded skeleton" />
          <div className="h-8 w-14 rounded-lg skeleton" />
        </div>
        <div className="h-10 w-10 rounded-xl skeleton" />
      </div>
    </div>
  );
}