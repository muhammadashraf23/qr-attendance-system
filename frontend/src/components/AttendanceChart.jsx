'use client';

import { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';

const COLORS = { present: '#2E7D32', absent: '#E53935', leave: '#1976D2', late: '#F57C00' };
const PIE_COLORS = ['#2E7D32','#66BB6A','#E53935','#F57C00','#1976D2','#9C27B0','#FF5722','#607D8B'];

function useIsMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

// ── Attendance Trend (30 days) ────────────────────────────────
export function AttendanceTrendChart({ data = [], loading }) {
  const mounted = useIsMounted();
  if (loading || !mounted) return <ChartSkeleton />;

  const formatted = data.map(d => ({
    ...d,
    date: format(new Date(d.date), 'dd MMM'),
  }));

  return (
    <div className="card">
      <h3 className="font-bold text-gray-800 mb-4 text-sm">30-Day Attendance Trend</h3>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={formatted} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#2E7D32" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#2E7D32" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="absentGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#E53935" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#E53935" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
          <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
          />
          <Legend iconType="circle" iconSize={8} />
          <Area type="monotone" dataKey="present" name="Present"
            stroke="#2E7D32" fill="url(#presentGrad)" strokeWidth={2} dot={false} />
          <Area type="monotone" dataKey="absent"  name="Absent"
            stroke="#E53935" fill="url(#absentGrad)" strokeWidth={2} dot={false} />
          <Area type="monotone" dataKey="on_leave" name="On Leave"
            stroke="#1976D2" fill="none" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Department Attendance (Bar chart) ────────────────────────
export function DepartmentChart({ data = [], loading }) {
  const mounted = useIsMounted();
  if (loading || !mounted) return <ChartSkeleton />;

  const formatted = data.map(d => ({
    name: d.name.length > 10 ? d.name.slice(0, 10) + '…' : d.name,
    Total: parseInt(d.total) || 0,
    Present: parseInt(d.present) || 0,
    Absent: (parseInt(d.total) || 0) - (parseInt(d.present) || 0),
  }));

  return (
    <div className="card">
      <h3 className="font-bold text-gray-800 mb-4 text-sm">Department Attendance Today</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={formatted} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                  barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} />
          <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
          />
          <Legend iconType="circle" iconSize={8} />
          <Bar dataKey="Present" fill="#2E7D32" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Absent"  fill="#E53935" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Leave by Type (Pie chart) ─────────────────────────────────
export function LeaveChart({ data = [], loading }) {
  const mounted = useIsMounted();
  if (loading || !mounted) return <ChartSkeleton />;

  const LABELS = { casual: 'Casual', sick: 'Sick', paid: 'Paid', other: 'Other' };
  const pieData = Object.entries(
    data.reduce((acc, d) => {
      acc[d.leave_type] = (acc[d.leave_type] || 0) + 1;
      return acc;
    }, {})
  ).map(([type, count]) => ({ name: LABELS[type] || type, value: count }));

  if (!pieData.length) return (
    <div className="card flex items-center justify-center h-40 text-gray-400 text-sm">
      No leave data to display
    </div>
  );

  return (
    <div className="card">
      <h3 className="font-bold text-gray-800 mb-4 text-sm">Leave by Type (This Month)</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%" cy="50%"
            innerRadius={55} outerRadius={90}
            paddingAngle={3}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {pieData.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
          <Legend iconType="circle" iconSize={8} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="h-4 w-40 bg-gray-100 rounded mb-4" />
      <div className="h-56 bg-gray-50 rounded-xl" />
    </div>
  );
}
