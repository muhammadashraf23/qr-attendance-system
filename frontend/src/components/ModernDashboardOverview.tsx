'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import DefaulterRadar from './DefaulterRadar';
import AttendanceHeatmap from './AttendanceHeatmap';
import LiveAttendanceStream from './LiveAttendanceStream';
import DynamicQrDisplay from './DynamicQrDisplay';

export type OperatingMode = 'ACADEMIC' | 'CORPORATE';

export default function ModernDashboardOverview() {
  const [mode, setMode] = useState<OperatingMode>('ACADEMIC');
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'RADAR' | 'STREAM' | 'QR'>('OVERVIEW');

  return (
    <div className="space-y-8">
      {/* Top Banner & Mode Toggle */}
      <div className="bg-gradient-to-r from-gray-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/10 text-xs font-semibold tracking-wide text-indigo-300 mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Enterprise Attendance Engine 2.0
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {mode === 'ACADEMIC' ? 'University Academic Command Center' : 'Enterprise Workforce & Geofence Hub'}
            </h1>
            <p className="text-gray-300 text-sm mt-1 max-w-2xl">
              {mode === 'ACADEMIC'
                ? 'Managing attendance compliance, mandatory 75% exam eligibility radar, and lecture dynamic rotating QR codes across colleges & faculties.'
                : 'Real-time multi-branch clock-in/out, GPS geofencing radius validation, biometric face verification, and payroll work-hour logs.'}
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="bg-black/40 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 flex items-center shrink-0 self-start lg:self-auto">
            <button
              onClick={() => setMode('ACADEMIC')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition duration-150 ${
                mode === 'ACADEMIC'
                  ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M12 14l9-5-9-5-9 5 9 5z" />
                <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
              Academic Campus
            </button>
            <button
              onClick={() => setMode('CORPORATE')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition duration-150 ${
                mode === 'CORPORATE'
                  ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Corporate Office
            </button>
          </div>
        </div>

        {/* Quick KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10">
          <div>
            <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">
              {mode === 'ACADEMIC' ? 'Active Students' : 'Total Employees'}
            </span>
            <div className="text-2xl font-black mt-0.5">{mode === 'ACADEMIC' ? '1,420' : '348'}</div>
            <span className="text-[11px] text-emerald-400">98.2% registered</span>
          </div>

          <div>
            <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Today Presence</span>
            <div className="text-2xl font-black mt-0.5">{mode === 'ACADEMIC' ? '89.4%' : '94.1%'}</div>
            <span className="text-[11px] text-emerald-400">+2.4% vs last week</span>
          </div>

          <div>
            <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">
              {mode === 'ACADEMIC' ? 'Defaulters (<75%)' : 'Overtime Logged'}
            </span>
            <div className="text-2xl font-black mt-0.5 text-amber-300">
              {mode === 'ACADEMIC' ? '18 Students' : '42.5 hrs'}
            </div>
            <span className="text-[11px] text-amber-400">Requires review</span>
          </div>

          <div>
            <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Proxy Defense</span>
            <div className="text-2xl font-black mt-0.5 text-emerald-400">0 Breaches</div>
            <span className="text-[11px] text-emerald-400">Dynamic 6s TOTP active</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`py-3 px-5 text-sm font-bold border-b-2 transition ${
            activeTab === 'OVERVIEW'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Comprehensive Overview
        </button>
        <button
          onClick={() => setActiveTab('RADAR')}
          className={`py-3 px-5 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'RADAR'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Defaulter Radar (75% Rule)
          <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-bold">18</span>
        </button>
        <button
          onClick={() => setActiveTab('STREAM')}
          className={`py-3 px-5 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'STREAM'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Real-time Telemetry Stream
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </button>
        <button
          onClick={() => setActiveTab('QR')}
          className={`py-3 px-5 text-sm font-bold border-b-2 transition ${
            activeTab === 'QR'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Dynamic Anti-Proxy QR
        </button>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-8">
          {/* Quick Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/teacher/lecture-qr"
              className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-200 transition group"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition">Broadcast Lecture QR</h3>
              <p className="text-xs text-gray-500 mt-1">Generate 6-second dynamic code for classroom projector</p>
            </Link>

            <Link
              href="/attend"
              className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-200 transition group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 group-hover:text-emerald-600 transition">Scan & Punch In</h3>
              <p className="text-xs text-gray-500 mt-1">Student/Employee camera scan with instant GPS check</p>
            </Link>

            <Link
              href="/activate-face"
              className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-purple-200 transition group"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 group-hover:text-purple-600 transition">Biometric Enrollment</h3>
              <p className="text-xs text-gray-500 mt-1">128D Face Descriptor enrollment via WebCam</p>
            </Link>

            <Link
              href="/admin/roster-import"
              className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-sky-200 transition group"
            >
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 group-hover:text-sky-600 transition">Bulk Roster CSV</h3>
              <p className="text-xs text-gray-500 mt-1">Import 5,000+ students or corporate employees</p>
            </Link>
          </div>

          {/* Activity Heatmap */}
          <AttendanceHeatmap />

          {/* Split Row: Defaulter Radar & Live Stream */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <DefaulterRadar />
            </div>
            <div>
              <LiveAttendanceStream />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'RADAR' && <DefaulterRadar />}
      {activeTab === 'STREAM' && <LiveAttendanceStream />}
      {activeTab === 'QR' && (
        <div className="max-w-xl mx-auto py-4">
          <DynamicQrDisplay
            sessionTitle="Advanced Algorithms & Optimization"
            sessionCode="CS301-LEC04"
            courseOrDept="Faculty of Computer Science & AI"
            expectedAttendeesCount={50}
            scannedCount={38}
            geofenceEnabled={true}
          />
        </div>
      )}
    </div>
  );
}
