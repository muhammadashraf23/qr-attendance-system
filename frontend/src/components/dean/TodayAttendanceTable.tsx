'use client';

import { useState } from 'react';
import { format } from 'date-fns';

export default function TodayAttendanceTable({ records = [], loading }: { records?: any[]; loading?: boolean }) {
  const [search, setSearch] = useState('');

  const filtered = records.filter(r =>
    !search ||
    r.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    (r.member_id || r.employee_id)?.toLowerCase().includes(search.toLowerCase()) ||
    r.department?.toLowerCase().includes(search.toLowerCase()) ||
    r.role?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 bg-gray-50 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  function statusBadge(r: any) {
    const clockIn = r.clock_in_time || r.check_in_time;
    const clockOut = r.clock_out_time || r.check_out_time;

    if (!clockIn) {
      if (r.status === 'leave') return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">🏖 Leave</span>;
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">⬤ Absent</span>;
    }
    if (r.is_late) return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">⚠ Late</span>;
    if (!clockOut) return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">✓ On Campus</span>;
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-900 border border-zinc-300">✓ Complete</span>;
  }

  return (
    <>
      <div className="px-6 py-3 border-b border-gray-100 bg-gray-50/50">
        <input
          className="w-full max-w-xs text-sm border border-zinc-300 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-black bg-white"
          placeholder="Search student, roll no, faculty, dept..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-white text-left text-xs text-gray-500 uppercase tracking-wide">
              {['Member', 'Role / Dept', 'Clock In', 'Clock Out', 'Duration', 'Method', 'Status'].map(h => (
                <th key={h} className="px-6 py-3 font-semibold whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 bg-white">
            {!filtered.length && (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-400">No attendance records found today.</td></tr>
            )}
            {filtered.map(r => {
              const clockIn = r.clock_in_time || r.check_in_time;
              const clockOut = r.clock_out_time || r.check_out_time;
              const id = r.member_id || r.employee_id;

              return (
                <tr key={id} className="hover:bg-gray-50/70 transition">
                  <td className="px-6 py-3">
                    <p className="font-semibold text-gray-800">{r.full_name}</p>
                    <p className="text-xs text-gray-400 font-mono">{id}</p>
                  </td>
                  <td className="px-6 py-3">
                    <span className="capitalize text-xs font-semibold text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded-md">
                      {r.role || 'Student'}
                    </span>
                    <p className="text-xs text-gray-500 mt-0.5">{r.department || '—'}</p>
                  </td>
                  <td className="px-6 py-3 text-gray-700 font-mono text-xs">
                    {clockIn ? format(new Date(clockIn), 'hh:mm a') : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-6 py-3 text-gray-700 font-mono text-xs">
                    {clockOut ? format(new Date(clockOut), 'hh:mm a') : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-6 py-3 text-gray-700 text-xs">
                    {r.working_minutes
                      ? `${Math.floor(r.working_minutes / 60)}h ${r.working_minutes % 60}m`
                      : '—'}
                  </td>
                  <td className="px-6 py-3">
                    <span className="text-xs text-gray-600 capitalize bg-gray-100 px-2 py-0.5 rounded">
                      {r.method || 'Kiosk'}
                    </span>
                  </td>
                  <td className="px-6 py-3">{statusBadge(r)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
