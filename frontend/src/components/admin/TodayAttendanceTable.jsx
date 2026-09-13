'use client';

import { useState } from 'react';
import { format } from 'date-fns';

// ── Today's Attendance Table ──────────────────────────────────
export default function TodayAttendanceTable({ records = [], loading }) {
  const [search, setSearch] = useState('');

  const filtered = records.filter(r =>
    !search ||
    r.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.employee_id?.toLowerCase().includes(search.toLowerCase()) ||
    r.department?.toLowerCase().includes(search.toLowerCase())
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

  function statusBadge(r) {
    if (!r.check_in_time) {
      if (r.status === 'leave') return <span className="badge-leave">🏖 Leave</span>;
      return <span className="badge-absent">⬤ Absent</span>;
    }
    if (r.is_late)          return <span className="badge-late">⚠ Late</span>;
    if (!r.check_out_time)  return <span className="badge-present">✓ In Office</span>;
    return                         <span className="badge-present">✓ Complete</span>;
  }

  return (
    <>
      <div className="px-6 py-3 border-b border-gray-50">
        <input
          className="input max-w-xs text-sm"
          placeholder="Search name, ID, department..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-50 text-left text-xs text-gray-400 uppercase tracking-wide">
              {['Employee', 'Department', 'Check-In', 'Check-Out', 'Hours', 'Method', 'Status'].map(h => (
                <th key={h} className="px-6 py-3 font-semibold whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!filtered.length && (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-400">No records found.</td></tr>
            )}
            {filtered.map(r => (
              <tr key={r.employee_id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                <td className="px-6 py-3">
                  <p className="font-semibold text-gray-800">{r.full_name}</p>
                  <p className="text-xs text-gray-400">{r.employee_id}</p>
                </td>
                <td className="px-6 py-3 text-gray-600">{r.department || '—'}</td>
                <td className="px-6 py-3 text-gray-700">
                  {r.check_in_time
                    ? format(new Date(r.check_in_time), 'hh:mm a')
                    : <span className="text-gray-300">—</span>}
                </td>
                <td className="px-6 py-3 text-gray-700">
                  {r.check_out_time
                    ? format(new Date(r.check_out_time), 'hh:mm a')
                    : <span className="text-gray-300">—</span>}
                </td>
                <td className="px-6 py-3 text-gray-700">
                  {r.working_minutes
                    ? `${Math.floor(r.working_minutes / 60)}h ${r.working_minutes % 60}m`
                    : '—'}
                </td>
                <td className="px-6 py-3">
                  <span className="text-xs text-gray-500 capitalize">{r.method || '—'}</span>
                </td>
                <td className="px-6 py-3">{statusBadge(r)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
