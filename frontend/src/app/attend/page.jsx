'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamicImport from 'next/dynamic';
import QRAttendance from '@/components/QRScanner';

export const dynamic = 'force-dynamic';

// Lazy-load FaceScanner (heavy — loads face-api.js models)
const FaceScanner = dynamicImport(() => import('@/components/FaceScanner'), {
  loading: () => (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="bg-white border border-zinc-200 rounded-3xl p-8 text-center max-w-sm w-full shadow-lg">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-zinc-900 font-medium">Loading Face Recognition AI...</p>
        <p className="text-xs text-zinc-500 mt-1">Downloading ML models (~15 MB)</p>
      </div>
    </div>
  ),
  ssr: false,
});

function AttendPageContent() {
  const params = useSearchParams();
  const [mode, setMode] = useState(params.get('mode') === 'face' ? 'face' : 'qr');

  if (mode === 'face') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <FaceScanner
          onSuccess={(data) => {
            setTimeout(() => setMode('qr'), 3000);
          }}
          onCancel={() => setMode('qr')}
        />
      </div>
    );
  }

  return <QRAttendance />;
}

export default function AttendPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <AttendPageContent />
    </Suspense>
  );
}
