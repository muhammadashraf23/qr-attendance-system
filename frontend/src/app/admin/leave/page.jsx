'use client';

import PendingLeavePanel from '@/components/admin/PendingLeavePanel';

export default function AdminLeavePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Leave Approvals</h1>
        <p className="text-sm text-gray-400 mt-0.5">Review and manage pending leave applications</p>
      </div>

      <PendingLeavePanel />
    </div>
  );
}
