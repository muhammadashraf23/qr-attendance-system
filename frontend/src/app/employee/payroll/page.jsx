'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ArrowLeft, TrendingUp, TrendingDown, IndianRupee } from 'lucide-react';
import Link from 'next/link';
import api from '@/utils/api';

export default function EmployeePayrollPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year,  setYear]  = useState(now.getFullYear());
  const [employee, setEmployee] = useState({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem('employee_data');
      if (stored) setEmployee(JSON.parse(stored));
    } catch (_) {}
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['my-payroll', month, year, employee?.employee_id],
    queryFn:  async () => {
      const { data } = await api.get(`/payroll/report?month=${month}&year=${year}`);
      const mine = data.data?.find(r => r.employee_id === employee.employee_id);
      return mine || null;
    },
    enabled: !!employee?.employee_id,
  });

  const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });

  return (
    <div className="min-h-screen bg-gray-50 max-w-lg mx-auto pb-20">
      {/* Header */}
      <div className="bg-black px-5 pt-12 pb-8 text-white">
        <Link href="/employee" className="inline-flex items-center gap-1.5 text-sm opacity-80 hover:opacity-100 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <h1 className="text-2xl font-extrabold">Salary Summary</h1>

        {/* Month picker */}
        <div className="flex gap-2 mt-4">
          <select
            className="bg-white/20 text-white rounded-xl px-3 py-2 text-sm font-semibold
                       border border-white/30 focus:outline-none"
            value={month}
            onChange={e => setMonth(Number(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i+1} value={i+1} className="text-gray-800">
                {new Date(2000, i).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
          <select
            className="bg-white/20 text-white rounded-xl px-3 py-2 text-sm font-semibold
                       border border-white/30 focus:outline-none"
            value={year}
            onChange={e => setYear(Number(e.target.value))}
          >
            {[now.getFullYear() - 1, now.getFullYear()].map(y => (
              <option key={y} value={y} className="text-gray-800">{y}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="px-4 -mt-3 space-y-4">
        {isLoading && (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center animate-pulse">
            <div className="h-16 w-40 bg-gray-100 rounded mx-auto mb-3" />
            <div className="h-4 w-24 bg-gray-100 rounded mx-auto" />
          </div>
        )}

        {!isLoading && !data && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <p className="text-4xl mb-3">📊</p>
            <p className="font-semibold text-gray-700">No payroll generated yet</p>
            <p className="text-sm text-gray-400 mt-1">For {monthName} {year}</p>
          </div>
        )}

        {data && (
          <>
            {/* Net salary hero */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 text-center">
              <p className="text-sm text-gray-400 font-medium">{monthName} {year} Net Salary</p>
              <p className="text-5xl font-extrabold text-black mt-2 flex items-center justify-center gap-1">
                <IndianRupee className="w-9 h-9 text-black" />
                {parseFloat(data.net_salary).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
              <div className={`inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full text-xs font-semibold ${
                data.status === 'paid' ? 'bg-black text-white border border-black' :
                data.status === 'finalized' ? 'bg-zinc-200 text-zinc-900 border border-zinc-300' :
                'bg-zinc-100 text-zinc-800 border border-zinc-300'
              }`}>
                {data.status === 'paid' ? '✅ Paid' :
                 data.status === 'finalized' ? '🔒 Finalized' : '📋 Draft'}
              </div>
            </div>

            {/* Attendance summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h2 className="font-bold text-gray-800 mb-3">Attendance Summary</h2>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Working Days', val: data.working_days,  color: 'text-gray-700' },
                  { label: 'Present',      val: data.present_days,  color: 'text-zinc-900' },
                  { label: 'Absent',       val: data.absent_days,   color: 'text-zinc-900 font-bold' },
                  { label: 'Leave Days',   val: data.leave_days,    color: 'text-zinc-800' },
                ].map(s => (
                  <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className={`text-2xl font-extrabold ${s.color}`}>{s.val}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Earnings / Deductions breakdown */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50">
                <h2 className="font-bold text-gray-800">Pay Breakdown</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {[
                  { label: 'Base Salary',     val: data.base_salary,     type: 'credit' },
                  { label: 'Overtime Bonus',  val: data.overtime_bonus,  type: 'credit' },
                  { label: 'Other Allowances',val: data.other_allowances,type: 'credit' },
                  { label: 'Late Deduction',  val: data.late_deduction,  type: 'debit'  },
                  { label: 'Absent Deduction',
                    val: ((parseFloat(data.base_salary) / data.working_days) * data.absent_days).toFixed(2),
                    type: 'debit' },
                  { label: 'Other Deductions',val: data.other_deductions,type: 'debit'  },
                ].filter(r => parseFloat(r.val) > 0).map(row => (
                  <div key={row.label} className="px-5 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {row.type === 'credit'
                        ? <TrendingUp className="w-4 h-4 text-black" />
                        : <TrendingDown className="w-4 h-4 text-zinc-500" />}
                      <span className="text-sm text-gray-700">{row.label}</span>
                    </div>
                    <span className={`text-sm font-semibold ${
                      row.type === 'credit' ? 'text-black font-bold' : 'text-zinc-600'
                    }`}>
                      {row.type === 'debit' ? '- ' : '+ '}
                      ₹{parseFloat(row.val).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}

                {/* Net total */}
                <div className="px-5 py-4 bg-zinc-100 border-t border-zinc-200 flex items-center justify-between">
                  <span className="font-bold text-black">Net Salary</span>
                  <span className="text-lg font-extrabold text-black">
                    ₹{parseFloat(data.net_salary).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
