'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/utils/api';
import TodayAttendanceTable from '@/components/admin/TodayAttendanceTable';

export default function AdminAttendancePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-attendance-today'],
    queryFn: async () => {
      const { data } = await api.get('/admin/dashboard');
      return data.data?.today_records || [];
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Attendance Log</h1>
        <p className="text-sm text-gray-400 mt-0.5">Real-time attendance records</p>
      </div>

      <div className="card p-0 overflow-hidden">
        <TodayAttendanceTable records={data || []} loading={isLoading} />
      </div>
    </div>
  );
}

