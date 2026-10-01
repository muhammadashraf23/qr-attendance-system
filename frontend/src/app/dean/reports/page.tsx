'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileBarChart2, Download, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import api from '@/utils/api';

export default function DeanReportsPage() {
  const [activeTab, setActiveTab] = useState<'attendance' | 'defaulters'>('defaulters');

  const { data: defaultersData, isLoading: defLoading, refetch: refetchDef } = useQuery({
    queryKey: ['dean-defaulters'],
    queryFn: async () => {
      const { data } = await api.get('/dean/defaulters');
      return data.data || [];
    },
  });

  const { data: reportsData, isLoading: repLoading, refetch: refetchRep } = useQuery({
    queryKey: ['dean-reports'],
    queryFn: async () => {
      const { data } = await api.get('/dean/reports');
      return data.data || [];
    },
  });

  const defaulters: any[] = defaultersData || [];
  const reports: any[] = reportsData || [];

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Academic Analytics & Reports</h1>
          <p className="text-sm text-gray-500 mt-0.5">Exam eligibility radar (&lt;75% rule) and exportable registers</p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/dean/export-register`}
            target="_blank"
            rel="noreferrer"
            className="bg-black hover:bg-zinc-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition shadow-sm flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV Register
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-gray-100 rounded-xl gap-1 w-fit">
        <button
          onClick={() => setActiveTab('defaulters')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'defaulters' ? 'bg-white text-black shadow-sm' : 'text-gray-600 hover:text-black'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          75% Defaulter Radar ({defaulters.length})
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'attendance' ? 'bg-white text-black shadow-sm' : 'text-gray-600 hover:text-black'
          }`}
        >
          <FileBarChart2 className="w-3.5 h-3.5 text-zinc-700" />
          Full Attendance Logs
        </button>
      </div>

      {/* Defaulters Tab */}
      {activeTab === 'defaulters' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-amber-50/50 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Mandatory Exam Eligibility Compliance (&lt; 75% Threshold)
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Students listed here fall below the university required 75% course attendance.
              </p>
            </div>
            <button
              onClick={() => refetchDef()}
              className="p-2 text-gray-500 hover:text-black transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {defLoading ? (
            <div className="p-8 space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : !defaulters.length ? (
            <div className="p-12 text-center">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h3 className="font-bold text-gray-800">No Academic Defaulters!</h3>
              <p className="text-xs text-gray-500 mt-1">All enrolled students meet or exceed the 75% attendance quota.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50 text-left text-xs text-gray-500 uppercase tracking-wide">
                    <th className="px-6 py-3 font-semibold">Roll Number</th>
                    <th className="px-6 py-3 font-semibold">Student Name</th>
                    <th className="px-6 py-3 font-semibold">Department / Course</th>
                    <th className="px-6 py-3 font-semibold">Attended / Total</th>
                    <th className="px-6 py-3 font-semibold">Attendance %</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {defaulters.map((s: any) => (
                    <tr key={s.roll_number || s.member_id} className="hover:bg-amber-50/20 transition">
                      <td className="px-6 py-3.5 font-mono font-bold text-gray-900">{s.roll_number || s.member_id}</td>
                      <td className="px-6 py-3.5 font-semibold text-gray-800">{s.name || s.full_name}</td>
                      <td className="px-6 py-3.5 text-gray-600">{s.department || s.department_name || 'General'}</td>
                      <td className="px-6 py-3.5 text-gray-700">
                        {s.attended_lectures ?? s.attended ?? 0} / {s.total_lectures ?? s.total ?? 0}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="font-mono font-extrabold text-red-600 text-sm">
                          {(s.percentage || 0).toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                          De-barred / Defaulter
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Attendance Tab */}
      {activeTab === 'attendance' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-800 text-sm">Complete Historical Log</h2>
            <button onClick={() => refetchRep()} className="p-2 text-gray-500 hover:text-black transition">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {repLoading ? (
            <div className="p-8 space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : !reports.length ? (
            <p className="p-8 text-center text-gray-400 text-sm">No historical attendance records.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50 text-left text-xs text-gray-500 uppercase tracking-wide">
                    <th className="px-6 py-3 font-semibold">Date</th>
                    <th className="px-6 py-3 font-semibold">Member</th>
                    <th className="px-6 py-3 font-semibold">Role</th>
                    <th className="px-6 py-3 font-semibold">Clock In</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {reports.slice(0, 30).map((r: any, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-50/70 transition">
                      <td className="px-6 py-3 font-mono text-xs text-gray-600">{r.date}</td>
                      <td className="px-6 py-3">
                        <p className="font-semibold text-gray-900">{r.full_name}</p>
                        <p className="text-xs text-gray-500 font-mono">{r.member_id}</p>
                      </td>
                      <td className="px-6 py-3 text-xs text-gray-600 capitalize">{r.role}</td>
                      <td className="px-6 py-3 font-mono text-xs text-gray-700">
                        {r.clock_in_time ? new Date(r.clock_in_time).toLocaleTimeString() : '—'}
                      </td>
                      <td className="px-6 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                          r.status === 'present' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
