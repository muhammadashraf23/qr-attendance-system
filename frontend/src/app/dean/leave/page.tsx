'use client';

import PendingLeavePanel from '@/components/dean/PendingLeavePanel';

export default function DeanLeavePage() {
  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Academic Leave Approvals</h1>
        <p className="text-sm text-gray-500 mt-0.5">Review and manage student & faculty leave applications</p>
      </div>

      <PendingLeavePanel />
    </div>
  );
}
