'use client';
import { useState, useEffect, useCallback } from 'react';
import { Monitor } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

interface CounterDisplay {
  id: string;
  name: string;
  code: string;
  group: { id: string; name: string } | null;
  nowServing: {
    queueNumber: string;
    status: string;
    service: { id: string; name: string };
    calledAt: string | null;
  } | null;
}

export default function DisplayPage() {
  const [branchId, setBranchId] = useState('');
  const [counters, setCounters] = useState<CounterDisplay[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState('');

  const fetchDisplay = useCallback(async (id: string) => {
    if (!id) return;
    try {
      const res = await fetch(`${API_URL}/counters/display?branchId=${id}`);
      const json = await res.json();
      setCounters(json.data ?? json ?? []);
      setLastUpdated(new Date());
      setError('');
    } catch {
      setError('Failed to load display data');
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('branchId') ?? '';
    setBranchId(id);
    if (id) fetchDisplay(id);
  }, [fetchDisplay]);

  useEffect(() => {
    if (!branchId) return;
    const interval = setInterval(() => fetchDisplay(branchId), 8000);
    return () => clearInterval(interval);
  }, [branchId, fetchDisplay]);

  if (!branchId) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Monitor className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 text-lg">No branch selected</p>
          <p className="text-gray-600 text-sm mt-1">
            Add <code className="text-gray-400">?branchId=YOUR_BRANCH_ID</code> to the URL
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-red-400 text-lg">{error}</p>
      </div>
    );
  }

  const serving = counters.filter((c) => c.nowServing);
  const idle = counters.filter((c) => !c.nowServing);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <Monitor className="w-6 h-6 text-blue-400" />
          <span className="text-lg font-semibold tracking-tight">Queue Display</span>
        </div>
        {lastUpdated && (
          <span className="text-xs text-gray-500">
            Updated {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Main board */}
      <div className="flex-1 p-8">
        {counters.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-xl">No active counters</p>
          </div>
        ) : (
          <>
            {/* Now Serving */}
            {serving.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Now Serving</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {serving.map((counter) => (
                    <CounterCard key={counter.id} counter={counter} active />
                  ))}
                </div>
              </div>
            )}

            {/* Idle counters */}
            {idle.length > 0 && (
              <div>
                <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-4">Available</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                  {idle.map((counter) => (
                    <CounterCard key={counter.id} counter={counter} active={false} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer ticker */}
      <div className="border-t border-gray-800 px-8 py-2 flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-xs text-gray-500">Live display — refreshes every 8 seconds</span>
      </div>
    </div>
  );
}

function CounterCard({ counter, active }: { counter: CounterDisplay; active: boolean }) {
  return (
    <div
      className={`rounded-2xl border p-5 flex flex-col gap-3 transition-all ${
        active
          ? 'bg-gray-900 border-blue-500/40 shadow-lg shadow-blue-500/5'
          : 'bg-gray-900/40 border-gray-800'
      }`}
    >
      {/* Counter label */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
          {counter.code}
        </span>
        {active && (
          <span className="inline-flex items-center gap-1 text-xs text-green-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Active
          </span>
        )}
      </div>

      {/* Counter name */}
      <p className="text-sm font-semibold text-white leading-snug">{counter.name}</p>

      {/* Now serving */}
      {counter.nowServing ? (
        <div className="mt-auto">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Now Serving</p>
          <p className="text-4xl font-bold font-mono tracking-tight text-blue-300">
            {counter.nowServing.queueNumber}
          </p>
          <p className="text-xs text-gray-400 mt-1 truncate">{counter.nowServing.service.name}</p>
        </div>
      ) : (
        <div className="mt-auto">
          <p className="text-sm text-gray-600">—</p>
        </div>
      )}
    </div>
  );
}
