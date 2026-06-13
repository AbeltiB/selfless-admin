'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Ticket } from 'selfless-sdk';
import { TicketEventType } from 'selfless-sdk';

export interface TicketEvent {
  id: string;
  ticketId: string;
  eventType: TicketEventType;
  actorId: string | null;
  actor: { id: string; name: string } | null;
  fromStatus: string | null;
  toStatus: string | null;
  counterId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface TicketDetail extends Ticket {
  customer: {
    id: string;
    firstName: string;
    lastName?: string;
    phone?: string;
    telegramId?: string;
    telegramUsername?: string;
  } | null;
  service: {
    id: string;
    name: string;
    prefix: string;
    estimatedDuration: number;
  };
  branch: { id: string; name: string };
  currentStep: { id: string; name: string; stepType: string } | null;
  currentCounter: { id: string; name: string; code: string } | null;
  operator: { id: string; name: string } | null;
  events: TicketEvent[];
}

export function useTicket(id: string | null) {
  return useQuery<TicketDetail>({
    queryKey: ['ticket', id],
    queryFn: async () => {
      const res = await api.get(`/tickets/${id}`);
      return res.data.data ?? res.data;
    },
    enabled: !!id,
    staleTime: 5000,
  });
}
