'use client';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface DataPoint {
  hour: string;
  waiting: number;
  completed: number;
}

interface QueueTrendChartProps {
  data: DataPoint[];
}

export function QueueTrendChart({ data }: QueueTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="hour" tick={{ fontSize: 12, fill: '#64748b' }} />
        <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '12px',
          }}
        />
        <Legend wrapperStyle={{ fontSize: '12px' }} />
        <Line
          type="monotone"
          dataKey="waiting"
          stroke="#2563eb"
          strokeWidth={2}
          dot={false}
          name="Waiting"
        />
        <Line
          type="monotone"
          dataKey="completed"
          stroke="#16a34a"
          strokeWidth={2}
          dot={false}
          name="Completed"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
