import { AlertTriangle } from 'lucide-react';

export default function FallbackComponent({ type = 'unknown', reason }) {
  return (
    <div className="rounded-2xl border border-dashed border-amber-500/20 p-6 flex items-center gap-4"
      style={{ background: 'rgba(245,158,11,0.04)' }}>
      <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: 'rgba(245,158,11,0.1)' }}>
        <AlertTriangle className="h-5 w-5 text-amber-400" />
      </div>
      <div>
        <p className="text-sm font-medium text-amber-400/80">
          Unknown component type:{' '}
          <code className="font-mono text-xs text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-lg">{type}</code>
        </p>
        {reason && <p className="text-xs text-white/30 mt-1">{reason}</p>}
      </div>
    </div>
  );
}