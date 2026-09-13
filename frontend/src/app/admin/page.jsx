'use client';

import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { RefreshCw, Download, UserPlus } from 'lucide-react';
import api from '@/utils/api';
import DashboardStats from '@/components/DashboardStats';
import { AttendanceTrendChart, DepartmentChart, LeaveChart } from '@/components/AttendanceChart';
import TodayAttendanceTable from '@/components/admin/TodayAttendanceTable';
import PendingLeavePanel from '@/components/admin/PendingLeavePanel';

export default function AdminDashboard() {
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn:  async () => {
      const { data } = await api.get('/admin/dashboard');
      return data.data;
    },
    refetchInterval: 60_000,  // auto-refresh every 60s
  });

  const summary    = data?.summary;
  const trend      = data?.attendance_trend     || [];
  const deptStats  = data?.department_stats     || [];
  const todayRecs  = data?.today_records        || [];

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {format(new Date(), "EEEE, dd MMMM yyyy")} · Live attendance overview
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-1.5 btn-secondary text-sm py-2 px-3"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <a href="/admin/roster-import" className="bg-black hover:bg-zinc-800 text-white font-bold text-sm py-2 px-3.5 rounded-xl transition shadow-sm flex items-center gap-1.5">
            <UserPlus className="w-3.5 h-3.5" />
            Roster Setup (Import / Add)
          </a>
        </div>
      </div>

      {/* Summary stat cards */}
      <DashboardStats summary={summary} loading={isLoading} />

      {/* Pending leave banner */}
      {summary?.pending_leaves > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3.5
                        flex items-center justify-between">
          <p className="text-amber-800 text-sm font-medium">
            🔔 <strong>{summary.pending_leaves}</strong> leave request{summary.pending_leaves > 1 ? 's' : ''} awaiting your review
          </p>
          <a href="/admin/leave" className="text-amber-700 text-xs font-bold underline">
            Review now →
          </a>
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2">
          <AttendanceTrendChart data={trend}     loading={isLoading} />
        </div>
        <DepartmentChart data={deptStats} loading={isLoading} />
      </div>

      {/* Today's attendance table */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-800">Today&apos;s Attendance</h2>
          <div className="flex gap-2">
            <a href="/admin/reports" className="text-sm text-brand-primary hover:underline font-medium">
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
