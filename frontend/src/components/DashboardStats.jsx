'use client';

import { Users, UserCheck, UserX, Clock, TrendingUp, Calendar, AlertCircle } from 'lucide-react';

const CARDS = [
  { key: 'total',         label: 'Total Employees', icon: Users,      color: 'blue'  },
  { key: 'present',       label: 'Present Today',   icon: UserCheck,  color: 'green' },
  { key: 'absent',        label: 'Absent Today',    icon: UserX,      color: 'red'   },
  { key: 'late',          label: 'Late Arrivals',   icon: Clock,      color: 'amber' },
  { key: 'on_leave',      label: 'On Leave',        icon: Calendar,   color: 'indigo'},
  { key: 'pending_leaves',label: 'Pending Leaves',  icon: AlertCircle,color: 'orange'},
];

const COLOR_MAP = {
  blue:   { bg: 'bg-blue-50',   text: 'text-blue-700',   icon: 'text-blue-500',   border: 'border-blue-100' },
  green:  { bg: 'bg-green-50',  text: 'text-green-700',  icon: 'text-green-500',  border: 'border-green-100' },
  red:    { bg: 'bg-red-50',    text: 'text-red-700',    icon: 'text-red-500',    border: 'border-red-100' },
  amber:  { bg: 'bg-amber-50',  text: 'text-amber-700',  icon: 'text-amber-500',  border: 'border-amber-100' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', icon: 'text-indigo-500', border: 'border-indigo-100' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-700', icon: 'text-orange-500', border: 'border-orange-100' },
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
