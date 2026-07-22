import { Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <div className="min-h-screen flex mesh-bg" style={{ background: 'hsl(222, 47%, 4%)' }}>
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12"
        style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(79,70,229,0.12) 0%, transparent 60%), radial-gradient(ellipse at 70% 20%, rgba(124,58,237,0.08) 0%, transparent 50%)' }}
        />
        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}>
            <Zap className="h-4.5 w-4.5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Genesis AI</p>
            <p className="text-[10px] text-white/30 uppercase tracking-widest">Platform</p>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="relative space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-white leading-tight">
              Build full-stack apps<br />
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
                from JSON config
              </span>
            </h2>
            <p className="text-white/40 mt-4 text-base leading-relaxed max-w-xs">
              Define entities, pages, and workflows in minutes. No code required.
            </p>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Metadata-driven runtime', desc: 'JSON → full CRUD applications instantly' },
              { label: 'Visual component registry', desc: 'Forms, tables, charts, dashboards' },
              { label: 'Workflow automation', desc: 'Event-driven actions on your data' },
            ].map((f) => (
              <div key={f.label} className="flex items-start gap-3">
                <div className="h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: 'rgba(79,70,229,0.2)' }}>
                  <span className="h-2 w-2 rounded-full bg-indigo-400 block" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white/80">{f.label}</p>
                  <p className="text-xs text-white/35 mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <p className="text-xs text-white/20">© 2024 Genesis AI Platform. All rights reserved.</p>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <Link to="/" className="flex lg:hidden items-center gap-2 mb-8">
            <div className="h-8 w-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}>
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold text-white">Genesis AI</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
            {subtitle && <p className="text-white/40 mt-1.5 text-sm">{subtitle}</p>}
          </div>

          <div className="rounded-2xl border border-white/[0.06] p-7"
            style={{ background: 'rgba(255,255,255,0.03)' }}>
            {children}
          </div>

          {footer && (
            <p className="text-center text-sm text-white/35 mt-5">{footer}</p>
          )}
        </div>
      </div>
    </div>
  );
}