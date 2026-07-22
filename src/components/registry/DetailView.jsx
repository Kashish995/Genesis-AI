import { format } from 'date-fns';

export default function DetailView({ config, data }) {
  const fields = config?.fields || [];

  if (!data) {
    return (
      <div className="rounded-2xl border border-white/[0.06] p-12 text-center text-white/25"
        style={{ background: 'rgba(255,255,255,0.02)' }}>
        No record selected
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/[0.06] overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
      <div className="px-5 py-4 border-b border-white/[0.06]">
        <p className="text-sm font-semibold text-white/70">{config?.title || 'Record Details'}</p>
      </div>
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
        {fields.map((field) => {
          const value = data[field.name];
          return (
            <div key={field.name}>
              <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-2">
                {field.label || field.name}
              </p>
              {field.type === 'date' && value ? (
                <p className="text-sm font-medium text-white/70">{format(new Date(value), 'PPP')}</p>
              ) : (
                <p className="text-sm font-medium text-white/70">{value !== null && value !== undefined ? String(value) : '—'}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}