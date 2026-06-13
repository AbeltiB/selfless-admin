'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { RequirementType } from 'selfless-sdk';
import { ClipboardList, Plus, Trash2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

interface Requirement {
  id: string;
  serviceId: string;
  name: string;
  type: RequirementType;
  required: boolean;
  order: number;
}

const REQUIREMENT_TYPES = Object.values(RequirementType).map((v) => ({ value: v, label: v.replace('_', ' ') }));

export default function RequirementsPage() {
  const { id: serviceId } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', type: RequirementType.DOCUMENT, required: true, order: 0 });

  const { data: requirements = [], isLoading } = useQuery<Requirement[]>({
    queryKey: ['requirements', serviceId],
    queryFn: async () => {
      const res = await api.get('/requirements', { params: { serviceId } });
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

  const createMutation = useMutation({
    mutationFn: (data: typeof form & { serviceId: string }) => api.post('/requirements', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['requirements', serviceId] });
      toast.success('Requirement added');
      setShowModal(false);
      setForm({ name: '', type: RequirementType.DOCUMENT, required: true, order: 0 });
    },
    onError: () => toast.error('Failed to add requirement'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/requirements/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['requirements', serviceId] });
      toast.success('Requirement removed');
    },
    onError: () => toast.error('Failed to remove requirement'),
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
            <h2 className="text-lg font-semibold text-ct-900">Document Requirements</h2>
            <p className="text-sm text-ct-500 mt-0.5">
              {service?.name ? `${service.name} · ` : ''}Requirements customers must bring
            </p>
          </div>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" />
          Add Requirement
        </Button>
      </div>

      {isLoading ? (
        <PageSpinner />
      ) : requirements.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No requirements yet"
          description="Add document requirements customers need to bring for this service"
          action={
            <Button onClick={() => setShowModal(true)}>
              <Plus className="w-4 h-4" />
              Add Requirement
            </Button>
          }
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-ct-50 border-b border-ct-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-ct-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-ct-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-ct-500 uppercase tracking-wider">Required</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-ct-500 uppercase tracking-wider">Order</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-ct-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ct-100">
              {requirements.map((req) => (
                <tr key={req.id} className="hover:bg-ct-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-ct-900">{req.name}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-medium">
                      {req.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={req.required ? 'danger' : 'muted'}>
                      {req.required ? 'Required' : 'Optional'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-ct-500">{req.order}</td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteMutation.mutate(req.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Requirement">
        <div className="space-y-4">
          <Input
            label="Requirement Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="e.g. National ID, Birth Certificate"
          />
          <Select
            label="Type"
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as RequirementType }))}
            options={REQUIREMENT_TYPES}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Required?"
              value={String(form.required)}
              onChange={(e) => setForm((f) => ({ ...f, required: e.target.value === 'true' }))}
              options={[{ value: 'true', label: 'Required' }, { value: 'false', label: 'Optional' }]}
            />
            <Input
              label="Display Order"
              type="number"
              min={0}
              value={String(form.order)}
              onChange={(e) => setForm((f) => ({ ...f, order: parseInt(e.target.value) || 0 }))}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button
              className="flex-1"
              onClick={() => createMutation.mutate({ ...form, serviceId })}
              disabled={!form.name || createMutation.isPending}
            >
              Add Requirement
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
