import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Boxes, Workflow, Settings, Zap, LogOut, Menu,
  ChevronRight, Activity, Cpu, HelpCircle, Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';

const NAV_GROUPS = [
  {
    label: 'Platform',
    items: [
      { path: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
      { path: '/apps', icon: Boxes, label: 'Applications' },
      { path: '/workflows', icon: Workflow, label: 'Workflows' },
    ],
  },
];

function NavItem({ item, onClick }) {
  const location = useLocation();
  const active = item.exact
    ? location.pathname === item.path
    : location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));

  return (
    <Link
      to={item.path}
      onClick={onClick}
      className={cn(
        'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 select-none',
        active
          ? 'text-white'
          : 'text-white/50 hover:text-white/90 hover:bg-white/[0.04]'
      )}
    >
      {active && (
        <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-600/30 via-violet-600/20 to-transparent border border-indigo-500/20" />
      )}
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-gradient-to-b from-indigo-400 to-violet-500" />
      )}
      <item.icon className={cn('relative h-4 w-4 shrink-0 transition-colors', active ? 'text-indigo-400' : 'text-white/40 group-hover:text-white/70')} />
      <span className="relative">{item.label}</span>
      {active && <ChevronRight className="relative ml-auto h-3 w-3 text-indigo-400/60" />}
    </Link>
  );
}

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  const { data: apps = [] } = useQuery({
    queryKey: ['appConfigs'],
    queryFn: () => base44.entities.AppConfig.list('-created_date', 100),
  });

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const activeApps = apps.filter(a => a.status === 'active').length;
  const initials = user?.full_name ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';

  return (
    <div className="min-h-screen bg-background flex mesh-bg">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed lg:sticky top-0 left-0 h-screen w-[220px] flex flex-col z-50 transition-transform duration-300 ease-out',
        'border-r border-white/[0.06]',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}
        style={{ background: 'hsl(222, 47%, 4%)' }}
      >
        {/* Logo */}
        <div className="px-5 pt-6 pb-5">
          <Link to="/" className="flex items-center gap-3" onClick={() => setSidebarOpen(false)}>
            <div className="relative h-8 w-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}>
              <Zap className="h-4 w-4 text-white" />
              <span className="absolute inset-0 rounded-xl glow-indigo opacity-50" />
            </div>
            <div>
              <p className="text-sm font-bold text-white tracking-tight leading-none">Genesis AI</p>
              <p className="text-[10px] text-white/30 uppercase tracking-[0.15em] mt-0.5">Platform</p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="mb-4">
              <p className="px-3 mb-2 text-[10px] font-semibold text-white/20 uppercase tracking-[0.15em]">
                {group.label}
              </p>
              {group.items.map((item) => (
                <NavItem key={item.path} item={item} onClick={() => setSidebarOpen(false)} />
              ))}
            </div>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="px-3 py-4 space-y-3 border-t border-white/[0.06]">
          {/* Usage card */}
          <div className="rounded-xl p-3.5" style={{ background: 'rgba(79,70,229,0.08)', border: '1px solid rgba(79,70,229,0.15)' }}>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-medium text-white/60">Active Apps</span>
              <span className="text-xs font-bold text-indigo-400">{activeApps}</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min((activeApps / Math.max(apps.length, 1)) * 100, 100)}%`,
                  background: 'linear-gradient(90deg, #4F46E5, #7C3AED)',
                }}
              />
            </div>
            <p className="text-[10px] text-white/30 mt-2">{apps.length} total applications</p>
          </div>

          {/* User */}
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer group">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
              style={{ background: 'linear-gradient(135deg, #4F46E5, #EC4899)' }}>
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white/80 truncate">{user?.full_name || 'User'}</p>
              <p className="text-[10px] text-white/30 truncate">{user?.email || ''}</p>
            </div>
            <button
              onClick={() => base44.auth.logout()}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-white/10"
              title="Sign out"
            >
              <LogOut className="h-3.5 w-3.5 text-white/40" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]"
          style={{ background: 'rgba(5, 8, 22, 0.9)', backdropFilter: 'blur(20px)' }}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-white/[0.06] transition-colors"
          >
            <Menu className="h-5 w-5 text-white/70" />
          </button>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}>
              <Zap className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-bold text-sm text-white">Genesis AI</span>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <button className="p-2 rounded-lg hover:bg-white/[0.06] transition-colors">
              <Bell className="h-4 w-4 text-white/40" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}