'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useBranches } from '@/hooks/useBranches';
import { AppointmentStatus } from 'selfless-sdk';
import type { Appointment } from 'selfless-sdk';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { CalendarClock, CheckCircle2, XCircle, LogIn } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const STATUS_COLORS: Record<AppointmentStatus, string> = {
  [AppointmentStatus.PENDING]: 'bg-blue-100 text-blue-700',
  [AppointmentStatus.CONFIRMED]: 'bg-green-100 text-green-700',
  [AppointmentStatus.CHECKED_IN]: 'bg-purple-100 text-purple-700',
  [AppointmentStatus.CANCELLED]: 'bg-red-100 text-red-700',
  [AppointmentStatus.COMPLETED]: 'bg-emerald-100 text-emerald-700',
  [AppointmentStatus.NO_SHOW]: 'bg-slate-100 text-slate-600',
};

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  [AppointmentStatus.PENDING]: 'Pending',
  [AppointmentStatus.CONFIRMED]: 'Confirmed',
  [AppointmentStatus.CHECKED_IN]: 'Checked In',
  [AppointmentStatus.CANCELLED]: 'Cancelled',
  [AppointmentStatus.COMPLETED]: 'Completed',
  [AppointmentStatus.NO_SHOW]: 'No Show',
};

export default function AppointmentsPage() {
  const qc = useQueryClient();
  const { data: branches = [] } = useBranches();
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: appointments = [], isLoading } = useQuery<Appointment[]>({
    queryKey: ['appointments', selectedBranchId, statusFilter],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (selectedBranchId) params.branchId = selectedBranchId;
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/appointments', { params });
      return res.data.data ?? res.data;
    },
  });

  const checkIn = useMutation({
    mutationFn: (id: string) => api.post(`/appointments/${id}/check-in`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['appointments'] }); toast.success('Checked in — ticket issued'); },
    onError: () => toast.error('Check-in failed'),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: AppointmentStatus }) => api.patch(`/appointments/${id}`, { status }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['appointments'] }); toast.success('Status updated'); },
    onError: () => toast.error('Failed to update status'),
  });

  const grouped = appointments.reduce<Record<string, Appointment[]>>((acc, appt) => {
    const day = format(new Date(appt.scheduledAt), 'yyyy-MM-dd');
    (acc[day] = acc[day] ?? []).push(appt);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Appointments</h2>
          <p className="text-sm text-slate-500 mt-0.5">View and manage scheduled appointments</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-44">
            <Select value={selectedBranchId} onChange={(e) => setSelectedBranchId(e.target.value)} placeholder="All branches"
              options={branches.map((b) => ({ value: b.id, label: b.name }))} />
          </div>
          <div className="w-44">
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} placeholder="All statuses"
              options={Object.values(AppointmentStatus).map((s) => ({ value: s, label: STATUS_LABELS[s] }))} />
          </div>
        </div>
      </div>

      {isLoading ? <PageSpinner /> : appointments.length === 0 ? (
        <EmptyState icon={CalendarClock} title="No appointments" description="No appointments found for the selected filters" />
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([day, appts]) => (
            <div key={day}>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
                {format(new Date(day), 'EEEE, MMMM d, yyyy')}
              </h3>
              <Card className="p-0 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Service</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Duration</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {appts.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()).map((appt) => {
                      const a = appt as any;
                      return (
                        <tr key={appt.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-mono text-slate-700 font-medium">
                            {format(new Date(appt.scheduledAt), 'HH:mm')}
                          </td>
                          <td className="px-6 py-4">
                            {a.customer ? (
                              <div>
                                <p className="font-medium text-slate-800">{a.customer.firstName} {a.customer.lastName ?? ''}</p>
                                {a.customer.phone && <p className="text-xs text-slate-500">{a.customer.phone}</p>}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Walk-in</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-slate-700">{a.service?.name ?? appt.serviceId}</td>
                          <td className="px-6 py-4 text-slate-500">{appt.duration} min</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[appt.status]}`}>
                              {STATUS_LABELS[appt.status]}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-1">
                              {appt.status === AppointmentStatus.PENDING || appt.status === AppointmentStatus.CONFIRMED ? (
                                <>
                                  <Button size="sm" variant="ghost" onClick={() => checkIn.mutate(appt.id)} title="Check in and issue ticket">
                                    <LogIn className="w-3.5 h-3.5 text-blue-600" />
                                  </Button>
                                  <Button size="sm" variant="ghost"
                                    onClick={() => updateStatus.mutate({ id: appt.id, status: AppointmentStatus.CANCELLED })}
                                    title="Cancel appointment">
                                    <XCircle className="w-3.5 h-3.5 text-red-400" />
                                  </Button>
                                </>
                              ) : appt.status !== AppointmentStatus.COMPLETED && (
                                <Button size="sm" variant="ghost"
                                  onClick={() => updateStatus.mutate({ id: appt.id, status: AppointmentStatus.COMPLETED })}
                                  title="Mark complete">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                </Button>
                              )}
                              {appt.ticketId && (
                                <span className="text-xs text-slate-400 ml-1">#{(appt as any).ticket?.queueNumber ?? appt.ticketId.slice(-6)}</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
