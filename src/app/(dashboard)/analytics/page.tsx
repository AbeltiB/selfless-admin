'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { PageSpinner } from '@/components/ui/Spinner';
import { QueueTrendChart } from '@/components/charts/QueueTrendChart';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatWait } from '@/lib/utils';
import { Ticket, CheckCircle2, Clock, TrendingUp } from 'lucide-react';

interface HourlyData {
  hour: number;
  label?: string;
  ticketCount: number;
  completedCount: number;
  avgWaitSeconds: number;
}

interface ServiceMetric {
  serviceId: string;
  serviceName: string;
  ticketCount: number;
  avgWaitSeconds: number;
  completionRate: number;
}

interface DashboardAnalytics {
  totalTickets: number;
  completedTickets: number;
  avgWaitSeconds: number;
  completionRate: number;
  hourlyData: HourlyData[];
  serviceMetrics: ServiceMetric[];
}

export default function AnalyticsPage() {
  const { data, isLoading } = useQuery<{ data: DashboardAnalytics }>({
    queryKey: ['analytics-full'],
    queryFn: async () => {
      const res = await api.get('/analytics/dashboard');
      return res.data;
    },
    refetchInterval: 60000,
  });

  const analytics = data?.data;

  const hourlyChartData =
    analytics?.hourlyData?.map((h) => ({
      hour: h.label ?? `${h.hour}:00`,
      waiting: h.ticketCount - h.completedCount,
      completed: h.completedCount,
    })) ?? generateMockHourlyData();

  const serviceChartData =
    analytics?.serviceMetrics?.map((s) => ({
      name: s.serviceName,
      avgWait: Math.round((s.avgWaitSeconds ?? 0) / 60),
      tickets: s.ticketCount,
    })) ?? [];

  const completionRate = analytics?.completionRate ?? 0;

  if (isLoading) return <PageSpinner />;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Tickets Today"
          value={analytics?.totalTickets ?? 0}
          icon={Ticket}
          color="blue"
        />
        <StatCard
          title="Completed"
          value={analytics?.completedTickets ?? 0}
          icon={CheckCircle2}
          color="green"
        />
        <StatCard
          title="Completion Rate"
          value={`${Math.round(completionRate * 100)}%`}
          icon={TrendingUp}
          color="purple"
        />
        <StatCard
          title="Avg Wait Time"
          value={formatWait(analytics?.avgWaitSeconds)}
          icon={Clock}
          color="amber"
        />
      </div>

      {/* Hourly trend chart */}
      <Card>
        <CardHeader>
          <CardTitle>Ticket Volume by Hour</CardTitle>
          <p className="text-sm text-slate-500">Today&apos;s queue activity</p>
        </CardHeader>
        <QueueTrendChart data={hourlyChartData} />
      </Card>

      {/* Service wait times */}
      {serviceChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Avg Wait Time by Service (minutes)</CardTitle>
          </CardHeader>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={serviceChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="avgWait" fill="#2563eb" radius={[4, 4, 0, 0]} name="Avg Wait (min)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Service metrics table */}
      {(analytics?.serviceMetrics?.length ?? 0) > 0 && (
        <Card className="p-0 overflow-hidden">
          <CardHeader className="px-6 pt-5 pb-4">
            <CardTitle>Service Performance</CardTitle>
          </CardHeader>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Tickets
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Avg Wait
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Completion Rate
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(analytics?.serviceMetrics ?? []).map((metric) => (
                <tr key={metric.serviceId} className="hover:bg-slate-50">
                  <td className="px-6 py-3 font-medium text-slate-800">{metric.serviceName}</td>
                  <td className="px-6 py-3 text-slate-600">{metric.ticketCount}</td>
                  <td className="px-6 py-3 text-slate-600">{formatWait(metric.avgWaitSeconds)}</td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-100 rounded-full h-1.5 max-w-24">
                        <div
                          className="bg-green-500 h-1.5 rounded-full"
                          style={{
                            width: `${Math.round((metric.completionRate ?? 0) * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-slate-600 text-xs">
                        {Math.round((metric.completionRate ?? 0) * 100)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

function generateMockHourlyData() {
  const hours = Array.from({ length: 12 }, (_, i) => {
    const h = 8 + i;
    return {
      hour: `${h}:00`,
      waiting: Math.floor(Math.random() * 20),
      completed: Math.floor(Math.random() * 30),
    };
  });
  return hours;
}
