import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { extractEntities, extractPages } from '@/lib/configParser';
import { safeParseJSON } from '@/lib/configParser';
import RegistryRenderer from '@/components/registry/ComponentRegistry';
import DynamicForm from '@/components/registry/DynamicForm';
import DynamicTable from '@/components/registry/DynamicTable';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Database } from 'lucide-react';
import { toast } from 'sonner';

export default function AppRuntime({ config, appId }) {
  const queryClient = useQueryClient();
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const entities = useMemo(() => extractEntities(config), [config]);
  const pages = useMemo(() => extractPages(config), [config]);
  const activePage = pages[activePageIndex];
  const entityName = activePage?.entity || activePage?.components?.[0]?.entity;
  const entity = entities.find(e => e.name === entityName);

  const { data: rawRecords = [], isLoading } = useQuery({
    queryKey: ['dynamicRecords', appId, entityName],
    queryFn: () => base44.entities.DynamicRecord.filter({ app_config_id: appId, entity_type: entityName }),
    enabled: !!appId && !!entityName,
  });

  const records = useMemo(() =>
    rawRecords.map(r => ({ ...safeParseJSON(r.data, {}), _record_id: r.id })),
    [rawRecords]
  );

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.DynamicRecord.create({
      entity_type: entityName, app_config_id: appId, data: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dynamicRecords', appId, entityName] });
      setShowForm(false);
      toast.success('Record created');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ recordId, data }) => base44.entities.DynamicRecord.update(recordId, { data: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dynamicRecords', appId, entityName] });
      setShowForm(false);
      setEditingRecord(null);
      toast.success('Record updated');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (recordId) => base44.entities.DynamicRecord.delete(recordId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dynamicRecords', appId, entityName] });
      toast.success('Record deleted');
    },
  });

  const handleEdit = (row) => { setEditingRecord(row); setShowForm(true); };
  const handleDelete = (row) => deleteMutation.mutate(row._record_id);
  const handleCreate = (data) => createMutation.mutate(data);
  const handleUpdate = (data) => {
    const { _record_id, ...cleanData } = data;
    updateMutation.mutate({ recordId: editingRecord._record_id, data: cleanData });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-7 h-7 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  const renderDashboard = (page) => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {(page.components || []).map((comp, i) => (
        <div key={i} className={comp.type === 'table' || comp.type === 'chart' ? 'col-span-2 lg:col-span-2' : ''}>
          <RegistryRenderer config={{ ...comp, fields: entity?.fields }} data={records} />
        </div>
      ))}
    </div>
  );

  const renderCrud = () => (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(79,70,229,0.12)' }}>
            <Database className="h-4 w-4 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">{entityName}</h3>
            <p className="text-xs text-white/30">{records.length} records</p>
          </div>
        </div>
        <Button
          onClick={() => { setEditingRecord(null); setShowForm(true); }}
          className="h-9 px-4 text-sm font-semibold text-white rounded-xl"
          style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
        >
          <Plus className="h-3.5 w-3.5 mr-2" /> Add {entityName}
        </Button>
      </div>
      {entity && (
        <DynamicTable
          config={{ title: `${entityName} Records`, fields: entity.fields }}
          data={records}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page tabs */}
      {pages.length > 1 && (
        <div className="flex items-center gap-1 rounded-xl p-1 border border-white/[0.08] w-fit"
          style={{ background: 'rgba(255,255,255,0.02)' }}>
          {pages.map((p, i) => (
            <button
              key={i}
              onClick={() => setActivePageIndex(i)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activePageIndex === i
                  ? 'text-indigo-300 border border-indigo-500/25'
                  : 'text-white/40 hover:text-white/70'
              }`}
              style={activePageIndex === i ? { background: 'rgba(79,70,229,0.2)' } : {}}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}

      {activePage?.layout === 'dashboard' ? renderDashboard(activePage) : renderCrud()}

      <Dialog open={showForm} onOpenChange={(open) => { setShowForm(open); if (!open) setEditingRecord(null); }}>
        <DialogContent className="max-w-lg border-white/[0.08]" style={{ background: '#09111F' }}>
          <DialogHeader>
            <DialogTitle className="text-white text-base">
              {editingRecord ? `Edit ${entityName}` : `New ${entityName}`}
            </DialogTitle>
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