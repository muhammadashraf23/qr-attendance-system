'use client';

import React, { useState } from 'react';
import { AlertCircle, Download, Search, ShieldAlert, CheckCircle2, ChevronRight } from 'lucide-react';
import type { DefaulterStudent } from '@/types';

const MOCK_DEFAULTERS: DefaulterStudent[] = [
  { id: 1, name: 'Zainab Qazi', roll_number: 'CS-2023-014', department: 'Computer Science', semester: '6th', total_lectures: 48, attended_lectures: 29, percentage: 60.4, is_defaulter: true, parent_email: 'parent.qazi@example.com' },
  { id: 2, name: 'Bilal Farooq', roll_number: 'CS-2023-089', department: 'Computer Science', semester: '6th', total_lectures: 48, attended_lectures: 32, percentage: 66.6, is_defaulter: true, parent_email: 'farooq.family@example.com' },
  { id: 3, name: 'Hamza Sheikh', roll_number: 'EE-2022-031', department: 'Electrical Engineering', semester: '8th', total_lectures: 52, attended_lectures: 35, percentage: 67.3, is_defaulter: true, parent_email: 'sheikh.h@example.com' },
  { id: 4, name: 'Ayesha Siddiqui', roll_number: 'SE-2024-112', department: 'Software Engineering', semester: '4th', total_lectures: 40, attended_lectures: 28, percentage: 70.0, is_defaulter: true, parent_email: 'siddiqui.a@example.com' },
  { id: 5, name: 'Taimur Khan', roll_number: 'AI-2023-005', department: 'Artificial Intelligence', semester: '6th', total_lectures: 44, attended_lectures: 31, percentage: 70.4, is_defaulter: true, parent_email: 'tkhan.parent@example.com' },
  { id: 6, name: 'Dua Zahra', roll_number: 'CS-2023-066', department: 'Computer Science', semester: '6th', total_lectures: 48, attended_lectures: 37, percentage: 77.0, is_defaulter: false, parent_email: 'zahra.d@example.com' },
];

export default function DefaulterRadar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [filterThreshold, setFilterThreshold] = useState<number>(75);

  const filteredList = MOCK_DEFAULTERS.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.roll_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'ALL' || s.department === selectedDept;
    const isUnderThreshold = s.percentage < filterThreshold;
    return matchesSearch && matchesDept && isUnderThreshold;
  });

  const exportCSV = () => {
    const header = 'Roll No,Name,Department,Semester,Attended,Total,Percentage,Exam Status\n';
    const rows = filteredList
      .map(
        (s) =>
          `"${s.roll_number}","${s.name}","${s.department}","${s.semester}",${s.attended_lectures},${s.total_lectures},${s.percentage}%,"${s.percentage < 75 ? 'DEBARRED FROM EXAMS' : 'ELIGIBLE'}"`
      )
      .join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `exam_defaulters_report_<${filterThreshold}pct.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">Academic Defaulter Radar</h2>
            <p className="text-xs text-gray-500">
              Mandatory <strong className="text-amber-700">75% attendance threshold</strong> audit for exam hall admittance
            </p>
          </div>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold transition shadow-sm"
        >
          <Download className="w-4 h-4" />
          Export Exam Debar List (.CSV)
        </button>
      </div>

      {/* Filter Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-5">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by student or roll number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600"
          />
        </div>

        <div>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full py-2.5 px-3 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600"
          >
            <option value="ALL">All Faculties &amp; Departments</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Electrical Engineering">Electrical Engineering</option>
            <option value="Software Engineering">Software Engineering</option>
            <option value="Artificial Intelligence">Artificial Intelligence</option>
          </select>
        </div>

        <div>
          <select
            value={filterThreshold}
            onChange={(e) => setFilterThreshold(Number(e.target.value))}
            className="w-full py-2.5 px-3 text-xs bg-amber-50 border border-amber-200 rounded-xl text-amber-900 font-semibold focus:outline-none"
          >
            <option value={75}>Strict Rule: Under 75% (Exam Debarred)</option>
            <option value={70}>Severe Crisis: Under 70% Defaulters</option>
            <option value={80}>Early Warning: Under 80% Buffer</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 text-[11px] font-bold uppercase tracking-wider text-gray-400">
              <th className="py-3 px-3">Student</th>
              <th className="py-3 px-3">Roll Number</th>
              <th className="py-3 px-3">Department</th>
              <th className="py-3 px-3">Lectures</th>
              <th className="py-3 px-3">Attendance</th>
              <th className="py-3 px-3 text-right">Exam Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-xs">
            {filteredList.map((st) => {
              const isDebarred = st.percentage < 75;
              return (
                <tr key={st.id} className="hover:bg-gray-50/70 transition">
                  <td className="py-3.5 px-3 font-semibold text-gray-900">{st.name}</td>
                  <td className="py-3.5 px-3 font-mono text-gray-600">{st.roll_number}</td>
                  <td className="py-3.5 px-3 text-gray-500">{st.department} · {st.semester}</td>
                  <td className="py-3.5 px-3 text-gray-700">{st.attended_lectures} / {st.total_lectures}</td>
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isDebarred ? 'bg-red-500' : 'bg-emerald-500'}`}
                          style={{ width: `${Math.min(st.percentage, 100)}%` }}
                        />
                      </div>
                      <span className={`font-bold ${isDebarred ? 'text-red-600' : 'text-emerald-600'}`}>
                        {st.percentage}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    {isDebarred ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-700 font-bold text-[10px]">
                        <AlertCircle className="w-3 h-3" />
                        DEBARRED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                        <CheckCircle2 className="w-3 h-3" />
                        ELIGIBLE
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
