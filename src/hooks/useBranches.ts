'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Branch } from 'selfless-sdk';
import toast from 'react-hot-toast';

export function useBranches() {
  return useQuery<Branch[]>({
    queryKey: ['branches'],
    queryFn: async () => {
      const res = await api.get('/branches');
      return res.data.data ?? res.data;
    },
  });
}

export function useCreateBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Branch>) => api.post('/branches', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['branches'] });
      toast.success('Branch created');
    },
    onError: () => toast.error('Failed to create branch'),
  });
}

export function useUpdateBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Branch> & { id: string }) =>
      api.patch(`/branches/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['branches'] });
      toast.success('Branch updated');
    },
    onError: () => toast.error('Failed to update branch'),
  });
}
