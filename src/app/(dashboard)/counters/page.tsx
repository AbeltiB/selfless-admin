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
import { Monitor, Plus, Edit2, ToggleLeft, ToggleRight, ChevronDown, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface CounterGroup {
  id: string;
  branchId: string;
  name: string;
  description?: string;
  createdAt: Date;
  counters?: Counter[];
}

interface Counter {
  id: string;
  groupId: string;
  branchId: string;
  name: string;
  code: string;
  isActive: boolean;
  createdAt: Date;
}

export default function CountersPage() {
  const qc = useQueryClient();
  const { data: branches = [] } = useBranches();
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<CounterGroup | null>(null);
  const [editingCounter, setEditingCounter] = useState<Counter | null>(null);
  const [targetGroupId, setTargetGroupId] = useState('');
  const [groupForm, setGroupForm] = useState({ name: '', description: '', branchId: '' });
  const [counterForm, setCounterForm] = useState({ name: '', code: '', branchId: '' });

  const { data: groups = [], isLoading } = useQuery<CounterGroup[]>({
    queryKey: ['counter-groups', selectedBranchId],
    queryFn: async () => {
      const params = selectedBranchId ? { branchId: selectedBranchId } : {};
      const res = await api.get('/counters/groups', { params });
      return res.data.data ?? res.data;
    },
  });

  const createGroup = useMutation({
    mutationFn: (d: typeof groupForm) => api.post('/counters/groups', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['counter-groups'] }); toast.success('Group created'); setShowGroupModal(false); },
    onError: () => toast.error('Failed to create group'),
  });
  const updateGroup = useMutation({
    mutationFn: ({ id, ...d }: Partial<typeof groupForm> & { id: string }) => api.patch(`/counters/groups/${id}`, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['counter-groups'] }); toast.success('Group updated'); setShowGroupModal(false); },
    onError: () => toast.error('Failed to update group'),
  });
  const createCounter = useMutation({
    mutationFn: (d: typeof counterForm & { groupId: string }) => api.post('/counters', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['counter-groups'] }); toast.success('Counter created'); setShowCounterModal(false); },
    onError: () => toast.error('Failed to create counter'),
  });
  const updateCounter = useMutation({
    mutationFn: ({ id, ...d }: Partial<typeof counterForm> & { id: string; isActive?: boolean }) => api.patch(`/counters/${id}`, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['counter-groups'] }); toast.success('Counter updated'); setShowCounterModal(false); },
    onError: () => toast.error('Failed to update counter'),
  });

  const toggleGroup = (id: string) => setExpandedGroups((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const openCreateGroup = () => { setEditingGroup(null); setGroupForm({ name: '', description: '', branchId: selectedBranchId }); setShowGroupModal(true); };
  const openEditGroup = (g: CounterGroup) => { setEditingGroup(g); setGroupForm({ name: g.name, description: g.description ?? '', branchId: g.branchId }); setShowGroupModal(true); };
  const openCreateCounter = (groupId: string, branchId: string) => {
    setEditingCounter(null); setTargetGroupId(groupId);
    setCounterForm({ name: '', code: '', branchId });
    setShowCounterModal(true);
  };
  const openEditCounter = (c: Counter) => {
    setEditingCounter(c); setTargetGroupId(c.groupId);
    setCounterForm({ name: c.name, code: c.code, branchId: c.branchId });
    setShowCounterModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Counters</h2>
          <p className="text-sm text-slate-500 mt-0.5">Manage counter groups and individual service counters</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-52">
            <Select value={selectedBranchId} onChange={(e) => setSelectedBranchId(e.target.value)} placeholder="All branches"
              options={branches.map((b) => ({ value: b.id, label: b.name }))} />
          </div>
          <Button onClick={openCreateGroup}><Plus className="w-4 h-4" /> Add Group</Button>
        </div>
      </div>

      {isLoading ? <PageSpinner /> : groups.length === 0 ? (
        <EmptyState icon={Monitor} title="No counter groups" description="Create a group to organise your service counters"
          action={<Button onClick={openCreateGroup}><Plus className="w-4 h-4" /> Add Group</Button>} />
      ) : (
        <div className="space-y-3">
          {groups.map((group) => {
            const counters = group.counters ?? [];
            const expanded = expandedGroups.has(group.id);
            return (
              <Card key={group.id} className="p-0 overflow-hidden">
                <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => toggleGroup(group.id)}>
                  {expanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">{group.name}</p>
                    {group.description && <p className="text-xs text-slate-500">{group.description}</p>}
                  </div>
                  <span className="text-xs text-slate-400">{counters.length} counter{counters.length !== 1 ? 's' : ''}</span>
                  <div className="flex items-center gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
                    <Button size="sm" variant="ghost" onClick={() => openEditGroup(group)}><Edit2 className="w-3.5 h-3.5" /></Button>
                    <Button size="sm" onClick={() => openCreateCounter(group.id, group.branchId)}><Plus className="w-3.5 h-3.5" /> Counter</Button>
                  </div>
                </div>
                {expanded && (
                  <div className="border-t border-slate-100">
                    {counters.length === 0 ? (
                      <p className="text-sm text-slate-400 text-center py-4">No counters in this group</p>
                    ) : (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="px-6 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Counter</th>
                            <th className="px-6 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Code</th>
                            <th className="px-6 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-2.5 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {counters.map((c) => (
                            <tr key={c.id} className="hover:bg-slate-50">
                              <td className="px-6 py-3 font-medium text-slate-800">{c.name}</td>
                              <td className="px-6 py-3 font-mono text-slate-500">{c.code}</td>
                              <td className="px-6 py-3"><Badge variant={c.isActive ? 'success' : 'muted'}>{c.isActive ? 'Active' : 'Inactive'}</Badge></td>
                              <td className="px-6 py-3">
                                <div className="flex items-center justify-end gap-2">
                                  <Button size="sm" variant="ghost" onClick={() => openEditCounter(c)}><Edit2 className="w-3.5 h-3.5" /></Button>
                                  <Button size="sm" variant="ghost" onClick={() => updateCounter.mutate({ id: c.id, isActive: !c.isActive })}
                                    title={c.isActive ? 'Deactivate' : 'Activate'}>
                                    {c.isActive ? <ToggleRight className="w-4 h-4 text-green-600" /> : <ToggleLeft className="w-4 h-4 text-slate-400" />}
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Group modal */}
      <Modal open={showGroupModal} onClose={() => setShowGroupModal(false)} title={editingGroup ? 'Edit Group' : 'New Counter Group'}>
        <div className="space-y-4">
          {!editingGroup && (
            <Select label="Branch" value={groupForm.branchId} onChange={(e) => setGroupForm((f) => ({ ...f, branchId: e.target.value }))}
              placeholder="Select branch" options={branches.map((b) => ({ value: b.id, label: b.name }))} />
          )}
          <Input label="Group Name" value={groupForm.name} onChange={(e) => setGroupForm((f) => ({ ...f, name: e.target.value }))} placeholder="Main Counters" required />
          <Input label="Description" value={groupForm.description} onChange={(e) => setGroupForm((f) => ({ ...f, description: e.target.value }))} placeholder="Optional" />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowGroupModal(false)}>Cancel</Button>
            <Button className="flex-1" loading={createGroup.isPending || updateGroup.isPending}
              onClick={() => editingGroup ? updateGroup.mutate({ id: editingGroup.id, ...groupForm }) : createGroup.mutate(groupForm)}
              disabled={!groupForm.name}>
              {editingGroup ? 'Save' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Counter modal */}
      <Modal open={showCounterModal} onClose={() => setShowCounterModal(false)} title={editingCounter ? 'Edit Counter' : 'New Counter'}>
        <div className="space-y-4">
          <Input label="Counter Name" value={counterForm.name} onChange={(e) => setCounterForm((f) => ({ ...f, name: e.target.value }))} placeholder="Counter 1" required />
          <Input label="Code" value={counterForm.code} onChange={(e) => setCounterForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="C01" required />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowCounterModal(false)}>Cancel</Button>
            <Button className="flex-1" loading={createCounter.isPending || updateCounter.isPending}
              onClick={() => editingCounter
                ? updateCounter.mutate({ id: editingCounter.id, ...counterForm })
                : createCounter.mutate({ ...counterForm, groupId: targetGroupId })}
              disabled={!counterForm.name || !counterForm.code}>
              {editingCounter ? 'Save' : 'Add Counter'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
