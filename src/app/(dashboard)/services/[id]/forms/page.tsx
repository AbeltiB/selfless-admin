'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { FieldType } from 'selfless-sdk';
import { FileText, Plus, Trash2, ArrowLeft, ChevronDown, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface FormField {
  id: string;
  label: string;
  fieldKey: string;
  fieldType: FieldType;
  required: boolean;
  order: number;
  options?: { label: string; value: string }[];
}

interface Form {
  id: string;
  serviceId: string;
  name: string;
  isActive: boolean;
  fields: FormField[];
}

const FIELD_TYPES = Object.values(FieldType).map((v) => ({ value: v, label: v.replace('_', ' ') }));

const defaultField = { label: '', fieldKey: '', fieldType: FieldType.TEXT, required: false, order: 0 };

export default function FormsPage() {
  const { id: serviceId } = useParams<{ id: string }>();
  const qc = useQueryClient();

  const [showFormModal, setShowFormModal] = useState(false);
  const [newFormName, setNewFormName] = useState('');
  const [expandedFormId, setExpandedFormId] = useState<string | null>(null);
  const [showFieldModal, setShowFieldModal] = useState<string | null>(null);
  const [fieldForm, setFieldForm] = useState({ ...defaultField });

  const { data: forms = [], isLoading } = useQuery<Form[]>({
    queryKey: ['forms', serviceId],
    queryFn: async () => {
      const res = await api.get('/forms', { params: { serviceId } });
      return res.data.data ?? res.data;
    },
    enabled: !!serviceId,
  });

  const { data: service } = useQuery({
    queryKey: ['service', serviceId],
    queryFn: async () => {
      const res = await api.get(`/services/${serviceId}`);
      return res.data.data ?? res.data;
    },
    enabled: !!serviceId,
  });

  const createForm = useMutation({
    mutationFn: (data: { serviceId: string; name: string }) => api.post('/forms', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['forms', serviceId] });
      toast.success('Form created');
      setShowFormModal(false);
      setNewFormName('');
    },
    onError: () => toast.error('Failed to create form'),
  });

  const addField = useMutation({
    mutationFn: ({ formId, data }: { formId: string; data: typeof fieldForm }) =>
      api.post(`/forms/${formId}/fields`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['forms', serviceId] });
      toast.success('Field added');
      setShowFieldModal(null);
      setFieldForm({ ...defaultField });
    },
    onError: () => toast.error('Failed to add field'),
  });

  const deleteField = useMutation({
    mutationFn: (fieldId: string) => api.delete(`/forms/fields/${fieldId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['forms', serviceId] });
      toast.success('Field removed');
    },
    onError: () => toast.error('Failed to remove field'),
  });

  const toggleForm = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.patch(`/forms/${id}`, { isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['forms', serviceId] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/services">
            <Button size="sm" variant="ghost">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-lg font-semibold text-ct-900">Dynamic Forms</h2>
            <p className="text-sm text-ct-500 mt-0.5">
              {service?.name ? `${service.name} · ` : ''}Form fields collected at ticket issue
            </p>
          </div>
        </div>
        <Button onClick={() => setShowFormModal(true)}>
          <Plus className="w-4 h-4" />
          New Form
        </Button>
      </div>

      {isLoading ? (
        <PageSpinner />
      ) : forms.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No forms yet"
          description="Create a form to collect information from customers at ticket issue time"
          action={
            <Button onClick={() => setShowFormModal(true)}>
              <Plus className="w-4 h-4" />
              New Form
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {forms.map((form) => (
            <Card key={form.id} className="p-0 overflow-hidden">
              {/* Form header */}
              <div
                className="flex items-center justify-between px-5 py-3 cursor-pointer hover:bg-ct-50 transition-colors"
                onClick={() => setExpandedFormId(expandedFormId === form.id ? null : form.id)}
              >
                <div className="flex items-center gap-3">
                  {expandedFormId === form.id ? (
                    <ChevronDown className="w-4 h-4 text-ct-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-ct-400" />
                  )}
                  <span className="font-medium text-ct-900 text-sm">{form.name}</span>
                  <Badge variant={form.isActive ? 'success' : 'muted'}>
                    {form.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <span className="text-xs text-ct-400">{form.fields.length} field{form.fields.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleForm.mutate({ id: form.id, isActive: !form.isActive })}
                  >
                    {form.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => setShowFieldModal(form.id)}>
                    <Plus className="w-3.5 h-3.5" />
                    Add Field
                  </Button>
                </div>
              </div>

              {/* Fields list */}
              {expandedFormId === form.id && (
                <div className="border-t border-ct-100">
                  {form.fields.length === 0 ? (
                    <p className="px-6 py-4 text-sm text-ct-400">No fields yet — add one above</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-ct-50">
                          <th className="px-6 py-2 text-left text-xs font-medium text-ct-400 uppercase tracking-wider">Label</th>
                          <th className="px-6 py-2 text-left text-xs font-medium text-ct-400 uppercase tracking-wider">Key</th>
                          <th className="px-6 py-2 text-left text-xs font-medium text-ct-400 uppercase tracking-wider">Type</th>
                          <th className="px-6 py-2 text-left text-xs font-medium text-ct-400 uppercase tracking-wider">Required</th>
                          <th className="px-6 py-2 text-right text-xs font-medium text-ct-400 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ct-100">
                        {form.fields.map((field) => (
                          <tr key={field.id} className="hover:bg-ct-50 transition-colors">
                            <td className="px-6 py-3 font-medium text-ct-900">{field.label}</td>
                            <td className="px-6 py-3 font-mono text-ct-600 text-xs">{field.fieldKey}</td>
                            <td className="px-6 py-3">
                              <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-medium">
                                {field.fieldType}
                              </span>
                            </td>
                            <td className="px-6 py-3">
                              <Badge variant={field.required ? 'danger' : 'muted'}>
                                {field.required ? 'Required' : 'Optional'}
                              </Badge>
                            </td>
                            <td className="px-6 py-3 text-right">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteField.mutate(field.id)}
                              >
                                <Trash2 className="w-4 h-4 text-red-400" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Create form modal */}
      <Modal open={showFormModal} onClose={() => setShowFormModal(false)} title="Create Form" size="sm">
        <div className="space-y-4">
          <Input
            label="Form Name"
            value={newFormName}
            onChange={(e) => setNewFormName(e.target.value)}
            placeholder="e.g. Customer Info, Application Form"
          />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowFormModal(false)}>Cancel</Button>
            <Button
              className="flex-1"
              onClick={() => createForm.mutate({ serviceId, name: newFormName })}
              disabled={!newFormName || createForm.isPending}
            >
              Create Form
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add field modal */}
      <Modal open={!!showFieldModal} onClose={() => setShowFieldModal(null)} title="Add Field" size="sm">
        <div className="space-y-4">
          <Input
            label="Field Label"
            value={fieldForm.label}
            onChange={(e) => setFieldForm((f) => ({ ...f, label: e.target.value }))}
            placeholder="e.g. Full Name, Date of Birth"
          />
          <Input
            label="Field Key"
            value={fieldForm.fieldKey}
            onChange={(e) => setFieldForm((f) => ({ ...f, fieldKey: e.target.value.toLowerCase().replace(/\s+/g, '_') }))}
            placeholder="e.g. full_name, date_of_birth"
          />
          <Select
            label="Field Type"
            value={fieldForm.fieldType}
            onChange={(e) => setFieldForm((f) => ({ ...f, fieldType: e.target.value as FieldType }))}
            options={FIELD_TYPES}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Required?"
              value={String(fieldForm.required)}
              onChange={(e) => setFieldForm((f) => ({ ...f, required: e.target.value === 'true' }))}
              options={[{ value: 'false', label: 'Optional' }, { value: 'true', label: 'Required' }]}
            />
            <Input
              label="Display Order"
              type="number"
              min={0}
              value={String(fieldForm.order)}
              onChange={(e) => setFieldForm((f) => ({ ...f, order: parseInt(e.target.value) || 0 }))}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowFieldModal(null)}>Cancel</Button>
            <Button
              className="flex-1"
              onClick={() => showFieldModal && addField.mutate({ formId: showFieldModal, data: fieldForm })}
              disabled={!fieldForm.label || !fieldForm.fieldKey || addField.isPending}
            >
              Add Field
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
