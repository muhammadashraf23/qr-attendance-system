'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ArrowLeft, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import api from '@/utils/api';

const LEAVE_TYPES = [
  { value: 'casual', label: '🌤 Casual Leave', desc: 'Personal short breaks' },
  { value: 'medical', label: '🏥 Medical Leave', desc: 'Health / doctor certified absence' },
  { value: 'official', label: '🏛 Official Leave', desc: 'Academic conferences or sports duty' },
  { value: 'other', label: '📋 Other Leave', desc: 'Any other approved institution reason' },
];

export default function StudentLeaveApplyPage() {
  const qc = useQueryClient();

  const [form, setForm] = useState({
    leave_type: 'casual',
    from_date: '',
    to_date: '',
    reason: '',
  });

  const { data: leaveData } = useQuery({
    queryKey: ['my-leaves'],
    queryFn: async () => {
      const { data } = await api.get('/leave/my');
      return data;
    },
  });

  const applyMutation = useMutation({
    mutationFn: (payload: any) => api.post('/leave/apply', payload),
    onSuccess: () => {
      toast.success('Leave application submitted for faculty review!');
      setForm({ leave_type: 'casual', from_date: '', to_date: '', reason: '' });
      qc.invalidateQueries({ queryKey: ['my-leaves'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Submission failed.'),
  });

  const daysDiff = form.from_date && form.to_date
    ? Math.max(1, Math.floor((new Date(form.to_date).getTime() - new Date(form.from_date).getTime()) / 86_400_000) + 1)
    : 0;

  const balance = leaveData?.balance;
  const requests = leaveData?.data || [];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.from_date || !form.to_date || !form.reason.trim())
      return toast.error('Please fill in all fields.');
    if (new Date(form.to_date) < new Date(form.from_date))
      return toast.error('End date must be after start date.');
    applyMutation.mutate(form);
  }

  return (
    <div className="min-h-screen bg-gray-50 max-w-lg mx-auto pb-20 font-sans">
      {/* Header */}
      <div className="bg-black px-5 pt-12 pb-6 text-white">
        <Link href="/student" className="inline-flex items-center gap-1.5 text-sm opacity-80 hover:opacity-100 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <h1 className="text-2xl font-extrabold">Academic Leave</h1>
        <p className="text-xs opacity-75 mt-1">Submit and track official leave applications</p>
      </div>

      <div className="px-4 -mt-3 space-y-4">
        {/* Leave balance cards */}
        {balance && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Available Quota</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Casual', bal: balance.casual_leave_balance },
                { label: 'Medical', bal: balance.medical_leave_balance || balance.sick_leave_balance },
                { label: 'Official', bal: balance.official_leave_balance || balance.paid_leave_balance },
              ].map(b => (
                <div key={b.label} className="bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-center">
                  <p className="text-2xl font-extrabold text-zinc-900">{b.bal ?? 0}</p>
                  <p className="text-xs font-semibold text-zinc-500 mt-0.5">{b.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Application form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
          <h2 className="font-bold text-gray-800">Apply for Leave</h2>

          {/* Leave type */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Leave Type</label>
            <div className="grid grid-cols-2 gap-2">
              {LEAVE_TYPES.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, leave_type: t.value }))}
                  className={`text-left px-3 py-2.5 rounded-xl border-2 transition-all ${
                    form.leave_type === t.value
                      ? 'border-black bg-zinc-100 text-black'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <p className="text-xs font-bold text-gray-800">{t.label}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">From Date</label>
              <input
                type="date"
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                min={format(new Date(), 'yyyy-MM-dd')}
                value={form.from_date}
                onChange={e => setForm(f => ({ ...f, from_date: e.target.value, to_date: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">To Date</label>
              <input
                type="date"
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                min={form.from_date || format(new Date(), 'yyyy-MM-dd')}
                value={form.to_date}
                onChange={e => setForm(f => ({ ...f, to_date: e.target.value }))}
                required
              />
            </div>
          </div>

          {daysDiff > 0 && (
            <div className="bg-zinc-100 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-black font-bold">
              📅 {daysDiff} day{daysDiff > 1 ? 's' : ''} requested
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Reason for Absence</label>
            <textarea
              className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black resize-none"
              rows={3}
              placeholder="Provide reason for dean/faculty record..."
              value={form.reason}
              onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
              required
            />
          </div>

          <button
            type="submit"
            disabled={applyMutation.isPending}
            className="w-full py-3 bg-black hover:bg-zinc-800 text-white font-extrabold text-sm rounded-xl transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {applyMutation.isPending ? 'Submitting...' : 'Submit Leave Application'}
          </button>
        </form>

        {/* Past requests */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <h2 className="font-bold text-gray-800 text-sm">Past Leave History</h2>
          </div>
          {!requests.length ? (
            <p className="text-center text-gray-400 text-xs py-8">No leave requests submitted yet.</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {requests.map((r: any) => (
                <div key={r.id || r._id} className="px-5 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-800 capitalize">
                        {r.leave_type} Leave
                      </p>
                      <p className="text-xs text-gray-400">
                        {format(new Date(r.from_date), 'dd MMM')} – {format(new Date(r.to_date), 'dd MMM yyyy')}
                        {' '}({r.days_requested}d)
                      </p>
                      {r.reviewer_comment && (
                        <p className="text-xs text-gray-500 mt-1 italic">&quot;{r.reviewer_comment}&quot;</p>
                      )}
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      r.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                      r.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {r.status?.charAt(0).toUpperCase() + r.status?.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
