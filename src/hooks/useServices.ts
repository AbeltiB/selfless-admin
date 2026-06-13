'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Service } from 'selfless-sdk';
import toast from 'react-hot-toast';

export function useServices(branchId?: string) {
  return useQuery<Service[]>({
    queryKey: ['services', branchId],
    queryFn: async () => {
      const params = branchId ? { branchId } : {};
      const res = await api.get('/services', { params });
      return res.data.data ?? res.data;
    },
  });
}

export function useCreateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { branchId: string; name: string; code: string; prefix: string; estimatedDuration?: number; serviceType?: string; description?: string }) =>
      api.post('/services', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['services'] });
      toast.success('Service created');
    },
    onError: () => toast.error('Failed to create service'),
  });
}

export function useUpdateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; [k: string]: unknown }) =>
      api.patch(`/services/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['services'] });
      toast.success('Service updated');
    },
    onError: () => toast.error('Failed to update service'),
  });
}

export function useTransferTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ticketId, toServiceId, toStepId, notes }: { ticketId: string; toServiceId?: string; toStepId?: string; notes?: string }) =>
      api.patch(`/tickets/${ticketId}/transfer`, { toServiceId, toStepId, notes }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('Ticket transferred');
    },
    onError: () => toast.error('Failed to transfer ticket'),
  });
}
