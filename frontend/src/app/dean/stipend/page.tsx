'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Wallet, RefreshCw } from 'lucide-react';
import api from '@/utils/api';

export default function DeanStipendPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['dean-stipend-report', month, year],
    queryFn: async () => {
      try {
        const { data } = await api.get(`/stipend/report?month=${month}&year=${year}`);
        return data.data || [];
      } catch (err) {
        return [];
      }
    },
  });

  const records: any[] = data || [];

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Faculty & TA Stipends</h1>
          <p className="text-sm text-gray-500 mt-0.5">Monthly academic stipends and teaching compensation</p>
        </div>

        {/* Month / Year Selector */}
        <div className="flex items-center gap-2">
          <select
            className="bg-white border border-gray-200 text-gray-800 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none"
            value={month}
            onChange={e => setMonth(Number(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(2000, i).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
          <select
            className="bg-white border border-gray-200 text-gray-800 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none"
            value={year}
            onChange={e => setYear(Number(e.target.value))}
          >
            {[now.getFullYear() - 1, now.getFullYear()].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : !records.length ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-800 flex items-center justify-center mx-auto mb-3">
              <Wallet className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">No Stipends Generated</h2>
            <p className="text-sm text-gray-500 max-w-sm mx-auto mt-1">
              No stipend calculations generated for the selected month. Stipends apply to faculty members and teaching assistants.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-left text-xs text-gray-500 uppercase tracking-wide">
                  <th className="px-6 py-3 font-semibold">Faculty / Staff</th>
                  <th className="px-6 py-3 font-semibold">Department</th>
                  <th className="px-6 py-3 font-semibold">Working Days</th>
                  <th className="px-6 py-3 font-semibold">Base Stipend</th>
                  <th className="px-6 py-3 font-semibold">Net Stipend</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {records.map((r: any) => (
                  <tr key={r.id || r._id} className="hover:bg-gray-50/70 transition">
                    <td className="px-6 py-3.5 font-semibold text-gray-900">{r.full_name || r.name}</td>
                    <td className="px-6 py-3.5 text-gray-600">{r.department || '—'}</td>
                    <td className="px-6 py-3.5 text-gray-700">{r.working_days || '—'}</td>
                    <td className="px-6 py-3.5 font-mono text-gray-700">₹{r.base_salary || r.base_stipend || 0}</td>
                    <td className="px-6 py-3.5 font-mono font-bold text-gray-950">₹{r.net_salary || r.net_stipend || 0}</td>
                    <td className="px-6 py-3.5">
                      <span className="capitalize text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-800">
                        {r.status || 'draft'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
