'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Calendar, Clock, Wallet, LogOut, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/utils/api';
import Logo from '@/components/shared/Logo';

export default function EmployeeDashboard() {
  const router = useRouter();
  const [employee, setEmployee] = useState(null);
  const [online,   setOnline]   = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('employee_token');
    const data  = localStorage.getItem('employee_data');
    if (!token) { router.replace('/login'); return; }
    if (data) setEmployee(JSON.parse(data));

    setOnline(navigator.onLine);
    const onOnline  = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener('online',  onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online',  onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [router]);

  const { data: todayAtt } = useQuery({
    queryKey: ['today-status'],
    queryFn:  async () => { const { data } = await api.get('/attendance/today'); return data.data; },
    enabled:  !!employee,
  });

  const { data: histData } = useQuery({
    queryKey: ['att-history'],
    queryFn:  async () => {
      const from = format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd');
      const { data } = await api.get(`/attendance/history?from=${from}&limit=30`);
      return data;
    },
    enabled: !!employee,
  });

  const { data: leaveData } = useQuery({
    queryKey: ['my-leaves'],
    queryFn:  async () => { const { data } = await api.get('/leave/my'); return data; },
    enabled:  !!employee,
  });

  function logout() {
    localStorage.removeItem('employee_token');
    localStorage.removeItem('employee_data');
    router.push('/login');
  }

  const records    = histData?.data || [];
  const presentDays = records.filter(r => r.status === 'present').length;
  const lateDays    = records.filter(r => r.is_late).length;
  const leaves      = leaveData?.data || [];
  const balance     = leaveData?.balance;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Top nav */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30 px-4 py-3.5
                         flex items-center justify-between shadow-sm">
        <Logo size={36} />
        <div className="flex items-center gap-3">
          <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium
            ${online ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
            {online ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {online ? 'Online' : 'Offline'}
          </span>
          <button onClick={logout}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-5 pb-24">

        {/* Welcome card */}
        <div className="gradient-brand rounded-3xl p-5 text-white shadow-lg">
          <p className="text-sm opacity-80 font-medium">Welcome back,</p>
          <h1 className="text-2xl font-extrabold mt-0.5">{employee?.full_name}</h1>
          <p className="text-sm opacity-70 mt-0.5">{employee?.employee_id} · {employee?.designation}</p>

          <div className="mt-4 bg-white/15 rounded-2xl p-3.5 flex items-center justify-between">
            <div>
              <p className="text-xs opacity-70">Today</p>
              <p className="font-bold">{format(new Date(), 'EEEE, dd MMM')}</p>
            </div>
            <div className="text-right">
              {todayAtt?.check_in_time ? (
                <>
                  <p className="text-xs opacity-70">Checked in at</p>
                  <p className="font-bold">{format(new Date(todayAtt.check_in_time), 'hh:mm a')}</p>
                </>
              ) : (
                <p className="text-sm opacity-80">Not checked in</p>
              )}
            </div>
          </div>

          <a href="/attend"
             className="mt-3 w-full block text-center bg-white text-brand-primary font-bold
                        py-3 rounded-2xl text-sm hover:bg-brand-light transition">
            {todayAtt?.check_in_time && !todayAtt?.check_out_time
              ? '🚪 Mark Check-Out'
              : todayAtt?.check_out_time
              ? '✅ Attendance Complete'
              : '✅ Mark Attendance'}
          </a>
        </div>

        {/* This month stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Present', value: presentDays, icon: '✅', color: 'text-green-700 bg-green-50' },
            { label: 'Late',    value: lateDays,    icon: '⚠️', color: 'text-amber-700 bg-amber-50' },
            { label: 'Leaves',  value: leaves.filter(l => l.status === 'approved').length,
              icon: '🏖', color: 'text-blue-700 bg-blue-50' },
          ].map(s => (
            <div key={s.label} className={`${s.color} rounded-2xl p-4 text-center`}>
              <p className="text-2xl mb-1">{s.icon}</p>
              <p className="text-2xl font-extrabold">{s.value}</p>
              <p className="text-xs font-semibold opacity-75">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Leave balance */}
        {balance && (
          <div className="card">
            <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-primary" /> Leave Balance
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Casual',  val: balance.casual_leave_balance },
                { label: 'Sick',    val: balance.sick_leave_balance },
                { label: 'Paid',    val: balance.paid_leave_balance },
              ].map(l => (
                <div key={l.label} className="bg-brand-light rounded-xl p-3 text-center">
                  <p className="text-2xl font-extrabold text-brand-primary">{l.val}</p>
                  <p className="text-xs text-brand-secondary font-semibold mt-0.5">{l.label}</p>
                </div>
              ))}
            </div>
            <a href="/employee/leave"
               className="block mt-3 text-center text-sm text-brand-primary font-semibold hover:underline">
              Apply for leave →
            </a>
          </div>
        )}

        {/* Recent attendance */}
        <div className="card p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-primary" /> Recent Attendance
            </h2>
          </div>
          <div className="divide-y divide-gray-50">
            {records.slice(0, 7).map(r => (
              <div key={r.date} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {format(new Date(r.date), 'EEE, dd MMM')}
                  </p>
                  <p className="text-xs text-gray-400">
                    {r.check_in_time ? format(new Date(r.check_in_time), 'hh:mm a') : '—'}
                    {r.check_out_time ? ` → ${format(new Date(r.check_out_time), 'hh:mm a')}` : ''}
                  </p>
                </div>
                <div className="text-right">
                  {r.status === 'present' && !r.is_late && <span className="badge-present">Present</span>}
                  {r.status === 'present' && r.is_late   && <span className="badge-late">Late</span>}
                  {r.status === 'leave'                   && <span className="badge-leave">Leave</span>}
                  {r.status === 'absent'                  && <span className="badge-absent">Absent</span>}
                  {r.working_minutes && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {Math.floor(r.working_minutes/60)}h {r.working_minutes%60}m
                    </p>
                  )}
                </div>
              </div>
            ))}
            {!records.length && (
              <p className="px-5 py-6 text-center text-gray-400 text-sm">No records this month.</p>
            )}
          </div>
        </div>

        {/* Leave requests */}
        {leaves.length > 0 && (
          <div className="card p-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50">
              <h2 className="font-bold text-gray-800">My Leave Requests</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {leaves.slice(0, 4).map(l => (
                <div key={l.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-800 capitalize">{l.leave_type} Leave</p>
                    <p className="text-xs text-gray-400">
                      {format(new Date(l.from_date),'dd MMM')} – {format(new Date(l.to_date),'dd MMM yyyy')}
                      {' '}({l.days_requested}d)
                    </p>
                  </div>
                  <span className={
                    l.status === 'approved' ? 'badge-approved' :
                    l.status === 'rejected' ? 'badge-rejected' : 'badge-pending'
                  }>
                    {l.status.charAt(0).toUpperCase() + l.status.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 flex z-30 shadow-lg">
        {[
          { href: '/employee',       icon: '🏠', label: 'Home'      },
          { href: '/attend',         icon: '📷', label: 'Attend'    },
          { href: '/employee/leave', icon: '📋', label: 'Leave'     },
          { href: '/employee/payroll',icon:'💰', label: 'Salary'   },
        ].map(item => (
          <a key={item.href} href={item.href}
             className="flex-1 flex flex-col items-center py-3 text-gray-400 hover:text-brand-primary transition">
            <span className="text-xl">{item.icon}</span>
            <span className="text-xs mt-0.5 font-medium">{item.label}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}
