'use client';

import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { RefreshCw, UserPlus } from 'lucide-react';
import api from '@/utils/api';
import DashboardStats from '@/components/DashboardStats';
import { AttendanceTrendChart, DepartmentChart } from '@/components/AttendanceChart';
import TodayAttendanceTable from '@/components/dean/TodayAttendanceTable';
import PendingLeavePanel from '@/components/dean/PendingLeavePanel';

export default function DeanDashboard() {
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['dean-dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/dean/dashboard');
      return data.data;
    },
    refetchInterval: 60_000,
  });

  const summary   = data?.summary;
  const trend     = data?.attendance_trend || [];
  const deptStats = data?.department_stats || [];
  const todayRecs = data?.today_records    || [];

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Dean Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {format(new Date(), "EEEE, dd MMMM yyyy")} · Campus Attendance & Defaulter Radar
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold py-2 px-3 rounded-xl transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <a
            href="/dean/roster-import"
            className="bg-black hover:bg-zinc-800 text-white font-bold text-sm py-2 px-3.5 rounded-xl transition shadow-sm flex items-center gap-1.5"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Roster Setup (Import / Add)
          </a>
        </div>
      </div>

      {/* Summary stat cards */}
      <DashboardStats summary={summary} loading={isLoading} />

      {/* Pending leave banner */}
      {summary?.pending_leaves > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3.5 flex items-center justify-between">
          <p className="text-amber-800 text-sm font-medium">
            🔔 <strong>{summary.pending_leaves}</strong> leave application{summary.pending_leaves > 1 ? 's' : ''} awaiting review
          </p>
          <a href="/dean/leave" className="text-amber-800 text-xs font-bold underline hover:text-amber-950">
            Review now →
          </a>
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2">
          <AttendanceTrendChart data={trend} loading={isLoading} />
        </div>
        <DepartmentChart data={deptStats} loading={isLoading} />
      </div>

      {/* Today's attendance table */}
      <div className="card p-0 overflow-hidden bg-white border border-gray-100 rounded-2xl shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-800">Today&apos;s Attendance Records</h2>
          <div className="flex gap-2">
            <a href="/dean/reports" className="text-sm text-black hover:underline font-semibold">
              Full Report →
            </a>
          </div>
        </div>
        <TodayAttendanceTable records={todayRecs} loading={isLoading} />
      </div>

      {/* Pending leaves */}
      <PendingLeavePanel />
    </div>
  );
}
