'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { UserRole } from 'selfless-sdk';
import type { Organization } from 'selfless-sdk';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate } from '@/lib/utils';
import { Building, Plus, Edit2, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface OrgForm {
  name: string;
  code: string;
  logo: string;
}

const defaultForm: OrgForm = { name: '', code: '', logo: '' };

export default function OrganizationsPage() {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Organization | null>(null);
  const [form, setForm] = useState<OrgForm>(defaultForm);

  const { data: orgs = [], isLoading } = useQuery<Organization[]>({
    queryKey: ['organizations'],
    queryFn: async () => {
      const res = await api.get('/organizations');
      return res.data.data ?? res.data;
    },
  });

  const create = useMutation({
    mutationFn: (data: OrgForm) => api.post('/organizations', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['organizations'] }); toast.success('Organization created'); setShowModal(false); },
    onError: () => toast.error('Failed to create organization'),
  });

  const update = useMutation({
    mutationFn: ({ id, ...data }: Partial<OrgForm> & { id: string }) => api.patch(`/organizations/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['organizations'] }); toast.success('Organization updated'); setShowModal(false); },
    onError: () => toast.error('Failed to update organization'),
  });

  const openCreate = () => { setEditing(null); setForm(defaultForm); setShowModal(true); };
  const openEdit = (org: Organization) => {
    setEditing(org);
    setForm({ name: org.name, code: org.code, logo: (org as any).logo ?? '' });
    setShowModal(true);
  };

  const handleToggle = (org: Organization) => {
    const newStatus = (org as any).status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    update.mutate({ id: org.id, status: newStatus } as any);
  };

  const handleSubmit = () => {
    const payload = { ...form, code: form.code.toUpperCase() };
    editing ? update.mutate({ id: editing.id, ...payload }) : create.mutate(payload);
  };

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500">Only Super Admins can manage organizations.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Organizations</h2>
          <p className="text-sm text-slate-500 mt-0.5">Manage tenant organizations</p>
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4" /> New Organization</Button>
      </div>

      {isLoading ? <PageSpinner /> : orgs.length === 0 ? (
        <EmptyState icon={Building} title="No organizations" description="Create your first organization to get started"
          action={<Button onClick={openCreate}><Plus className="w-4 h-4" /> New Organization</Button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orgs.map((org) => {
            const active = (org as any).status === 'ACTIVE';
            return (
              <Card key={org.id} className="p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
                      {org.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">{org.name}</h3>
                      <p className="text-xs text-slate-500 font-mono">{org.code}</p>
                    </div>
                  </div>
                  <Badge variant={active ? 'success' : 'muted'}>{active ? 'Active' : 'Inactive'}</Badge>
                </div>
                <p className="text-xs text-slate-400 mb-4">Created {formatDate(org.createdAt)}</p>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="secondary" onClick={() => openEdit(org)} className="flex-1">
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleToggle(org)} title={active ? 'Deactivate' : 'Activate'}>
                    {active ? <ToggleRight className="w-4 h-4 text-green-600" /> : <ToggleLeft className="w-4 h-4 text-slate-400" />}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Organization' : 'New Organization'}>
        <div className="space-y-4">
          <Input label="Organization Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Acme Corp" required />
          <Input label="Code" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="ACME" maxLength={10} required />
          <Input label="Logo URL (optional)" value={form.logo} onChange={(e) => setForm((f) => ({ ...f, logo: e.target.value }))} placeholder="https://..." />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button className="flex-1" loading={create.isPending || update.isPending} onClick={handleSubmit} disabled={!form.name || !form.code}>
              {editing ? 'Save Changes' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
