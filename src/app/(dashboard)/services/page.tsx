'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useBranches } from '@/hooks/useBranches';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate } from '@/lib/utils';
import type { Service } from 'selfless-sdk';
import { ListTodo, Plus, Edit2, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface ServiceForm {
  name: string;
  code: string;
  prefix: string;
  estimatedDuration: string;
  description: string;
  branchId: string;
}

const defaultForm: ServiceForm = {
  name: '',
  code: '',
  prefix: '',
  estimatedDuration: '10',
  description: '',
  branchId: '',
};

export default function ServicesPage() {
  const qc = useQueryClient();
  const { data: branches = [] } = useBranches();
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [form, setForm] = useState<ServiceForm>(defaultForm);

  const { data: services = [], isLoading } = useQuery<Service[]>({
    queryKey: ['services', selectedBranchId],
    queryFn: async () => {
      const params = selectedBranchId ? { branchId: selectedBranchId } : {};
      const res = await api.get('/services', { params });
      return res.data.data ?? res.data;
    },
  });

  const createService = useMutation({
    mutationFn: (data: Partial<Service> & { estimatedDuration: number }) =>
      api.post('/services', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['services'] });
      toast.success('Service created');
      setShowModal(false);
    },
    onError: () => toast.error('Failed to create service'),
  });

  const updateService = useMutation({
    mutationFn: ({ id, ...data }: Partial<Service> & { id: string }) =>
      api.patch(`/services/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['services'] });
      toast.success('Service updated');
      setShowModal(false);
    },
    onError: () => toast.error('Failed to update service'),
  });

  const openCreate = () => {
    setEditingService(null);
    setForm({ ...defaultForm, branchId: selectedBranchId });
    setShowModal(true);
  };

  const openEdit = (service: Service) => {
    setEditingService(service);
    setForm({
      name: service.name,
      code: service.code,
      prefix: service.prefix,
      estimatedDuration: String(service.estimatedDuration),
      description: service.description ?? '',
      branchId: service.branchId,
    });
    setShowModal(true);
  };

  const handleSubmit = () => {
    const payload = {
      ...form,
      estimatedDuration: parseInt(form.estimatedDuration, 10),
    };
    if (editingService) {
      updateService.mutate({ id: editingService.id, ...payload });
    } else {
      createService.mutate(payload);
    }
  };

  const handleToggle = (service: Service) => {
    updateService.mutate({ id: service.id, isActive: !service.isActive });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Services</h2>
          <p className="text-sm text-slate-500 mt-0.5">Manage service offerings per branch</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-52">
            <Select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              placeholder="All branches"
              options={branches.map((b) => ({ value: b.id, label: b.name }))}
            />
          </div>
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4" />
            Add Service
          </Button>
        </div>
      </div>

      {isLoading ? (
        <PageSpinner />
      ) : services.length === 0 ? (
        <EmptyState
          icon={ListTodo}
          title="No services found"
          description="Add a service to start setting up queues"
          action={
            <Button onClick={openCreate}>
              <Plus className="w-4 h-4" />
              Add Service
            </Button>
          }
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Prefix
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {services.map((service) => (
                <tr key={service.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-slate-800">{service.name}</p>
                      {service.description && (
                        <p className="text-xs text-slate-500 mt-0.5 truncate max-w-xs">
                          {service.description}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-600">{service.code}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-mono font-semibold">
                      {service.prefix}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{service.estimatedDuration} min</td>
                  <td className="px-6 py-4">
                    <Badge variant={service.isActive ? 'success' : 'muted'}>
                      {service.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{formatDate(service.createdAt)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(service)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggle(service)}
                        title={service.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {service.isActive ? (
                          <ToggleRight className="w-4 h-4 text-green-600" />
                        ) : (
                          <ToggleLeft className="w-4 h-4 text-slate-400" />
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingService ? 'Edit Service' : 'Add Service'}
      >
        <div className="space-y-4">
          {!editingService && (
            <Select
              label="Branch"
              value={form.branchId}
              onChange={(e) => setForm((f) => ({ ...f, branchId: e.target.value }))}
              placeholder="Select branch"
              options={branches.map((b) => ({ value: b.id, label: b.name }))}
            />
          )}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Service Name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Customer Service"
              required
            />
            <Input
              label="Service Code"
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
              placeholder="CS001"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Ticket Prefix"
              value={form.prefix}
              onChange={(e) => setForm((f) => ({ ...f, prefix: e.target.value.toUpperCase() }))}
              placeholder="CS"
              maxLength={5}
              required
            />
            <Input
              label="Est. Duration (min)"
              type="number"
              min={1}
              value={form.estimatedDuration}
              onChange={(e) => setForm((f) => ({ ...f, estimatedDuration: e.target.value }))}
              required
            />
          </div>
          <Input
            label="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Optional description"
          />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              loading={createService.isPending || updateService.isPending}
              onClick={handleSubmit}
              disabled={!form.name || !form.code || !form.prefix}
            >
              {editingService ? 'Save Changes' : 'Add Service'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
