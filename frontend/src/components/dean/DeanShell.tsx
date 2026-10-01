'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, Users, Calendar, FileBarChart2,
  Wallet, LogOut, Menu, X, ChevronRight,
  Clock, Bell, Upload,
} from 'lucide-react';
import Logo from '@/components/shared/Logo';

const NAV = [
  { href: '/dean',               icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dean/roster-import', icon: Upload,          label: 'Roster Import' },
  { href: '/dean/members',       icon: Users,           label: 'Students & Faculty' },
  { href: '/dean/attendance',    icon: Calendar,        label: 'Attendance' },
  { href: '/dean/leave',         icon: Clock,           label: 'Leave' },
  { href: '/dean/stipend',       icon: Wallet,          label: 'Stipend' },
  { href: '/dean/reports',       icon: FileBarChart2,   label: 'Reports' },
];

export default function DeanShell({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [staff,   setStaff]   = useState<any>(null);
  const [open,    setOpen]    = useState(false);
  const [formattedDate, setFormattedDate] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('staff_token') || localStorage.getItem('admin_token');
    const data  = localStorage.getItem('staff_data')  || localStorage.getItem('admin_data');
    if (!token) { router.replace('/login'); return; }
    if (data) {
      try {
        setStaff(JSON.parse(data));
      } catch (_) {}
    }

    setFormattedDate(
      new Date().toLocaleDateString('en-US', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      })
    );
  }, [router]);

  function logout() {
    localStorage.removeItem('staff_token');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('staff_data');
    localStorage.removeItem('admin_data');
    router.push('/login');
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100
        flex flex-col shadow-lg transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:shadow-none
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100">
          <Logo size={40} />
          <button onClick={() => setOpen(false)} className="lg:hidden text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {NAV.map(item => {
            const active = pathname === item.href ||
              (item.href !== '/dean' && pathname.startsWith(item.href));
            const Icon   = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium
                  transition-all group ${
                  active
                    ? 'bg-black text-white font-semibold shadow-sm'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-white' : ''}`} />
                {item.label}
                {active && <ChevronRight className="w-3.5 h-3.5 ml-auto text-white" />}
              </Link>
            );
          })}
        </nav>

        {/* Staff profile + logout */}
        <div className="px-4 py-4 border-t border-gray-100">
          {staff && (
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {(staff.full_name || staff.name || 'D').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{staff.full_name || staff.name || 'Dean'}</p>
                <p className="text-xs text-gray-400 capitalize">{staff.role?.replace('_', ' ') || 'Dean'}</p>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500
                       hover:bg-red-50 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* ── Main content ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-5 py-3.5
                           flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen(true)}
                    className="lg:hidden text-gray-500 hover:text-gray-800">
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <p className="text-sm text-gray-500 font-medium">
                {formattedDate}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-gray-400 hover:text-gray-700 transition">
              <Bell className="w-5 h-5" />
            </button>
            <span className="text-sm font-semibold text-gray-700 hidden sm:block">
              {staff?.full_name || staff?.name || 'Dean Portal'}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-5 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
