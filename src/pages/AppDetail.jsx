import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft, Save, Code, Eye, Database, Play, Pause,
  CheckCircle2, AlertCircle, Layers, Clock
} from 'lucide-react';
import { safeParseJSON } from '@/lib/configParser';
import AppRuntime from '@/components/runtime/AppRuntime';
import { formatDistanceToNow } from 'date-fns';

const STATUS_CONFIG = {
  active: { label: 'Active', className: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
  draft: { label: 'Draft', className: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
  archived: { label: 'Archived', className: 'text-white/30 bg-white/[0.04] border-white/10' },
};

const TABS = [
  { id: 'runtime', icon: Eye, label: 'Runtime' },
  { id: 'config', icon: Code, label: 'Configuration' },
  { id: 'schema', icon: Database, label: 'Schema' },
];

export default function AppDetail() {
  const pathParts = window.location.pathname.split('/');
  const appId = pathParts[pathParts.length - 1];
  const queryClient = useQueryClient();

  const { data: app, isLoading } = useQuery({
    queryKey: ['appConfig', appId],
    queryFn: async () => {
      const apps = await base44.entities.AppConfig.filter({ id: appId });
      return apps[0];
    },
    enabled: !!appId,
  });

  const [editMode, setEditMode] = useState(false);
  const [configText, setConfigText] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [activeTab, setActiveTab] = useState('runtime');

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.AppConfig.update(appId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appConfig', appId] });
      queryClient.invalidateQueries({ queryKey: ['appConfigs'] });
      setEditMode(false);
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: () => base44.entities.AppConfig.update(appId, {
      status: app.status === 'active' ? 'draft' : 'active'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appConfig', appId] });
      queryClient.invalidateQueries({ queryKey: ['appConfigs'] });
    },
  });

  const startEditing = () => {
    setConfigText(app.config_json || '');
    setName(app.name || '');
    setDescription(app.description || '');
    setEditMode(true);
  };

  const parsedConfig = useMemo(() => safeParseJSON(app?.config_json), [app?.config_json]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!app) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <AlertCircle className="h-12 w-12 text-white/20" />
        <p className="text-white/40">Application not found</p>
        <Link to="/apps">
          <Button variant="outline" className="border-white/[0.08] text-white/60 hover:text-white">
            Back to Apps
          </Button>
        </Link>
      </div>
    );
  }

  const s = STATUS_CONFIG[app.status] || STATUS_CONFIG.draft;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="border-b border-white/[0.06] shrink-0" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-5">
          <div className="flex items-center gap-4">
            <Link to="/apps">
              <button className="h-9 w-9 rounded-xl border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 transition-all">
                <ArrowLeft className="h-4 w-4" />
              </button>
            </Link>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg, rgba(79,70,229,0.2), rgba(124,58,237,0.15))', border: '1px solid rgba(79,70,229,0.2)' }}>
                <Database className="h-4 w-4 text-indigo-400" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-white truncate">{app.name}</h1>
                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${s.className}`}>
                    {s.label}
                  </span>
                </div>
                <p className="text-xs text-white/30 mt-0.5">
                  v{app.version || 1}
                  {app.created_date && (
                    <> · Updated {formatDistanceToNow(new Date(app.updated_date || app.created_date), { addSuffix: true })}</>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleStatusMutation.mutate()}
                className="h-9 px-4 rounded-xl border border-white/[0.08] text-white/50 hover:text-white hover:bg-white/[0.04] text-sm"
                disabled={toggleStatusMutation.isPending}
              >
                {app.status === 'active'
                  ? <><Pause className="h-3.5 w-3.5 mr-2" /> Pause</>
                  : <><Play className="h-3.5 w-3.5 mr-2" /> Activate</>}
              </Button>
              {!editMode && activeTab === 'config' && (
                <Button
                  size="sm"
                  onClick={startEditing}
                  className="h-9 px-4 text-sm font-semibold text-white rounded-xl"
                  style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
                >
                  <Code className="h-3.5 w-3.5 mr-2" /> Edit
                </Button>
              )}
              {editMode && (
                <Button
                  size="sm"
                  onClick={() => updateMutation.mutate({ name, description, config_json: configText, version: (app.version || 1) + 1 })}
                  disabled={updateMutation.isPending}
                  className="h-9 px-4 text-sm font-semibold text-white rounded-xl"
                  style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
                >
                  <Save className="h-3.5 w-3.5 mr-2" /> {updateMutation.isPending ? 'Saving...' : 'Save'}
                </Button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 mt-5">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); if (tab.id !== 'config') setEditMode(false); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'text-indigo-300 border border-indigo-500/25'
                    : 'text-white/40 hover:text-white/70 border border-transparent'
                }`}
                style={activeTab === tab.id ? { background: 'rgba(79,70,229,0.12)' } : {}}
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 lg:px-10 py-8">
        {activeTab === 'runtime' && (
          parsedConfig ? (
            <AppRuntime config={parsedConfig} appId={appId} />
          ) : (
            <div className="rounded-2xl border border-dashed border-white/[0.08] p-16 text-center">
              <AlertCircle className="h-12 w-12 text-white/15 mx-auto mb-4" />
              <p className="text-white/40">Invalid or missing configuration</p>
            </div>
          )
        )}

        {activeTab === 'config' && (
          editMode ? (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)}
                    className="h-10 bg-white/[0.04] border-white/[0.08] text-white rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Description</Label>
                  <Input value={description} onChange={(e) => setDescription(e.target.value)}
                    className="h-10 bg-white/[0.04] border-white/[0.08] text-white rounded-xl" />
                </div>
              </div>
              <div className="rounded-2xl overflow-hidden border border-white/[0.08]">
                <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]"
                  style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <span className="text-xs font-mono text-white/40">config.json</span>
                  <button onClick={() => setEditMode(false)} className="text-xs text-white/30 hover:text-white/70 transition-colors">Cancel</button>
                </div>
                <Textarea value={configText} onChange={(e) => setConfigText(e.target.value)}
                  className="font-mono text-sm min-h-[500px] border-0 rounded-none resize-none p-5 focus-visible:ring-0"
                  style={{ background: '#09111F', color: '#a5b4fc', lineHeight: '1.7' }}
                  spellCheck={false} />
              </div>
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden border border-white/[0.08]">
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]"
                style={{ background: 'rgba(255,255,255,0.02)' }}>
                <span className="text-xs font-mono text-white/40">config.json — read only</span>
                <span className="text-xs text-white/20">{app.config_json?.split('\n').length || 0} lines</span>
              </div>
              <pre className="p-5 text-sm font-mono overflow-auto max-h-[600px] whitespace-pre-wrap leading-relaxed"
                style={{ background: '#09111F', color: '#a5b4fc' }}>
                {app.config_json ? JSON.stringify(safeParseJSON(app.config_json), null, 2) : 'No configuration'}
              </pre>
            </div>
          )
        )}

        {activeTab === 'schema' && (
          parsedConfig?.entities ? (
            <div className="space-y-6">
              <p className="text-sm text-white/40">{parsedConfig.entities.length} entities defined</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {parsedConfig.entities.map((entity) => (
                  <div key={entity.name} className="rounded-2xl border border-white/[0.06] overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-3"
                      style={{ background: 'rgba(79,70,229,0.05)' }}>
                      <div className="h-8 w-8 rounded-lg flex items-center justify-center"
                        style={{ background: 'rgba(79,70,229,0.15)' }}>
                        <Database className="h-4 w-4 text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{entity.name}</p>
                        <p className="text-xs text-white/30">{entity.fields?.length || 0} fields</p>
                      </div>
                    </div>
                    <div className="p-4 space-y-1">
                      {entity.fields?.map((f) => (
                        <div key={f.name} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-white/[0.02] transition-colors">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-white/70">{f.label || f.name}</span>
                            {f.required && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded text-red-400 bg-red-400/10 border border-red-400/20 font-semibold">req</span>
                            )}
                          </div>
                          <span className="text-xs font-mono text-indigo-400/70 bg-indigo-400/[0.06] px-2.5 py-1 rounded-lg">{f.type}</span>
                        </div>
                      ))}
                      {/* built-ins */}
                      {['id', 'created_date', 'updated_date'].map(field => (
                        <div key={field} className="flex items-center justify-between py-2.5 px-3 rounded-xl opacity-40">
                          <span className="text-sm text-white/50 font-mono">{field}</span>
                          <span className="text-xs font-mono text-white/30">auto</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/[0.08] p-16 text-center">
              <Database className="h-12 w-12 text-white/10 mx-auto mb-4" />
              <p className="text-white/35">No entity schemas defined</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}