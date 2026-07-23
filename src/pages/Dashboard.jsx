import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Boxes, Workflow, Activity, Plus, ArrowRight, Zap,
  Database, Layers, TrendingUp, Clock, CheckCircle2,
  ArrowUpRight, Sparkles, GitBranch, LayoutGrid
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { useState, useEffect } from 'react';
import { SkeletonStat, SkeletonCard } from '@/components/ui/SkeletonCard';

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (value === 0) return;
    let start = 0;
    const duration = 600;
    const step = Math.ceil(value / (duration / 16));
    const timer = setInterval(() => {
      start = Math.min(start + step, value);
      setDisplay(start);
      if (start >= value) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{display}</span>;
}

const STATUS_CONFIG = {
  active: { label: 'Active', className: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
  draft: { label: 'Draft', className: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
  archived: { label: 'Archived', className: 'text-white/30 bg-white/[0.04] border-white/10' },
};

const TEMPLATES = [
  { name: 'CRM System', icon: '👥', desc: 'Contacts, deals & pipeline', color: 'from-blue-600/20 to-indigo-600/20' },
  { name: 'Task Tracker', icon: '✅', desc: 'Tasks, priorities & deadlines', color: 'from-violet-600/20 to-purple-600/20' },
  { name: 'Inventory', icon: '📦', desc: 'Products, stock & categories', color: 'from-teal-600/20 to-cyan-600/20' },
];

export default function Dashboard() {
  const { data: apps = [], isLoading: appsLoading } = useQuery({
    queryKey: ['appConfigs'],
    queryFn: () => base44.entities.AppConfig.list('-created_date', 50),
  });
  const { data: workflows = [] } = useQuery({
    queryKey: ['workflows'],
    queryFn: () => base44.entities.Workflow.list('-created_date', 50),
  });
  const { data: logs = [] } = useQuery({
    queryKey: ['workflowLogs'],
    queryFn: () => base44.entities.WorkflowLog.list('-created_date', 20),
  });
  const [user, setUser] = useState(null);
  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  const activeApps = apps.filter(a => a.status === 'active');
  const recentApps = apps.slice(0, 4);
  const firstName = user?.full_name?.split(' ')[0] || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const stats = [
    { label: 'Total Applications', value: apps.length, icon: Boxes, trend: '+2 this week', color: 'indigo' },
    { label: 'Active Apps', value: activeApps.length, icon: Zap, trend: 'Running live', color: 'emerald' },
    { label: 'Workflows', value: workflows.length, icon: GitBranch, trend: 'Automations', color: 'violet' },
    { label: 'Executions', value: logs.length, icon: Activity, trend: 'All time', color: 'cyan' },
  ];

  const colorMap = {
    indigo: { bg: 'rgba(79,70,229,0.12)', icon: '#818cf8', glow: 'rgba(79,70,229,0.2)' },
    emerald: { bg: 'rgba(16,185,129,0.12)', icon: '#34d399', glow: 'rgba(16,185,129,0.2)' },
    violet: { bg: 'rgba(124,58,237,0.12)', icon: '#a78bfa', glow: 'rgba(124,58,237,0.2)' },
    cyan: { bg: 'rgba(6,182,212,0.12)', icon: '#22d3ee', glow: 'rgba(6,182,212,0.2)' },
  };

  return (
    <div className="min-h-screen">
      {/* Hero Welcome Section */}
      <div className="relative overflow-hidden border-b border-white/[0.06]">
        <div className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 20% 50%, rgba(79,70,229,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(124,58,237,0.06) 0%, transparent 50%)',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 py-10 lg:py-12">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full border text-indigo-400 border-indigo-500/30"
                  style={{ background: 'rgba(79,70,229,0.1)' }}>
                  Workspace
                </span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">
                {greeting}, <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">{firstName}</span>
              </h1>
              <p className="text-white/40 mt-2 text-base">
                {apps.length === 0
                  ? 'Start building your first metadata-driven application.'
                  : `You have ${activeApps.length} active app${activeApps.length !== 1 ? 's' : ''} running in production.`}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link to="/apps/new">
                <Button
                  className="h-10 px-5 text-sm font-semibold text-white rounded-xl transition-all duration-200 hover:opacity-90 hover:scale-[1.02] active:scale-[0.99]"
                  style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', boxShadow: '0 0 20px rgba(79,70,229,0.35)' }}
                >
                  <Plus className="h-4 w-4 mr-2" /> New Application
                </Button>
              </Link>
              <Link to="/apps">
                <Button variant="ghost" className="h-10 px-5 text-sm font-medium text-white/60 hover:text-white border border-white/[0.08] rounded-xl hover:bg-white/[0.04]">
                  Browse Apps <ArrowRight className="h-3.5 w-3.5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8 space-y-10">
        {/* KPI Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {appsLoading
            ? [1,2,3,4].map(i => <SkeletonStat key={i} />)
            : stats.map((stat) => {
              const c = colorMap[stat.color];
              return (
                <div key={stat.label}
                  className="group relative rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5 cursor-default border border-white/[0.06] hover:border-white/[0.10]"
                  style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: `radial-gradient(circle at 50% 0%, ${c.glow}15 0%, transparent 70%)` }}
                  />
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-9 w-9 rounded-xl flex items-center justify-center"
                      style={{ background: c.bg }}>
                      <stat.icon className="h-4 w-4" style={{ color: c.icon }} />
                    </div>
                    <span className="text-[11px] font-medium text-white/30">{stat.trend}</span>
                  </div>
                  <p className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
                    <AnimatedNumber value={stat.value} />
                  </p>
                  <p className="text-xs text-white/40 mt-1 font-medium">{stat.label}</p>
                </div>
              );
            })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Applications */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">Recent Applications</h2>
              <Link to="/apps" className="flex items-center gap-1.5 text-xs font-medium text-white/40 hover:text-indigo-400 transition-colors">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {appsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
              </div>
            ) : recentApps.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/[0.08] p-12 text-center"
                style={{ background: 'rgba(255,255,255,0.01)' }}>
                <div className="h-14 w-14 rounded-2xl mx-auto mb-5 flex items-center justify-center"
                  style={{ background: 'rgba(79,70,229,0.08)', border: '1px solid rgba(79,70,229,0.15)' }}>
                  <Layers className="h-6 w-6 text-indigo-400/60" />
                </div>
                <h3 className="font-semibold text-white mb-2">No applications yet</h3>
                <p className="text-white/40 text-sm mb-6">Create your first metadata-driven application from a JSON config</p>
                <Link to="/apps/new">
                  <Button className="h-9 px-4 text-sm rounded-xl"
                    style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}>
                    <Plus className="h-3.5 w-3.5 mr-2" /> Create Application
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recentApps.map((app, idx) => {
                  const s = STATUS_CONFIG[app.status] || STATUS_CONFIG.draft;
                  return (
                    <Link key={app.id} to={`/apps/${app.id}`}>
                      <div className="group relative rounded-2xl p-5 h-full transition-all duration-300 hover:-translate-y-1 border border-white/[0.06] hover:border-indigo-500/25 cursor-pointer"
                        style={{ background: 'rgba(255,255,255,0.025)' }}>
                        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          style={{ background: 'linear-gradient(135deg, rgba(79,70,229,0.05) 0%, transparent 60%)' }}
                        />
                        <div className="absolute top-0 left-0 right-0 h-px rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ background: 'linear-gradient(90deg, transparent, rgba(79,70,229,0.5), transparent)' }}
                        />
                        <div className="flex items-start justify-between mb-4">
                          <div className="h-10 w-10 rounded-xl flex items-center justify-center text-base shrink-0 transition-transform duration-300 group-hover:scale-110"
                            style={{ background: 'linear-gradient(135deg, rgba(79,70,229,0.2), rgba(124,58,237,0.15))', border: '1px solid rgba(79,70,229,0.2)' }}>
                            <Database className="h-4.5 w-4.5 text-indigo-400" />
                          </div>
                          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${s.className}`}>
                            {s.label}
                          </span>
                        </div>
                        <h3 className="font-semibold text-white/90 group-hover:text-white transition-colors">{app.name}</h3>
                        <p className="text-sm text-white/35 mt-1.5 line-clamp-2 leading-relaxed">{app.description || 'No description'}</p>
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.06]">
                          <span className="text-[11px] text-white/25 font-mono">v{app.version || 1}</span>
                          {app.created_date && (
                            <span className="text-[11px] text-white/25 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(app.created_date), { addSuffix: true })}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Quick Templates */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white/50">Starter Templates</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {TEMPLATES.map((t) => (
                  <Link key={t.name} to="/apps/new">
                    <div className={`group rounded-xl p-4 border border-white/[0.06] hover:border-white/[0.12] cursor-pointer transition-all duration-200 hover:-translate-y-0.5 bg-gradient-to-br ${t.color}`}>
                      <span className="text-2xl mb-2 block">{t.icon}</span>
                      <p className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors">{t.name}</p>
                      <p className="text-xs text-white/35 mt-0.5">{t.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Workflow status */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-white">Workflows</h2>
                <Link to="/workflows" className="text-xs font-medium text-white/40 hover:text-indigo-400 transition-colors flex items-center gap-1">
                  Manage <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="rounded-2xl border border-white/[0.06] overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
                {workflows.length === 0 ? (
                  <div className="p-8 text-center">
                    <GitBranch className="h-8 w-8 text-white/10 mx-auto mb-3" />
                    <p className="text-sm text-white/30">No workflows defined</p>
                    <Link to="/workflows">
                      <button className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">Create one →</button>
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-white/[0.04]">
                    {workflows.slice(0, 4).map((wf) => (
                      <div key={wf.id} className="px-4 py-3.5 flex items-center gap-3 hover:bg-white/[0.02] transition-colors">
                        <div className={`h-2 w-2 rounded-full shrink-0 ${wf.enabled ? 'bg-emerald-400' : 'bg-white/20'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white/80 truncate">{wf.name}</p>
                          <p className="text-xs text-white/30 mt-0.5">on {wf.trigger_event} · {wf.trigger_entity}</p>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${wf.enabled ? 'text-emerald-400 bg-emerald-400/10' : 'text-white/30 bg-white/[0.04]'}`}>
                          {wf.enabled ? 'ON' : 'OFF'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Activity feed */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-white">Activity</h2>
                <span className="text-xs text-white/25">Recent</span>
              </div>
              <div className="rounded-2xl border border-white/[0.06] overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
                {logs.length === 0 ? (
                  <div className="p-8 text-center">
                    <Activity className="h-8 w-8 text-white/10 mx-auto mb-3" />
                    <p className="text-sm text-white/30">No executions yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/[0.04]">
                    {logs.slice(0, 6).map((log) => (
                      <div key={log.id} className="px-4 py-3.5 flex items-start gap-3 hover:bg-white/[0.02] transition-colors">
                        <div className={`mt-1 h-1.5 w-1.5 rounded-full shrink-0 ${
                          log.status === 'success' ? 'bg-emerald-400' :
                          log.status === 'failed' ? 'bg-red-400' : 'bg-amber-400'
                        }`} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-white/70 truncate">{log.workflow_name}</p>
                          <p className="text-xs text-white/25 mt-0.5">
                            {log.trigger_event} {log.duration_ms ? `· ${log.duration_ms}ms` : ''}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}