import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Plus, Search, Database, MoreVertical, Trash2,
  Play, Pause, Layers, Clock, ArrowUpRight, GitBranch, Filter
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import { safeParseJSON } from '@/lib/configParser';

const STATUS_CONFIG = {
  active: { label: 'Active', className: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
  draft: { label: 'Draft', className: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
  archived: { label: 'Archived', className: 'text-white/30 bg-white/[0.04] border-white/10' },
};

const APP_GRADIENTS = [
  'from-indigo-600/20 to-violet-600/20',
  'from-violet-600/20 to-pink-600/20',
  'from-cyan-600/20 to-teal-600/20',
  'from-blue-600/20 to-indigo-600/20',
  'from-pink-600/20 to-rose-600/20',
  'from-teal-600/20 to-green-600/20',
];

export default function AppsList() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: apps = [], isLoading } = useQuery({
    queryKey: ['appConfigs'],
    queryFn: () => base44.entities.AppConfig.list('-created_date', 100),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.AppConfig.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['appConfigs'] }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.AppConfig.update(id, { status: status === 'active' ? 'draft' : 'active' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['appConfigs'] }),
  });

  const filtered = apps.filter(app => {
    const matchesSearch = !search || app.name?.toLowerCase().includes(search.toLowerCase()) || app.description?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || app.status === filter;
    return matchesSearch && matchesFilter;
  });

  const counts = { all: apps.length, active: apps.filter(a => a.status === 'active').length, draft: apps.filter(a => a.status === 'draft').length };

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="border-b border-white/[0.06]" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-2">Platform</p>
              <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">Applications</h1>
              <p className="text-white/40 mt-1.5 text-sm">
                {apps.length} app{apps.length !== 1 ? 's' : ''} in your workspace
              </p>
            </div>
            <Link to="/apps/new">
              <Button
                className="h-10 px-5 text-sm font-semibold text-white rounded-xl transition-all duration-200 hover:opacity-90 hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', boxShadow: '0 0 20px rgba(79,70,229,0.3)' }}
              >
                <Plus className="h-4 w-4 mr-2" /> New Application
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8 space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25" />
            <Input
              placeholder="Search applications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/25 focus:border-indigo-500/50 rounded-xl"
            />
          </div>
          <div className="flex items-center gap-2 rounded-xl p-1 border border-white/[0.08]"
            style={{ background: 'rgba(255,255,255,0.02)' }}>
            {['all', 'active', 'draft'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  filter === f
                    ? 'text-white'
                    : 'text-white/40 hover:text-white/70'
                }`}
                style={filter === f ? { background: 'rgba(79,70,229,0.25)', color: '#a5b4fc' } : {}}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                <span className="ml-1.5 opacity-60">({counts[f]})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/[0.08] p-16 text-center"
            style={{ background: 'rgba(255,255,255,0.01)' }}>
            <div className="h-16 w-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
              style={{ background: 'rgba(79,70,229,0.06)', border: '1px solid rgba(79,70,229,0.12)' }}>
              <Layers className="h-7 w-7 text-indigo-400/40" />
            </div>
            <h3 className="font-semibold text-white mb-2">
              {search ? 'No matching applications' : 'No applications yet'}
            </h3>
            <p className="text-white/35 text-sm mb-6">
              {search ? 'Try a different search term' : 'Define your first app with a JSON configuration'}
            </p>
            {!search && (
              <Link to="/apps/new">
                <Button className="h-9 px-4 text-sm rounded-xl"
                  style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}>
                  <Plus className="h-3.5 w-3.5 mr-2" /> Create Application
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((app, idx) => {
              const s = STATUS_CONFIG[app.status] || STATUS_CONFIG.draft;
              const grad = APP_GRADIENTS[idx % APP_GRADIENTS.length];
              const config = safeParseJSON(app.config_json);
              const entityCount = config?.entities?.length || 0;
              const pageCount = config?.pages?.length || 0;

              return (
                <div key={app.id} className="group relative rounded-2xl border border-white/[0.06] hover:border-indigo-500/25 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.025)' }}>
                  {/* Top shine line */}
                  <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(79,70,229,0.5), transparent)' }}
                  />
                  {/* Gradient bg */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: 'linear-gradient(135deg, rgba(79,70,229,0.04) 0%, transparent 60%)' }}
                  />

                  <div className="relative p-6">
                    <div className="flex items-start justify-between mb-5">
                      <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center border border-white/[0.08] transition-transform duration-300 group-hover:scale-110`}>
                        <Database className="h-5 w-5 text-white/70" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${s.className}`}>
                          {s.label}
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="h-7 w-7 rounded-lg flex items-center justify-center text-white/25 hover:text-white/80 hover:bg-white/[0.06] transition-all opacity-0 group-hover:opacity-100">
                              <MoreVertical className="h-3.5 w-3.5" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44 bg-card border-white/[0.08]">
                            <DropdownMenuItem asChild>
                              <Link to={`/apps/${app.id}`} className="flex items-center gap-2 cursor-pointer">
                                <ArrowUpRight className="h-4 w-4" /> Open App
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleMutation.mutate({ id: app.id, status: app.status })}>
                              {app.status === 'active' ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                              {app.status === 'active' ? 'Set to Draft' : 'Activate'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-400 focus:text-red-400" onClick={() => deleteMutation.mutate(app.id)}>
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <Link to={`/apps/${app.id}`}>
                      <h3 className="font-semibold text-white/90 group-hover:text-white transition-colors text-base mb-1.5">
                        {app.name}
                      </h3>
                      <p className="text-sm text-white/35 line-clamp-2 leading-relaxed">
                        {app.description || 'No description provided'}
                      </p>
                    </Link>

                    {/* Meta */}
                    <div className="flex items-center gap-4 mt-5 pt-4 border-t border-white/[0.06]">
                      <span className="flex items-center gap-1.5 text-xs text-white/30">
                        <Database className="h-3 w-3" /> {entityCount} entities
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-white/30">
                        <Layers className="h-3 w-3" /> {pageCount} pages
                      </span>
                      {app.created_date && (
                        <span className="ml-auto flex items-center gap-1 text-[11px] text-white/20">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(app.created_date), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}