import { useState, useMemo } from 'react';
import { extractEntities, extractPages } from '@/lib/configParser';
import RegistryRenderer from '@/components/registry/ComponentRegistry';
import DynamicForm from '@/components/registry/DynamicForm';
import DynamicTable from '@/components/registry/DynamicTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, AlertCircle, Eye } from 'lucide-react';
import { toast } from 'sonner';

export default function AppPreview({ config }) {
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [records, setRecords] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const entities = useMemo(() => extractEntities(config), [config]);
  const pages = useMemo(() => extractPages(config), [config]);

  if (!config) {
    return (
      <div className="rounded-2xl border border-dashed border-white/[0.08] p-12 text-center"
        style={{ background: 'rgba(255,255,255,0.01)' }}>
        <AlertCircle className="h-10 w-10 text-white/15 mx-auto mb-3" />
        <p className="text-white/35 text-sm">Enter a valid JSON configuration to see a preview</p>
      </div>
    );
  }

  const activePage = pages[activePageIndex];
  const entityName = activePage?.entity || activePage?.components?.[0]?.entity;
  const entity = entities.find(e => e.name === entityName);
  const entityRecords = records[entityName] || [];

  const handleCreate = (data) => {
    const id = Date.now().toString();
    setRecords(prev => ({ ...prev, [entityName]: [...(prev[entityName] || []), { ...data, id }] }));
    setShowForm(false);
    toast.success('Record created (preview)');
  };

  const handleEdit = (row) => { setEditingRecord(row); setShowForm(true); };

  const handleUpdate = (data) => {
    setRecords(prev => ({
      ...prev,
      [entityName]: (prev[entityName] || []).map(r => r.id === editingRecord.id ? { ...r, ...data } : r),
    }));
    setShowForm(false);
    setEditingRecord(null);
  };

  const handleDelete = (row) => {
    setRecords(prev => ({ ...prev, [entityName]: (prev[entityName] || []).filter(r => r.id !== row.id) }));
  };

  const renderDashboard = (page) => (
    <div className="grid grid-cols-2 gap-4">
      {(page.components || []).map((comp, i) => (
        <div key={i} className={comp.type === 'table' || comp.type === 'chart' ? 'col-span-2' : ''}>
          <RegistryRenderer config={{ ...comp, fields: entity?.fields }} data={entityRecords} />
        </div>
      ))}
    </div>
  );

  return (
    <div className="rounded-2xl border border-white/[0.06] overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]"
        style={{ background: 'rgba(255,255,255,0.01)' }}>
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-indigo-400" />
          <p className="text-sm font-semibold text-white/70">Live Preview</p>
        </div>
        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full text-violet-400 bg-violet-400/10 border border-violet-400/20">
          Sandbox
        </span>
      </div>

      <div className="p-5">
        {pages.length > 1 && (
          <div className="flex items-center gap-1 rounded-xl p-1 border border-white/[0.08] w-fit mb-5"
            style={{ background: 'rgba(255,255,255,0.02)' }}>
            {pages.map((p, i) => (
              <button key={i} onClick={() => setActivePageIndex(i)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  activePageIndex === i ? 'text-indigo-300 border border-indigo-500/25' : 'text-white/40 hover:text-white/70'
                }`}
                style={activePageIndex === i ? { background: 'rgba(79,70,229,0.2)' } : {}}>
                {p.name}
              </button>
            ))}
          </div>
        )}

        {activePage?.layout === 'dashboard' ? renderDashboard(activePage) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white/70">{entityName}</p>
              <Button onClick={() => { setEditingRecord(null); setShowForm(true); }}
                className="h-8 px-3 text-xs font-semibold text-white rounded-lg"
                style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}>
                <Plus className="h-3 w-3 mr-1.5" /> Add
              </Button>
            </div>
            {entity && (
              <DynamicTable
                config={{ fields: entity.fields }}
                data={entityRecords}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </div>
        )}
      </div>

      <Dialog open={showForm} onOpenChange={(open) => { setShowForm(open); if (!open) setEditingRecord(null); }}>
        <DialogContent className="max-w-lg border-white/[0.08]" style={{ background: '#09111F' }}>
          <DialogHeader>
            <DialogTitle className="text-white">{editingRecord ? `Edit ${entityName}` : `New ${entityName}`}</DialogTitle>
          </DialogHeader>
          {entity && (
            <DynamicForm
              config={{ fields: entity.fields, mode: editingRecord ? 'edit' : 'create' }}
              initialData={editingRecord}
              onSubmit={editingRecord ? handleUpdate : handleCreate}
              onCancel={() => { setShowForm(false); setEditingRecord(null); }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}