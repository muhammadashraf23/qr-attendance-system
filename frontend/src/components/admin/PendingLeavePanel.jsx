'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle } from 'lucide-react';
import api from '@/utils/api';

const LEAVE_LABELS = {
  casual: '🌤 Casual', sick: '🤒 Sick', paid: '🌴 Paid', other: '📋 Other',
};

export default function PendingLeavePanel() {
  const qc = useQueryClient();
  const [rejectNote, setRejectNote] = useState({});
  const [showReject, setShowReject] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['pending-leaves'],
    queryFn:  async () => {
      const { data } = await api.get('/admin/leave?status=pending');
      return data.data;
    },
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, action, comment }) =>
      api.patch(`/admin/leave/${id}/review`, { action, comment }),
    onSuccess: (_, vars) => {
      toast.success(`Leave ${vars.action === 'approve' ? 'approved' : 'rejected'}.`);
      qc.invalidateQueries(['pending-leaves']);
      qc.invalidateQueries(['admin-dashboard']);
      setShowReject(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Action failed.'),
  });

  if (isLoading) return (
    <div className="card animate-pulse">
      <div className="h-5 w-40 bg-gray-100 rounded mb-4" />
      <div className="space-y-3">
        {[1,2].map(i => <div key={i} className="h-20 bg-gray-50 rounded-xl" />)}
      </div>
    </div>
  );

  if (!data?.length) return (
    <div className="card text-center py-10">
      <p className="text-3xl mb-2">🎉</p>
      <p className="font-semibold text-gray-700">No pending leave requests</p>
      <p className="text-sm text-gray-400 mt-1">All caught up!</p>
    </div>
  );

  return (
    <div className="card p-0 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="font-bold text-gray-800">
          Pending Leave Requests
          <span className="ml-2 bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">
            {data.length}
          </span>
        </h2>
      </div>

      <div className="divide-y divide-gray-50">
        {data.map(req => (
          <div key={req.id} className="px-6 py-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-gray-800">{req.full_name}</p>
                <p className="text-xs text-gray-400">{req.employee_id} · {req.department}</p>
              </div>
              <span className="px-3 py-1 bg-brand-light text-brand-primary text-xs font-semibold rounded-full">
                {LEAVE_LABELS[req.leave_type] || req.leave_type}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-3 text-sm">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">From</p>
                <p className="font-semibold text-gray-700">{format(new Date(req.from_date), 'dd MMM yyyy')}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">To</p>
                <p className="font-semibold text-gray-700">{format(new Date(req.to_date), 'dd MMM yyyy')}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Days</p>
                <p className="font-semibold text-gray-700">{req.days_requested}</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 mt-2">
              <span className="text-gray-400">Reason: </span>{req.reason}
            </p>

            <div className="flex flex-wrap gap-2 mt-3">
              <button
                onClick={() => reviewMutation.mutate({ id: req.id, action: 'approve', comment: 'Approved' })}
                disabled={reviewMutation.isPending}
                className="flex items-center gap-1.5 px-4 py-2 bg-green-500 hover:bg-green-600
                           text-white text-sm font-semibold rounded-xl transition disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" /> Approve
              </button>
              <button
                onClick={() => setShowReject(showReject === req.id ? null : req.id)}
                className="flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100
                           text-red-600 text-sm font-semibold rounded-xl transition"
              >
                <XCircle className="w-4 h-4" /> Reject
              </button>
            </div>

            {showReject === req.id && (
              <div className="flex gap-2 mt-2 animate-fade-in">
                <input
                  className="input flex-1 text-sm"
                  placeholder="Rejection reason (required)..."
                  value={rejectNote[req.id] || ''}
                  onChange={e => setRejectNote(n => ({ ...n, [req.id]: e.target.value }))}
                />
                <button
                  onClick={() => {
                    if (!rejectNote[req.id]?.trim()) return toast.error('Reason required.');
                    reviewMutation.mutate({ id: req.id, action: 'reject', comment: rejectNote[req.id] });
                  }}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm
                             font-semibold rounded-xl transition"
                >
                  Confirm
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
