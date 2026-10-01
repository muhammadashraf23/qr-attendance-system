'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import api from '@/utils/api';

export default function StudentStipendPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [student, setStudent] = useState<any>({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user_data') || localStorage.getItem('employee_data');
      if (stored) setStudent(JSON.parse(stored));
    } catch (_) {}
  }, []);

  const studentId = student.member_id || student.employee_id || student.roll_number;

  const { data, isLoading } = useQuery({
    queryKey: ['my-stipend', month, year, studentId],
    queryFn: async () => {
      try {
        const { data } = await api.get(`/stipend/report?month=${month}&year=${year}`);
        const mine = data.data?.find((r: any) => (r.member_id || r.employee_id) === studentId);
        return mine || null;
      } catch (err) {
        return null;
      }
    },
    enabled: !!studentId,
  });

  const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });

  return (
    <div className="min-h-screen bg-gray-50 max-w-lg mx-auto pb-20 font-sans">
      {/* Header */}
      <div className="bg-black px-5 pt-12 pb-8 text-white">
        <Link href="/student" className="inline-flex items-center gap-1.5 text-sm opacity-80 hover:opacity-100 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <h1 className="text-2xl font-extrabold">Academic Stipend</h1>
        <p className="text-xs text-zinc-400 mt-1">Research Fellowship / TA Teaching Compensation</p>
      </div>

      <div className="px-4 -mt-3 space-y-4">
        {isLoading ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center animate-pulse">
            <div className="h-10 w-32 bg-gray-100 rounded mx-auto mb-2" />
            <div className="h-4 w-20 bg-gray-100 rounded mx-auto" />
          </div>
        ) : !data ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-zinc-100 text-zinc-900 flex items-center justify-center mx-auto mb-3">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-800 text-base">Standard Academic Enrollee</h3>
            <p className="text-xs text-gray-500 max-w-xs mx-auto mt-1">
              No stipend active for {monthName} {year}. Stipends are assigned to graduate researchers, lab assistants, and teaching fellows.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 text-center">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{monthName} {year} Net Stipend</p>
            <p className="text-4xl font-extrabold text-black mt-2">
              ₹{parseFloat(data.net_salary || data.net_stipend || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <span className="inline-block mt-3 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              {data.status || 'Active'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
