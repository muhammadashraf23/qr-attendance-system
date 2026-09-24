'use client';

import React, { useState, useEffect } from 'react';

export interface AttendanceEvent {
  id: string;
  name: string;
  role: 'Student' | 'Faculty' | 'Employee' | 'Manager';
  department: string;
  timestamp: string;
  method: 'Dynamic QR' | 'Biometric Face' | 'Geofence Auto-Sync' | 'Manual Override';
  status: 'VERIFIED' | 'LATE' | 'FLAGGED_PROXIMITY' | 'SUSPECT_PROXY';
  accuracyMeters?: number;
}

const INITIAL_EVENTS: AttendanceEvent[] = [
  { id: 'evt-101', name: 'Ayesha Khan', role: 'Student', department: 'BS Computer Science - Semester 6', timestamp: 'Just now', method: 'Dynamic QR', status: 'VERIFIED', accuracyMeters: 4.2 },
  { id: 'evt-102', name: 'Hamza Farooq', role: 'Employee', department: 'DevOps & Infrastructure', timestamp: '1 min ago', method: 'Biometric Face', status: 'VERIFIED', accuracyMeters: 2.1 },
  { id: 'evt-103', name: 'Zubair Ahmed', role: 'Student', department: 'Electrical Engineering - Year 3', timestamp: '2 mins ago', method: 'Dynamic QR', status: 'LATE', accuracyMeters: 6.8 },
  { id: 'evt-104', name: 'Fatima Noor', role: 'Faculty', department: 'Department of Data Science', timestamp: '4 mins ago', method: 'Biometric Face', status: 'VERIFIED', accuracyMeters: 1.5 },
  { id: 'evt-105', name: 'Bilal Tariq', role: 'Employee', department: 'Financial Operations', timestamp: '6 mins ago', method: 'Dynamic QR', status: 'SUSPECT_PROXY', accuracyMeters: 240.0 }
];

export default function LiveAttendanceStream() {
  const [events, setEvents] = useState<AttendanceEvent[]>(INITIAL_EVENTS);
  const [isLive, setIsLive] = useState(true);

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="w-3 h-3 bg-emerald-500 rounded-full inline-block animate-ping absolute top-0 left-0"></span>
            <span className="w-3 h-3 bg-emerald-600 rounded-full inline-block relative"></span>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-base">Real-time Check-In Stream</h3>
            <p className="text-xs text-gray-500">Live multi-device ingest: Dynamic QR &amp; Face biometrics</p>
          </div>
        </div>

        <button
          onClick={() => setIsLive(!isLive)}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200"
        >
          {isLive ? 'Live Ingesting' : 'Paused'}
        </button>
      </div>

      <div className="divide-y divide-gray-50 mt-4 max-h-[360px] overflow-y-auto">
        {events.map((evt) => (
          <div key={evt.id} className="py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gray-100 font-bold text-xs flex items-center justify-center text-gray-700">
                {evt.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 text-xs">{evt.name}</span>
                  <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium">{evt.role}</span>
                </div>
                <p className="text-[11px] text-gray-500">{evt.department}</p>
              </div>
            </div>

            <div className="text-right">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${evt.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {evt.status}
              </span>
              <p className="text-[10px] text-gray-400 mt-0.5">{evt.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
