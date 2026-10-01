'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Calendar, Clock, LogOut, Wifi, WifiOff, QrCode, Scan, GraduationCap } from 'lucide-react';
import api from '@/utils/api';
import Logo from '@/components/shared/Logo';

export default function StudentDashboard() {
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('user_token') || localStorage.getItem('employee_token');
    const data  = localStorage.getItem('user_data')  || localStorage.getItem('employee_data');
    if (!token) { router.replace('/login'); return; }
    if (data) {
      try {
        setStudent(JSON.parse(data));
      } catch (_) {}
    }

    setOnline(navigator.onLine);
    const onOnline  = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [router]);

  const { data: todayAtt } = useQuery({
    queryKey: ['today-status'],
    queryFn: async () => {
      const { data } = await api.get('/attendance/today');
      return data.data;
    },
    enabled: !!student,
  });

  const { data: histData } = useQuery({
    queryKey: ['att-history'],
    queryFn: async () => {
      const from = format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd');
      const { data } = await api.get(`/attendance/history?from=${from}&limit=30`);
      return data;
    },
    enabled: !!student,
  });

  const { data: leaveData } = useQuery({
    queryKey: ['my-leaves'],
    queryFn: async () => {
      const { data } = await api.get('/leave/my');
      return data;
    },
    enabled: !!student,
  });

  function logout() {
    localStorage.removeItem('user_token');
    localStorage.removeItem('employee_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('employee_data');
    router.push('/login');
  }

  const records = histData?.data || [];
  const presentDays = records.filter((r: any) => r.status === 'present').length;
  const lateDays = records.filter((r: any) => r.is_late).length;
  const leaves = leaveData?.data || [];
  const balance = leaveData?.balance;

  const clockIn = todayAtt?.clock_in_time || todayAtt?.check_in_time;
  const clockOut = todayAtt?.clock_out_time || todayAtt?.check_out_time;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Top nav */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30 px-4 py-3.5 flex items-center justify-between shadow-sm">
        <Logo size={36} />
        <div className="flex items-center gap-3">
          <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
            online ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
          }`}>
            {online ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {online ? 'Online' : 'Offline'}
          </span>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-5 pb-24">
        {/* Welcome card */}
        <div className="bg-black rounded-3xl p-5 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-zinc-400 font-bold flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5" /> Student Portal
            </span>
            <span className="text-xs font-mono text-zinc-400">
              {student?.member_id || student?.employee_id || student?.roll_number}
            </span>
          </div>

          <h1 className="text-2xl font-extrabold mt-2">{student?.full_name || student?.name}</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            {student?.department_name || student?.department || 'Department of Computer Science'}
          </p>

          <div className="mt-4 bg-white/10 backdrop-blur-md rounded-2xl p-3.5 flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-400">Today</p>
              <p className="font-bold">{format(new Date(), 'EEEE, dd MMM')}</p>
            </div>
            <div className="text-right">
              {clockIn ? (
                <>
                  <p className="text-xs text-zinc-400">Recorded at</p>
                  <p className="font-bold text-emerald-400">{format(new Date(clockIn), 'hh:mm a')}</p>
                </>
              ) : (
                <p className="text-xs text-amber-300 font-semibold">Not scanned today</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3">
            <a
              href="/attend"
              className="block text-center bg-white text-black font-extrabold py-3 rounded-xl text-xs hover:bg-zinc-100 transition shadow-sm flex items-center justify-center gap-1.5"
            >
              <QrCode className="w-4 h-4" />
              <span>Kiosk Check-In</span>
            </a>
            <a
              href="/activate-face"
              className="block text-center bg-zinc-800 text-white font-extrabold py-3 rounded-xl text-xs hover:bg-zinc-700 transition flex items-center justify-center gap-1.5 border border-zinc-700"
            >
              <Scan className="w-4 h-4" />
              <span>Face ID Setup</span>
            </a>
          </div>
        </div>

        {/* This month stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Attended', value: presentDays, icon: '✅', color: 'bg-white border border-gray-200 text-zinc-900' },
            { label: 'Late', value: lateDays, icon: '⚠️', color: 'bg-white border border-gray-200 text-zinc-800' },
            { label: 'Leaves', value: leaves.filter((l: any) => l.status === 'approved').length, icon: '🏖', color: 'bg-white border border-gray-200 text-zinc-900' },
          ].map(s => (
            <div key={s.label} className={`${s.color} rounded-2xl p-4 text-center shadow-sm`}>
              <p className="text-xl mb-1">{s.icon}</p>
              <p className="text-2xl font-extrabold">{s.value}</p>
              <p className="text-xs font-semibold text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Leave balance */}
        {balance && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-black" /> Academic Leave Quota
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Casual', val: balance.casual_leave_balance },
                { label: 'Medical', val: balance.medical_leave_balance || balance.sick_leave_balance },
                { label: 'Official', val: balance.official_leave_balance || balance.paid_leave_balance },
              ].map(l => (
                <div key={l.label} className="bg-zinc-50 rounded-xl p-3 text-center border border-zinc-200">
                  <p className="text-2xl font-extrabold text-zinc-900">{l.val ?? 0}</p>
                  <p className="text-xs text-zinc-500 font-semibold mt-0.5">{l.label}</p>
                </div>
              ))}
            </div>
            <a
              href="/student/leave"
              className="block mt-3 text-center text-xs text-black font-bold hover:underline"
            >
              Apply for leave →
            </a>
          </div>
        )}

        {/* Recent attendance history */}
        <div className="bg-white rounded-2xl border border-gray-100 p-0 overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-bold text-gray-800 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-black" /> Attendance Log
            </h2>
            <span className="text-xs text-gray-400 font-medium">Last 30 Days</span>
          </div>
          <div className="divide-y divide-gray-50">
            {records.slice(0, 7).map((r: any) => {
              const recIn = r.clock_in_time || r.check_in_time;
              const recOut = r.clock_out_time || r.check_out_time;

              return (
                <div key={r.date} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {format(new Date(r.date), 'EEE, dd MMM yyyy')}
                    </p>
                    <p className="text-xs text-gray-400 font-mono">
                      {recIn ? format(new Date(recIn), 'hh:mm a') : '—'}
                      {recOut ? ` → ${format(new Date(recOut), 'hh:mm a')}` : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    {r.status === 'present' && !r.is_late && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">Present</span>
                    )}
                    {r.status === 'present' && r.is_late && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">Late</span>
                    )}
                    {r.status === 'leave' && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700">Leave</span>
                    )}
                    {r.status === 'absent' && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">Absent</span>
                    )}
                  </div>
                </div>
              );
            })}
            {!records.length && (
              <p className="px-5 py-6 text-center text-gray-400 text-sm">No records found for this period.</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom mobile navigation */}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 flex z-30 shadow-lg">
        {[
          { href: '/student',        icon: '🏠', label: 'Home' },
          { href: '/attend',         icon: '📷', label: 'Kiosk' },
          { href: '/student/leave',  icon: '📋', label: 'Leave' },
          { href: '/student/stipend',icon: '💰', label: 'Stipend' },
        ].map(item => (
          <a
            key={item.href}
            href={item.href}
            className="flex-1 flex flex-col items-center py-3 text-gray-500 hover:text-black transition"
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-[11px] mt-0.5 font-bold">{item.label}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}
