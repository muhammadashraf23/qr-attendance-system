'use client';

import { FileBarChart2 } from 'lucide-react';

export default function AdminReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Attendance Reports</h1>
        <p className="text-sm text-gray-400 mt-0.5">Export workforce metrics and monthly logs</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <FileBarChart2 className="w-12 h-12 text-brand-primary mx-auto mb-3 opacity-80" />
        <h2 className="text-lg font-bold text-gray-800">Reports & Analytics</h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto mt-1">
          Generate CSV and PDF summaries for attendance records and employee performance.
        </p>
      </div>
    </div>
  );
}
