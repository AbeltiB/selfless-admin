'use client';
import { useState } from 'react';
import { useBranches, useCreateBranch, useUpdateBranch } from '@/hooks/useBranches';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate } from '@/lib/utils';
import type { Branch } from 'selfless-sdk';
import { BranchStatus } from 'selfless-sdk';
import { Building2, Plus, Edit2, ToggleLeft, ToggleRight } from 'lucide-react';

interface BranchForm {
  name: string;
  code: string;
  address: string;
  timezone: string;
}

const defaultForm: BranchForm = {
  name: '',
  code: '',
  address: '',
  timezone: 'UTC',
};

export default function BranchesPage() {
  const { data: branches = [], isLoading } = useBranches();
  const createBranch = useCreateBranch();
  const updateBranch = useUpdateBranch();

  const [showModal, setShowModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [form, setForm] = useState<BranchForm>(defaultForm);

  const openCreate = () => {
    setEditingBranch(null);
    setForm(defaultForm);
    setShowModal(true);
  };

  const openEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setForm({
      name: branch.name,
      code: branch.code,
      address: branch.address ?? '',
      timezone: branch.timezone,
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (editingBranch) {
      await updateBranch.mutateAsync({ id: editingBranch.id, ...form });
    } else {
      await createBranch.mutateAsync(form);
    }
    setShowModal(false);
  };

  const handleToggle = (branch: Branch) => {
    const newStatus = branch.status === BranchStatus.ACTIVE ? BranchStatus.INACTIVE : BranchStatus.ACTIVE;
    updateBranch.mutate({ id: branch.id, status: newStatus });
  };

  if (isLoading) return <PageSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Branches</h2>
          <p className="text-sm text-slate-500 mt-0.5">Manage your service locations</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4" />
          Create Branch
        </Button>
      </div>

      {branches.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No branches yet"
          description="Create your first branch to get started"
          action={
            <Button onClick={openCreate}>
              <Plus className="w-4 h-4" />
              Create Branch
            </Button>
          }
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Branch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Timezone
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
              {branches.map((branch) => (
                <tr key={branch.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">{branch.name}</td>
                  <td className="px-6 py-4 font-mono text-slate-600">{branch.code}</td>
                  <td className="px-6 py-4 text-slate-500 max-w-xs truncate">
                    {branch.address ?? '—'}
                  </td>
                  <td className="px-6 py-4 text-slate-500">{branch.timezone}</td>
                  <td className="px-6 py-4">
                    <Badge variant={branch.status === BranchStatus.ACTIVE ? 'success' : 'muted'}>
                      {branch.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{formatDate(branch.createdAt)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(branch)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggle(branch)}
                        title={branch.status === BranchStatus.ACTIVE ? 'Deactivate' : 'Activate'}
                      >
                        {branch.status === BranchStatus.ACTIVE ? (
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
        title={editingBranch ? 'Edit Branch' : 'Create Branch'}
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="Branch Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Main Branch"
            required
          />
          <Input
            label="Branch Code"
            value={form.code}
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
            placeholder="MB001"
            required
          />
          <Input
            label="Address"
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            placeholder="123 Main Street, City"
          />
          <Input
            label="Timezone"
            value={form.timezone}
            onChange={(e) => setForm((f) => ({ ...f, timezone: e.target.value }))}
            placeholder="UTC"
          />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              loading={createBranch.isPending || updateBranch.isPending}
              onClick={handleSubmit}
              disabled={!form.name || !form.code}
            >
              {editingBranch ? 'Save Changes' : 'Create Branch'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
