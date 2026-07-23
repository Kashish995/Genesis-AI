import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertCircle, CheckCircle2, Zap, Code, Eye, Save,
  ArrowLeft, Database, Layers, FileJson, Sparkles
} from 'lucide-react';
import { safeParseJSON, validateAppConfig, DEFAULT_APP_CONFIG } from '@/lib/configParser';
import AppPreview from '@/components/preview/AppPreview';

const TEMPLATES = [
  {
    name: 'Task Manager',
    description: 'Tasks, priorities & deadlines',
    icon: '✅',
    config: DEFAULT_APP_CONFIG,
  },
  {
    name: 'CRM System',
    description: 'Contacts, deals & pipeline',
    icon: '👥',
    config: {
      entities: [{ name: 'Contact', fields: [
        { name: 'name', type: 'string', required: true, label: 'Full Name' },
        { name: 'email', type: 'email', label: 'Email' },
        { name: 'company', type: 'string', label: 'Company' },
        { name: 'stage', type: 'select', options: ['lead', 'qualified', 'proposal', 'closed_won'], default: 'lead', label: 'Stage' },
      ]}],
      pages: [
        { name: 'Dashboard', layout: 'dashboard', components: [
          { type: 'stat_card', title: 'Total Contacts', entity: 'Contact', metric: 'count' },
          { type: 'chart', chartType: 'pie', entity: 'Contact', groupBy: 'stage', title: 'Pipeline' },
        ]},
        { name: 'Contacts', layout: 'crud', entity: 'Contact' },
      ],
    },
  },
  {
    name: 'Inventory',
    description: 'Products, stock & categories',
    icon: '📦',
    config: {
      entities: [{ name: 'Product', fields: [
        { name: 'name', type: 'string', required: true, label: 'Product Name' },
        { name: 'sku', type: 'string', label: 'SKU' },
        { name: 'category', type: 'select', options: ['electronics', 'clothing', 'food', 'other'], label: 'Category' },
        { name: 'quantity', type: 'number', label: 'Stock' },
        { name: 'price', type: 'number', label: 'Price' },
      ]}],
      pages: [
        { name: 'Overview', layout: 'dashboard', components: [
          { type: 'stat_card', title: 'Total Products', entity: 'Product', metric: 'count' },
          { type: 'chart', chartType: 'bar', entity: 'Product', groupBy: 'category', title: 'By Category' },
        ]},
        { name: 'Products', layout: 'crud', entity: 'Product' },
      ],
    },
  },
];

export default function AppBuilder() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [configText, setConfigText] = useState(JSON.stringify(DEFAULT_APP_CONFIG, null, 2));
  const [validationResult, setValidationResult] = useState(null);
  const [activeTab, setActiveTab] = useState('editor');

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.AppConfig.create(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['appConfigs'] });
      navigate(`/apps/${result.id}`);
    },
  });

  const handleValidate = () => {
    const parsed = safeParseJSON(configText);
    if (!parsed) { setValidationResult({ valid: false, errors: ['Invalid JSON syntax'] }); return; }
    setValidationResult(validateAppConfig(parsed));
  };

  const handleSave = () => {
    const parsed = safeParseJSON(configText);
    if (!parsed) return;
    const validation = validateAppConfig(parsed);
    if (!validation.valid) { setValidationResult(validation); return; }
    createMutation.mutate({ name, description, config_json: configText, status: 'draft', version: 1 });
  };

  const loadTemplate = (tpl) => {
    setConfigText(JSON.stringify(tpl.config, null, 2));
    setName(tpl.name);
    setDescription(tpl.description);
    setValidationResult(null);
  };

  const parsedConfig = safeParseJSON(configText);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="border-b border-white/[0.06] shrink-0" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-6">
          <div className="flex items-center gap-4">
            <Link to="/apps">
              <button className="h-9 w-9 rounded-xl border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 transition-all">
                <ArrowLeft className="h-4 w-4" />
              </button>
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white tracking-tight">Create Application</h1>
              <p className="text-white/35 text-sm mt-0.5">Define your application schema with JSON</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleValidate}
                className="h-9 px-4 rounded-xl border border-white/[0.08] text-white/50 hover:text-white hover:bg-white/[0.04] text-sm"
              >
                Validate JSON
              </Button>
              <Button
                onClick={handleSave}
                disabled={!name || !configText || createMutation.isPending}
                className="h-9 px-5 text-sm font-semibold text-white rounded-xl transition-all hover:opacity-90 hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', boxShadow: '0 0 20px rgba(79,70,229,0.3)' }}
              >
                <Save className="h-3.5 w-3.5 mr-2" />
                {createMutation.isPending ? 'Creating...' : 'Create App'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto w-full px-6 lg:px-10 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Editor */}
          <div className="lg:col-span-3 space-y-5">
            {/* App info */}
            <div className="rounded-2xl border border-white/[0.06] p-5" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-white/50 uppercase tracking-wider">App Name *</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="My Application"
                    className="h-10 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus:border-indigo-500/50 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Description</Label>
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What does this app do?"
                    className="h-10 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus:border-indigo-500/50 rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 rounded-xl p-1 border border-white/[0.08]"
              style={{ background: 'rgba(255,255,255,0.02)', width: 'fit-content' }}>
              {[
                { id: 'editor', icon: Code, label: 'JSON Editor' },
                { id: 'preview', icon: Eye, label: 'Live Preview' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'text-white'
                      : 'text-white/40 hover:text-white/70'
                  }`}
                  style={activeTab === tab.id ? { background: 'rgba(79,70,229,0.25)', color: '#a5b4fc' } : {}}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'editor' ? (
              <div className="rounded-2xl overflow-hidden border border-white/[0.08]">
                <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]"
                  style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="flex items-center gap-2">
                    <FileJson className="h-4 w-4 text-indigo-400" />
                    <span className="text-xs font-medium text-white/50">config.json</span>
                  </div>
                  <span className="text-xs text-white/20 font-mono">{configText.split('\n').length} lines</span>
                </div>
                <Textarea
                  value={configText}
                  onChange={(e) => { setConfigText(e.target.value); setValidationResult(null); }}
                  className="font-mono text-sm min-h-[480px] border-0 rounded-none resize-none p-5 focus-visible:ring-0"
                  style={{ background: '#09111F', color: '#a5b4fc', lineHeight: '1.7' }}
                  placeholder="Paste your JSON configuration here..."
                  spellCheck={false}
                />
              </div>
            ) : (
              <AppPreview config={parsedConfig} />
            )}

            {/* Validation feedback */}
            {validationResult && (
              <div className={`rounded-xl p-4 border flex items-start gap-3 ${
                validationResult.valid
                  ? 'border-emerald-500/20 bg-emerald-500/[0.06]'
                  : 'border-red-500/20 bg-red-500/[0.06]'
              }`}>
                {validationResult.valid
                  ? <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  : <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />}
                <div>
                  <p className={`text-sm font-semibold ${validationResult.valid ? 'text-emerald-400' : 'text-red-400'}`}>
                    {validationResult.valid ? 'Valid configuration — ready to deploy' : 'Validation failed'}
                  </p>
                  {!validationResult.valid && validationResult.errors.map((err, i) => (
                    <p key={i} className="text-xs text-red-400/70 mt-1">{err}</p>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Templates & Summary */}
          <div className="lg:col-span-2 space-y-5">
            {/* Templates */}
            <div>
              <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Starter Templates</p>
              <div className="space-y-2">
                {TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.name}
                    onClick={() => loadTemplate(tpl)}
                    className="w-full group rounded-xl border border-white/[0.06] hover:border-indigo-500/30 p-4 text-left transition-all duration-200 hover:bg-white/[0.02]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{tpl.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors">{tpl.name}</p>
                        <p className="text-xs text-white/30 mt-0.5">{tpl.description}</p>
                      </div>
                      <span className="text-xs text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">Use →</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Config Summary */}
            {parsedConfig && (
              <div className="rounded-2xl border border-white/[0.06] p-5 space-y-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Configuration</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
                    <span className="text-sm text-white/50 flex items-center gap-2">
                      <Database className="h-3.5 w-3.5" /> Entities
                    </span>
                    <span className="text-sm font-semibold text-indigo-400">{parsedConfig.entities?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
                    <span className="text-sm text-white/50 flex items-center gap-2">
                      <Layers className="h-3.5 w-3.5" /> Pages
                    </span>
                    <span className="text-sm font-semibold text-violet-400">{parsedConfig.pages?.length || 0}</span>
                  </div>
                  {parsedConfig.entities?.map((e) => (
                    <div key={e.name} className="pl-4 border-l-2 border-indigo-500/20">
                      <p className="text-sm font-medium text-white/70">{e.name}</p>
                      <p className="text-xs text-white/30">{e.fields?.length || 0} fields defined</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Schema reference */}
            <div className="rounded-2xl border border-white/[0.06] p-5" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Schema Reference</p>
              <div className="space-y-2 text-xs font-mono text-white/30">
                <p>entities[].name <span className="text-white/20">string</span></p>
                <p>entities[].fields[].name <span className="text-white/20">string</span></p>
                <p>entities[].fields[].type <span className="text-indigo-400/60">string|text|number|select|date|boolean|email</span></p>
                <p>pages[].layout <span className="text-violet-400/60">dashboard|crud</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}