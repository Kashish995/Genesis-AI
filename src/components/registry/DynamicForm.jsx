import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';
import { CalendarIcon, Save, X } from 'lucide-react';

function FieldInput({ field, value, onChange }) {
  const base = "h-10 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus:border-indigo-500/50 rounded-xl";

  switch (field.type) {
    case 'text':
      return (
        <Textarea value={value || ''} onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || `Enter ${field.label || field.name}...`}
          className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus:border-indigo-500/50 rounded-xl min-h-[80px] resize-none" />
      );
    case 'number':
      return (
        <Input type="number" value={value ?? ''} onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
          placeholder={field.placeholder || '0'} className={base} />
      );
    case 'email':
      return (
        <Input type="email" value={value || ''} onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || 'email@example.com'} className={base} />
      );
    case 'select':
      return (
        <Select value={value || ''} onValueChange={onChange}>
          <SelectTrigger className={base}>
            <SelectValue placeholder={`Select ${field.label || field.name}`} />
          </SelectTrigger>
          <SelectContent className="bg-card border-white/[0.08]">
            {(field.options || []).map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    case 'boolean':
      return (
        <div className="flex items-center gap-3 h-10">
          <Switch checked={!!value} onCheckedChange={onChange} className="data-[state=checked]:bg-indigo-600" />
          <span className="text-sm text-white/50">{value ? 'Yes' : 'No'}</span>
        </div>
      );
    case 'date':
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={`w-full justify-start text-left font-normal ${base}`}>
              <CalendarIcon className="mr-2 h-4 w-4 text-white/30" />
              {value ? <span>{format(new Date(value), 'PPP')}</span> : <span className="text-white/20">Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-card border-white/[0.08]">
            <Calendar mode="single" selected={value ? new Date(value) : undefined}
              onSelect={(date) => onChange(date?.toISOString())} />
          </PopoverContent>
        </Popover>
      );
    default:
      return (
        <Input value={value || ''} onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || `Enter ${field.label || field.name}...`} className={base} />
      );
  }
}

export default function DynamicForm({ config, onSubmit, onCancel, initialData }) {
  const fields = config?.fields || [];
  const [formData, setFormData] = useState(() => {
    const data = { ...(initialData || {}) };
    fields.forEach(f => {
      if (data[f.name] === undefined && f.default !== undefined) data[f.name] = f.default;
    });
    return data;
  });
  const [errors, setErrors] = useState({});

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const errs = {};
    fields.forEach(f => {
      if (f.required && !formData[f.name] && formData[f.name] !== 0) errs[f.name] = `${f.label || f.name} is required`;
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate() && onSubmit) onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {fields.map((field) => (
        <div key={field.name} className="space-y-2">
          <Label className="text-xs font-semibold text-white/40 uppercase tracking-wider">
            {field.label || field.name}
            {field.required && <span className="text-red-400 ml-1">*</span>}
          </Label>
          <FieldInput field={field} value={formData[field.name]} onChange={(val) => handleChange(field.name, val)} />
          {errors[field.name] && (
            <p className="text-xs text-red-400">{errors[field.name]}</p>
          )}
        </div>
      ))}
      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}
            className="h-9 px-4 text-sm rounded-xl border border-white/[0.08] text-white/50 hover:text-white">
            <X className="h-3.5 w-3.5 mr-2" /> Cancel
          </Button>
        )}
        <Button type="submit" className="h-9 px-5 text-sm font-semibold text-white rounded-xl"
          style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}>
          <Save className="h-3.5 w-3.5 mr-2" /> {config?.mode === 'edit' ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
}