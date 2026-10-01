'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserPlus, Users, Search, RefreshCw, GraduationCap, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import api from '@/utils/api';

export default function DeanMembersPage() {
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'student' | 'teacher'>('all');

  const { data: members = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ['dean-members'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/dean/members');
        return data.data || [];
      } catch (err: any) {
        if (err.response?.status === 404) {
          const { data } = await api.get('/admin/employees');
          return data.data || [];
        }
        throw err;
      }
    },
  });

  const filteredMembers = members.filter((m: any) => {
    const name = (m.name || m.full_name || '').toLowerCase();
    const id = (m.roll_number || m.employee_id || '').toLowerCase();
    const dept = (m.department || m.department_name || '').toLowerCase();
    const matchesSearch = name.includes(search.toLowerCase()) || id.includes(search.toLowerCase()) || dept.includes(search.toLowerCase());
    
    if (filterRole === 'all') return matchesSearch;
    if (filterRole === 'student') {
      const isStudent = m.role === 'student' || (!m.role?.includes('teacher') && !m.designation?.toLowerCase().includes('faculty'));
      return matchesSearch && isStudent;
    }
    if (filterRole === 'teacher') {
      const isTeacher = m.role === 'teacher' || m.designation?.toLowerCase().includes('faculty') || m.designation?.toLowerCase().includes('teacher');
      return matchesSearch && isTeacher;
    }
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Academic Directory</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage student rolls, faculty staff, and enrolled academic profiles</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-zinc-700 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            href="/dean/roster-import"
            className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-zinc-800 text-white font-bold text-xs rounded-xl transition shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>Enroll / Import Members</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by name, roll number, or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-zinc-100 rounded-xl border border-zinc-200 self-stretch sm:self-auto">
          <button
            onClick={() => setFilterRole('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              filterRole === 'all' ? 'bg-black text-white shadow-sm' : 'text-zinc-600 hover:text-black'
            }`}
          >
            All Members
          </button>
          <button
            onClick={() => setFilterRole('student')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              filterRole === 'student' ? 'bg-black text-white shadow-sm' : 'text-zinc-600 hover:text-black'
            }`}
          >
            Students
          </button>
          <button
            onClick={() => setFilterRole('teacher')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              filterRole === 'teacher' ? 'bg-black text-white shadow-sm' : 'text-zinc-600 hover:text-black'
            }`}
          >
            Faculty
          </button>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-zinc-400 font-medium">Loading academic directory...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
            <h3 className="font-bold text-zinc-800 text-sm">No members found</h3>
            <p className="text-xs text-zinc-500 mt-1">Try adjusting your search criteria or enroll new members.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Member Profile</th>
                  <th className="py-3.5 px-6">Roll / ID</th>
                  <th className="py-3.5 px-6">Department</th>
                  <th className="py-3.5 px-6">Designation / Year</th>
                  <th className="py-3.5 px-6">Face Biometrics</th>
                  <th className="py-3.5 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredMembers.map((m: any, idx: number) => {
                  const isTeacher = m.role === 'teacher' || m.designation?.toLowerCase().includes('faculty') || m.designation?.toLowerCase().includes('teacher');
                  return (
                    <tr key={m.id || idx} className="hover:bg-zinc-50/50 transition">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                            isTeacher ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-900 border border-zinc-200'
                          }`}>
                            {isTeacher ? <ShieldCheck className="w-4 h-4" /> : <GraduationCap className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="font-bold text-zinc-900">{m.name || m.full_name || 'Academic Member'}</p>
                            <p className="text-xs text-zinc-500">{m.email || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono text-xs font-bold text-zinc-700">
                        {m.roll_number || m.employee_id || '—'}
                      </td>
                      <td className="py-4 px-6 text-xs text-zinc-600 font-medium">
                        {m.department || m.department_name || 'General Academic'}
                      </td>
                      <td className="py-4 px-6 text-xs text-zinc-600">
                        {m.designation || (isTeacher ? 'Faculty Member' : 'Student')}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          m.face_registered || m.face_vector
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                        }`}>
                          {m.face_registered || m.face_vector ? '✓ Enrolled' : 'Not Set'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-zinc-100 text-zinc-800 border border-zinc-200">
                          Active
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
