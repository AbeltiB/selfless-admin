'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useBranches } from '@/hooks/useBranches';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate, timeAgo, ROLE_LABELS } from '@/lib/utils';
import type { User } from 'selfless-sdk';
import { UserRole } from 'selfless-sdk';
import { Users, Plus, Edit2, ToggleLeft, ToggleRight, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

interface UserForm {
  name: string;
  email: string;
  role: UserRole;
  branchId: string;
  password: string;
}

const defaultForm: UserForm = {
  name: '',
  email: '',
  role: UserRole.OPERATOR,
  branchId: '',
  password: '',
};

const ROLE_OPTIONS = Object.values(UserRole).map((r) => ({
  value: r,
  label: ROLE_LABELS[r],
}));

export default function UsersPage() {
  const qc = useQueryClient();
  const { user: currentUser } = useAuthStore();
  const { data: branches = [] } = useBranches();
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState<UserForm>(defaultForm);

  const isAdmin =
    currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.SUPERVISOR;

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await api.get('/users');
      return res.data.data ?? res.data;
    },
    enabled: isAdmin,
  });

  const createUser = useMutation({
    mutationFn: (data: UserForm) => api.post('/users', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success('User invited');
      setShowModal(false);
    },
    onError: () => toast.error('Failed to create user'),
  });

  const updateUser = useMutation({
    mutationFn: ({ id, ...data }: Partial<User> & { id: string }) =>
      api.patch(`/users/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success('User updated');
      setShowModal(false);
    },
    onError: () => toast.error('Failed to update user'),
  });

  const openCreate = () => {
    setEditingUser(null);
    setForm(defaultForm);
    setShowModal(true);
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setForm({
      name: user.name,
      email: user.email,
      role: user.role,
      branchId: user.branchId ?? '',
      password: '',
    });
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (editingUser) {
      const { password, ...rest } = form;
      updateUser.mutate({ id: editingUser.id, ...rest });
    } else {
      createUser.mutate(form);
    }
  };

  const handleToggle = (user: User) => {
    updateUser.mutate({ id: user.id, isActive: !user.isActive });
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'danger' as const;
      case UserRole.SUPERVISOR:
        return 'warning' as const;
      case UserRole.BRANCH_MANAGER:
        return 'info' as const;
      default:
        return 'default' as const;
    }
  };

  if (!isAdmin) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="Access Restricted"
        description="You don't have permission to manage users. Contact your administrator."
      />
    );
  }

  if (isLoading) return <PageSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Users</h2>
          <p className="text-sm text-slate-500 mt-0.5">Manage team members and their access</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4" />
          Invite User
        </Button>
      </div>

      {users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users yet"
          description="Invite team members to get started"
          action={
            <Button onClick={openCreate}>
              <Plus className="w-4 h-4" />
              Invite User
            </Button>
          }
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Branch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => {
                const branch = branches.find((b) => b.id === user.branchId);
                return (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{user.name}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {ROLE_LABELS[user.role]}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{branch?.name ?? '—'}</td>
                    <td className="px-6 py-4">
                      <Badge variant={user.isActive ? 'success' : 'muted'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {user.lastLoginAt ? timeAgo(user.lastLoginAt) : 'Never'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(user)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggle(user)}
                          disabled={user.id === currentUser?.sub}
                          title={user.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {user.isActive ? (
                            <ToggleRight className="w-4 h-4 text-green-600" />
                          ) : (
                            <ToggleLeft className="w-4 h-4 text-slate-400" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingUser ? 'Edit User' : 'Invite User'}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="John Doe"
              required
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="john@company.com"
              required
              disabled={!!editingUser}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Role"
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as UserRole }))}
              options={ROLE_OPTIONS}
            />
            <Select
              label="Branch"
              value={form.branchId}
              onChange={(e) => setForm((f) => ({ ...f, branchId: e.target.value }))}
              placeholder="No branch (global)"
              options={branches.map((b) => ({ value: b.id, label: b.name }))}
            />
          </div>
          {!editingUser && (
            <Input
              label="Temporary Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="Min 8 characters"
              required
            />
          )}
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              loading={createUser.isPending || updateUser.isPending}
              onClick={handleSubmit}
              disabled={!form.name || !form.email}
            >
              {editingUser ? 'Save Changes' : 'Invite User'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
