'use client';

import { Users, UserCheck, UserX, Clock, TrendingUp, Calendar, AlertCircle } from 'lucide-react';

const CARDS = [
  { key: 'total',         label: 'Total Employees', icon: Users,      color: 'zinc'  },
  { key: 'present',       label: 'Present Today',   icon: UserCheck,  color: 'green' },
  { key: 'absent',        label: 'Absent Today',    icon: UserX,      color: 'red'   },
  { key: 'late',          label: 'Late Arrivals',   icon: Clock,      color: 'amber' },
  { key: 'on_leave',      label: 'On Leave',        icon: Calendar,   color: 'dark'  },
  { key: 'pending_leaves',label: 'Pending Leaves',  icon: AlertCircle,color: 'orange'},
];

const COLOR_MAP = {
  zinc:   { bg: 'bg-zinc-100',   text: 'text-zinc-900',   icon: 'text-zinc-900',   border: 'border-zinc-300' },
  green:  { bg: 'bg-green-50',  text: 'text-green-800',  icon: 'text-green-600',  border: 'border-green-200' },
  red:    { bg: 'bg-red-50',    text: 'text-red-800',    icon: 'text-red-600',    border: 'border-red-200' },
  amber:  { bg: 'bg-amber-50',  text: 'text-amber-800',  icon: 'text-amber-600',  border: 'border-amber-200' },
  dark:   { bg: 'bg-zinc-900',  text: 'text-white',      icon: 'text-zinc-300',   border: 'border-zinc-800' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-800', icon: 'text-orange-600', border: 'border-orange-200' },
};

export default function DashboardStats({ summary, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {CARDS.map(c => (
          <div key={c.key} className="card animate-pulse">
            <div className="h-8 w-8 bg-gray-100 rounded-lg mb-3" />
            <div className="h-7 w-12 bg-gray-100 rounded mb-2" />
            <div className="h-4 w-20 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const attendance_rate = summary?.total > 0
    ? Math.round((summary.present / summary.total) * 100)
    : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {CARDS.map(card => {
        const colors = COLOR_MAP[card.color];
        const Icon   = card.icon;
        const value  = summary?.[card.key] ?? '—';
        return (
          <div
            key={card.key}
            className={`rounded-2xl border ${colors.border} ${colors.bg} p-5
                        flex flex-col gap-1 hover:shadow-md transition-shadow`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center
                            bg-white/70 mb-1 shadow-sm`}>
              <Icon className={`w-5 h-5 ${colors.icon}`} />
            </div>
            <span className={`text-3xl font-extrabold ${colors.text}`}>
              {value}
            </span>
            <span className={`text-xs font-semibold ${colors.text} opacity-75`}>
              {card.label}
            </span>
            {card.key === 'present' && summary?.total > 0 && (
              <span className="text-xs text-gray-400 mt-0.5">{attendance_rate}% rate</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
