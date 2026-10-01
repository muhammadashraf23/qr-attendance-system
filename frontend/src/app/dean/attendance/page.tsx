'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/utils/api';
import TodayAttendanceTable from '@/components/dean/TodayAttendanceTable';

export default function DeanAttendancePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dean-attendance-today'],
    queryFn: async () => {
      const { data } = await api.get('/dean/dashboard');
      return data.data?.today_records || [];
    },
  });

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Campus Attendance Log</h1>
        <p className="text-sm text-gray-400 mt-0.5">Real-time student & faculty attendance records</p>
      </div>

      <div className="card p-0 overflow-hidden bg-white border border-gray-100 rounded-2xl shadow-sm">
        <TodayAttendanceTable records={data || []} loading={isLoading} />
      </div>
    </div>
  );
}
