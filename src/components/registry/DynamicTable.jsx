import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ChevronLeft, ChevronRight, Edit2, Trash2, Eye, ArrowUpDown } from 'lucide-react';
import { format } from 'date-fns';

function StatusBadge({ value }) {
  const map = {
    done: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    active: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    completed: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    in_progress: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    pending: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    todo: 'text-white/40 bg-white/[0.04] border-white/10',
    lead: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
    high: 'text-red-400 bg-red-400/10 border-red-400/20',
    medium: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    low: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    draft: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    closed_won: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  };
  const cls = map[value] || 'text-white/40 bg-white/[0.04] border-white/10';
  return (
    <span className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full border ${cls}`}>
      {String(value).replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
    </span>
  );
}

function CellRenderer({ value, field }) {
  if (value === null || value === undefined || value === '') {
    return <span className="text-white/20">—</span>;
  }

  if (field?.type === 'date' && value) {
    try { return <span className="text-sm text-white/60 font-mono">{format(new Date(value), 'MMM d, yyyy')}</span>; }
    catch { return <span className="text-sm text-white/60">{String(value)}</span>; }
  }

  if (field?.type === 'select') {
    return <StatusBadge value={value} />;
  }

  if (field?.type === 'boolean') {
    return (
      <span className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
        value ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : 'text-white/30 bg-white/[0.04] border-white/10'
      }`}>
        {value ? 'Yes' : 'No'}
      </span>
    );
  }

  if (field?.type === 'email') {
    return <span className="text-sm text-indigo-400/80 font-mono">{String(value)}</span>;
  }

  const str = String(value);
  return <span className="text-sm text-white/70">{str.length > 50 ? str.slice(0, 50) + '…' : str}</span>;
}

export default function DynamicTable({ config, data = [], onEdit, onDelete, onView }) {
  const fields = config?.columns || config?.fields || [];
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const pageSize = config?.limit || config?.pageSize || 10;

  const filtered = useMemo(() => {
    if (!search) return data;
    const lower = search.toLowerCase();
    return data.filter(row => fields.some(f => String(row[f.name] || '').toLowerCase().includes(lower)));
  }, [data, search, fields]);

  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  return (
    <div className="rounded-2xl border border-white/[0.06] overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
      {/* Table header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]"
        style={{ background: 'rgba(255,255,255,0.01)' }}>
        <div>
          <h3 className="text-sm font-semibold text-white/80">{config?.title || 'Records'}</h3>
          <p className="text-xs text-white/30 mt-0.5">{filtered.length} record{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/25" />
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="pl-9 h-8 w-52 text-xs bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 rounded-lg focus:border-indigo-500/50"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
              {fields.map((f) => (
                <th key={f.name} className="px-5 py-3 text-left">
                  <span className="text-[11px] font-semibold text-white/30 uppercase tracking-wider">
                    {f.label || f.name}
                  </span>
                </th>
              ))}
              {(onEdit || onDelete || onView) && (
                <th className="px-5 py-3 text-right">
                  <span className="text-[11px] font-semibold text-white/30 uppercase tracking-wider">Actions</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={fields.length + 1} className="px-5 py-16 text-center text-sm text-white/25">
                  {search ? 'No records match your search' : 'No records yet'}
                </td>
              </tr>
            ) : (
              paged.map((row, i) => (
                <tr
                  key={row.id || row._record_id || i}
                  className="border-t border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                >
                  {fields.map((f) => (
                    <td key={f.name} className="px-5 py-3.5">
                      <CellRenderer value={row[f.name]} field={f} />
                    </td>
                  ))}
                  {(onEdit || onDelete || onView) && (
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-1">
                        {onView && (
                          <button onClick={() => onView(row)}
                            className="h-7 w-7 rounded-lg flex items-center justify-center text-white/25 hover:text-white/80 hover:bg-white/[0.06] transition-all">
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {onEdit && (
                          <button onClick={() => onEdit(row)}
                            className="h-7 w-7 rounded-lg flex items-center justify-center text-white/25 hover:text-indigo-400 hover:bg-indigo-400/10 transition-all">
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {onDelete && (
                          <button onClick={() => onDelete(row)}
                            className="h-7 w-7 rounded-lg flex items-center justify-center text-white/25 hover:text-red-400 hover:bg-red-400/10 transition-all">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.04]"
          style={{ background: 'rgba(255,255,255,0.01)' }}>
          <p className="text-xs text-white/30">
            {page * pageSize + 1}–{Math.min((page + 1) * pageSize, filtered.length)} of {filtered.length}
          </p>
          <div className="flex gap-1">
            <button
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              className="h-7 w-7 rounded-lg flex items-center justify-center border border-white/[0.08] text-white/40 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage(p => p + 1)}
              className="h-7 w-7 rounded-lg flex items-center justify-center border border-white/[0.08] text-white/40 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}