'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Queue, Ticket } from 'selfless-sdk';
import toast from 'react-hot-toast';

export function useQueues(branchId?: string) {
  return useQuery<Queue[]>({
    queryKey: ['queues', branchId],
    queryFn: async () => {
      const params = branchId ? { branchId } : {};
      const res = await api.get('/queues', { params });
      return res.data.data ?? res.data;
    },
    enabled: true,
  });
}

export function useQueueTickets(queueId?: string) {
  return useQuery<Ticket[]>({
    queryKey: ['tickets', queueId],
    queryFn: async () => {
      const res = await api.get(`/queues/${queueId}/tickets`);
      return res.data.data ?? res.data;
    },
    enabled: !!queueId,
    refetchInterval: 10000,
  });
}

export function useCallNext(queueId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post(`/queues/${queueId}/call-next`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tickets', queueId] });
      qc.invalidateQueries({ queryKey: ['queues'] });
      toast.success('Next ticket called');
    },
    onError: () => toast.error('Failed to call next ticket'),
  });
}

export function useUpdateTicketStatus(queueId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ticketId, status, notes }: { ticketId: string; status: string; notes?: string }) =>
      api.patch(`/tickets/${ticketId}/status`, { status, notes }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tickets', queueId] });
      qc.invalidateQueries({ queryKey: ['queues'] });
      toast.success('Ticket updated');
    },
    onError: () => toast.error('Failed to update ticket'),
  });
}

export function useOpenQueue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { branchId: string; serviceId: string; date?: string }) =>
      api.post('/queues', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['queues'] });
      toast.success('Queue opened');
    },
    onError: () => toast.error('Failed to open queue'),
  });
}

export function useUpdateQueueStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ queueId, status }: { queueId: string; status: string }) =>
      api.patch(`/queues/${queueId}/status`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['queues'] });
      toast.success('Queue status updated');
    },
    onError: () => toast.error('Failed to update queue status'),
  });
}
