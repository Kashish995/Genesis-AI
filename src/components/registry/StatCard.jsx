import { TrendingUp, Hash } from 'lucide-react';

export default function StatCard({ config, data = [] }) {
  const computeMetric = () => {
    let filtered = data;
    if (config?.filter) {
      filtered = data.filter(item =>
        Object.entries(config.filter).every(([key, val]) => item[key] === val)
      );
    }
    switch (config?.metric) {
      case 'count': return filtered.length;
      case 'sum': return filtered.reduce((acc, item) => acc + (Number(item[config.field]) || 0), 0);
      case 'average':
        if (filtered.length === 0) return 0;
        return Math.round(filtered.reduce((acc, item) => acc + (Number(item[config.field]) || 0), 0) / filtered.length);
      default: return filtered.length;
    }
  };

  const value = computeMetric();

  return (
    <div className="group relative rounded-2xl border border-white/[0.06] p-5 hover:border-indigo-500/20 transition-all duration-300 hover:-translate-y-0.5"
      style={{ background: 'rgba(255,255,255,0.02)' }}>
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: 'radial-gradient(circle at 50% 0%, rgba(79,70,229,0.08) 0%, transparent 70%)' }}
      />
      <div className="relative flex items-start justify-between mb-4">
        <div className="h-9 w-9 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(79,70,229,0.12)' }}>
          {config?.metric === 'count'
            ? <Hash className="h-4 w-4 text-indigo-400" />
            : <TrendingUp className="h-4 w-4 text-indigo-400" />}
        </div>
      </div>
      <p className="relative text-2xl font-bold text-white tracking-tight">{value.toLocaleString()}</p>
      <p className="relative text-xs text-white/40 mt-1 font-medium">{config?.title || 'Metric'}</p>
    </div>
  );
}