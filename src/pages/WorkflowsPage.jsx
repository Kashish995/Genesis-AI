import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Plus, Workflow, Zap, Trash2, Activity, GitBranch,
  CheckCircle2, XCircle, Clock, ArrowRight, Play, Pause
} from 'lucide-react';
import { useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { SkeletonRow } from '@/components/ui/SkeletonCard';

export default function WorkflowsPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', trigger_entity: '', trigger_event: 'create', actions: '[{"type":"notification","message":""}]', conditions: '{}', enabled: true });

  const { data: workflows = [], isLoading } = useQuery({
    queryKey: ['workflows'],
    queryFn: () => base44.entities.Workflow.list('-created_date', 100),
  });

  const { data: logs = [] } = useQuery({
    queryKey: ['workflowLogs'],
    queryFn: () => base44.entities.WorkflowLog.list('-created_date', 20),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Workflow.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      setShowCreate(false);
      setForm({ name: '', trigger_entity: '', trigger_event: 'create', actions: '[{"type":"notification","message":""}]', conditions: '{}', enabled: true });
      toast.success('Workflow created successfully');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Workflow.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['workflows'] }); toast.success('Workflow deleted'); },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, enabled }) => base44.entities.Workflow.update(id, { enabled: !enabled }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workflows'] }),
  });

  const enabledCount = workflows.filter(w => w.enabled).length;
  const successRate = logs.length > 0
    ? Math.round((logs.filter(l => l.status === 'success').length / logs.length) * 100)
    : 0;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-white/[0.06]" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-2">Automation</p>
              <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">Workflows</h1>
              <p className="text-white/40 mt-1.5 text-sm">Event-driven automation for your data</p>
            </div>
            <Button
              onClick={() => setShowCreate(true)}
              className="h-10 px-5 text-sm font-semibold text-white rounded-xl transition-all duration-200 hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', boxShadow: '0 0 20px rgba(79,70,229,0.3)' }}
            >
              <Plus className="h-4 w-4 mr-2" /> New Workflow
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8 space-y-8">
        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Workflows', value: workflows.length, icon: GitBranch, color: 'rgba(79,70,229,0.12)', iconColor: '#818cf8' },
            { label: 'Active', value: enabledCount, icon: Zap, color: 'rgba(16,185,129,0.12)', iconColor: '#34d399' },
            { label: 'Executions', value: logs.length, icon: Activity, color: 'rgba(6,182,212,0.12)', iconColor: '#22d3ee' },
            { label: 'Success Rate', value: `${successRate}%`, icon: CheckCircle2, color: 'rgba(245,158,11,0.12)', iconColor: '#fbbf24' },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/[0.06] p-5" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="flex items-start justify-between mb-3">
                <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ background: s.color }}>
                  <s.icon className="h-4 w-4" style={{ color: s.iconColor }} />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-white/35 mt-1 font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Workflows */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-base font-semibold text-white">All Workflows</h2>
            {isLoading ? (
              <div className="rounded-2xl border border-white/[0.06] overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
                {[1,2,3].map(i => <SkeletonRow key={i} />)}
              </div>
            ) : workflows.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/[0.08] p-14 text-center"
                style={{ background: 'rgba(255,255,255,0.01)' }}>
                <div className="h-14 w-14 rounded-2xl mx-auto mb-5 flex items-center justify-center"
                  style={{ background: 'rgba(79,70,229,0.08)', border: '1px solid rgba(79,70,229,0.15)' }}>
                  <GitBranch className="h-6 w-6 text-indigo-400/50" />
                </div>
                <h3 className="font-semibold text-white mb-2">No workflows yet</h3>
                <p className="text-sm text-white/35 mb-6 max-w-xs mx-auto">
                  Create automation rules that trigger actions on CRUD events
                </p>
                <Button onClick={() => setShowCreate(true)} className="h-9 px-4 text-sm rounded-xl"
                  style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}>
                  <Plus className="h-3.5 w-3.5 mr-2" /> Create Workflow
                </Button>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/[0.06] overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
                {workflows.map((wf, i) => (
                  <div key={wf.id} className={`group flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors ${i < workflows.length - 1 ? 'border-b border-white/[0.04]' : ''}`}>
                    <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: wf.enabled ? 'rgba(79,70,229,0.15)' : 'rgba(255,255,255,0.04)' }}>
                      <Zap className="h-4 w-4" style={{ color: wf.enabled ? '#818cf8' : 'rgba(255,255,255,0.2)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors">{wf.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-white/30">On</span>
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-md text-violet-400 border border-violet-500/20"
                          style={{ background: 'rgba(124,58,237,0.1)' }}>
                          {wf.trigger_event}
                        </span>
                        <span className="text-xs text-white/30">in</span>
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-md text-indigo-400 border border-indigo-500/20"
                          style={{ background: 'rgba(79,70,229,0.1)' }}>
                          {wf.trigger_entity}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={wf.enabled}
                        onCheckedChange={() => toggleMutation.mutate({ id: wf.id, enabled: wf.enabled })}
                        className="data-[state=checked]:bg-indigo-600"
                      />
                      <button
                        onClick={() => deleteMutation.mutate(wf.id)}
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Execution Log */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">Execution Log</h2>
              {logs.length > 0 && (
                <span className="text-xs text-white/30">{logs.length} total</span>
              )}
            </div>
            <div className="rounded-2xl border border-white/[0.06] overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
              {logs.length === 0 ? (
                <div className="p-8 text-center">
                  <Activity className="h-8 w-8 text-white/10 mx-auto mb-3" />
                  <p className="text-sm text-white/30">No executions recorded yet</p>
                </div>
              ) : (
                <div className="divide-y divide-white/[0.04]">
                  {logs.slice(0, 10).map((log) => (
                    <div key={log.id} className="px-4 py-3.5 flex items-center gap-3 hover:bg-white/[0.02] transition-colors">
                      <div className={`shrink-0 h-7 w-7 rounded-lg flex items-center justify-center ${
                        log.status === 'success' ? 'bg-emerald-400/10' :
                        log.status === 'failed' ? 'bg-red-400/10' : 'bg-amber-400/10'
                      }`}>
                        {log.status === 'success'
                          ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                          : log.status === 'failed'
                          ? <XCircle className="h-3.5 w-3.5 text-red-400" />
                          : <Clock className="h-3.5 w-3.5 text-amber-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white/70 truncate font-medium">{log.workflow_name}</p>
                        <p className="text-xs text-white/25 mt-0.5">
                          {log.created_date ? formatDistanceToNow(new Date(log.created_date), { addSuffix: true }) : ''}
                          {log.duration_ms ? ` · ${log.duration_ms}ms` : ''}
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

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md border-white/[0.08]" style={{ background: '#09111F' }}>
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}>
                <Zap className="h-3.5 w-3.5 text-white" />
              </div>
              New Workflow
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Workflow Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Notify on new record"
                className="h-10 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Entity</Label>
                <Input
                  value={form.trigger_entity}
                  onChange={(e) => setForm(f => ({ ...f, trigger_entity: e.target.value }))}
                  placeholder="e.g. Task"
                  className="h-10 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Event</Label>
                <Select value={form.trigger_event} onValueChange={(v) => setForm(f => ({ ...f, trigger_event: v }))}>
                  <SelectTrigger className="h-10 bg-white/[0.04] border-white/[0.08] text-white rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-white/[0.08]">
                    <SelectItem value="create">Create</SelectItem>
                    <SelectItem value="update">Update</SelectItem>
                    <SelectItem value="delete">Delete</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Actions (JSON)</Label>
              <Textarea
                value={form.actions}
                onChange={(e) => setForm(f => ({ ...f, actions: e.target.value }))}
                className="font-mono text-xs min-h-[90px] bg-white/[0.04] border-white/[0.08] text-indigo-300 rounded-xl"
                placeholder='[{"type": "notification", "message": "New record created"}]'
              />
            </div>
            <Button
              className="w-full h-10 text-sm font-semibold text-white rounded-xl"
              style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
              onClick={() => createMutation.mutate(form)}
              disabled={!form.name || !form.trigger_entity || createMutation.isPending}
            >
              {createMutation.isPending ? 'Creating...' : 'Create Workflow'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}