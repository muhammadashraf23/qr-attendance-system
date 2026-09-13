'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { CheckCircle, LogOut, Wifi, WifiOff, MapPin, UserCheck, ShieldCheck, Sparkles, Scan, ArrowRight, Clock } from 'lucide-react';
import api from '@/utils/api';
import Logo from '@/components/shared/Logo';

const STATES = { IDLE: 'idle', LOADING: 'loading', DONE: 'done' };

export default function QRAttendance() {
  const [employeeId, setEmployeeId]   = useState('');
  const [empInfo,    setEmpInfo]      = useState(null);
  const [pageState,  setPageState]    = useState(STATES.IDLE);
  const [result,     setResult]       = useState(null);
  const [now,        setNow]          = useState(null);
  const [mounted,    setMounted]      = useState(false);
  const [online,     setOnline]       = useState(true);
  const [gpsStatus,  setGpsStatus]    = useState('idle');

  // Live clock
  useEffect(() => {
    setMounted(true);
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Online/offline detection
  useEffect(() => {
    const onOnline  = () => { setOnline(true);  syncOfflineRecords(); };
    const onOffline = () => setOnline(false);
    setOnline(navigator.onLine);
    window.addEventListener('online',  onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online',  onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  async function syncOfflineRecords() {
    try {
      const { getPendingRecords, clearPendingRecords } = await import('@/utils/offlineDB');
      const pending = await getPendingRecords();
      if (!pending.length) return;
      const token = localStorage.getItem('employee_token');
      if (!token) return;
      await api.post('/attendance/sync', { records: pending });
      await clearPendingRecords();
      toast.success(`${pending.length} offline record(s) synced!`);
    } catch (_) {}
  }

  // Get GPS coordinates
  function getGPS() {
    return new Promise((resolve) => {
      if (!navigator.geolocation) return resolve({});
      setGpsStatus('getting');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsStatus('ok');
          resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        },
        () => { setGpsStatus('denied'); resolve({}); },
        { timeout: 8000, enableHighAccuracy: true }
      );
    });
  }

  // Look up employee status
  async function lookupEmployee() {
    if (!employeeId.trim()) return toast.error('Enter your Employee ID or phone number.');
    setPageState(STATES.LOADING);
    try {
      const { data } = await api.get(`/attendance/status/${employeeId.trim()}`);
      setEmpInfo(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Employee record not found.');
      setEmpInfo(null);
    } finally {
      setPageState(STATES.IDLE);
    }
  }

  async function handleAction(action) {
    setPageState(STATES.LOADING);
    const location = await getGPS();
    const payload  = {
      employee_id: employeeId.trim(),
      ...location,
      device_id: navigator.userAgent.slice(0, 80),
      method: 'qr',
    };

    if (!online) {
      const { savePendingRecord } = await import('@/utils/offlineDB');
      await savePendingRecord({
        ...payload,
        [`${action === 'checkin' ? 'check_in_time' : 'check_out_time'}`]: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0],
        method: 'offline_sync',
      });
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        await reg.sync?.register('sync-attendance').catch(() => {});
      }
      setResult({ type: action, offline: true, employee_name: empInfo?.employee_name || employeeId });
      setPageState(STATES.DONE);
      return;
    }

    try {
      const endpoint = action === 'checkin' ? '/attendance/check-in' : '/attendance/check-out';
      const { data } = await api.post(endpoint, payload);
      setResult({ type: action, offline: false, ...data.data });
      setPageState(STATES.DONE);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed. Please check network.');
      setPageState(STATES.IDLE);
    }
  }

  function reset() {
    setEmployeeId(''); setEmpInfo(null);
    setResult(null); setPageState(STATES.IDLE); setGpsStatus('idle');
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col justify-between relative overflow-hidden font-sans">

      {/* Top Header Nav */}
      <header className="w-full border-b border-zinc-200 bg-white/80 backdrop-blur-xl sticky top-0 z-50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Logo size={42} />

          <div className="flex items-center gap-4">
            {/* Online/Offline indicator */}
            <span className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
              online
                ? 'bg-zinc-100 text-zinc-900 border-zinc-300'
                : 'bg-zinc-900 text-white border-zinc-700 animate-pulse'
            }`}>
              {online ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              {online ? 'System Online' : 'Offline Mode Buffer'}
            </span>

            <a
              href="/admin"
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-black transition"
            >
              <ShieldCheck className="w-4 h-4" /> Admin Portal
            </a>
          </div>
        </div>
      </header>

      {/* Main Kiosk Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center relative z-10">
        
        {/* Render Done Confirmation Screen */}
        {pageState === STATES.DONE && result ? (
          <div className="w-full max-w-md bg-white border border-zinc-200 rounded-3xl p-8 shadow-xl animate-fade-in text-center">
            <div className={`w-20 h-20 mx-auto mb-5 rounded-2xl flex items-center justify-center shadow-sm ${
              result.type === 'checkin' ? 'bg-black text-white border border-black' : 'bg-zinc-800 text-white border border-zinc-700'
            }`}>
              {result.type === 'checkin' ? <CheckCircle className="w-10 h-10" /> : <LogOut className="w-10 h-10" />}
            </div>

            <h2 className="text-2xl font-extrabold text-zinc-900 mb-1">
              {result.type === 'checkin' ? 'Check-In Recorded!' : 'Check-Out Recorded!'}
            </h2>
            <p className="text-sm text-zinc-500 mb-6">
              {result.offline
                ? '⚡ Saved offline — will automatically sync to database'
                : result.type === 'checkin' ? 'Welcome! Have a productive workday.' : 'Check-out registered. See you tomorrow!'}
            </p>

            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 text-left space-y-3 text-sm mb-6">
              {[
                ['Employee', result.employee_name || result.employee_id],
                ['Date', format(new Date(), 'dd MMMM yyyy')],
                ['Timestamp', format(new Date(), 'hh:mm:ss a')],
                ...(result.is_late ? [['Arrival Status', '⚠️ Marked Late']] : []),
                ...(result.working_hours ? [['Working Hours', result.working_hours]] : []),
                ['Verification', result.offline ? 'Offline Buffer' : 'QR Verification + GPS'],
              ].map(([key, val]) => (
                <div key={key} className="flex justify-between items-center py-1 border-b border-zinc-200 last:border-0">
                  <span className="text-zinc-500 font-medium">{key}</span>
                  <span className="font-semibold text-zinc-900">{val}</span>
                </div>
              ))}
            </div>

            <button
              onClick={reset}
              className="w-full py-3.5 bg-black hover:bg-zinc-800 text-white font-bold rounded-xl transition shadow-sm"
            >
              Done & Return to Kiosk
            </button>
          </div>
        ) : (
          /* Main Dual-Column Layout */
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: SaaS Branding & Live Digital Kiosk Clock */}
            <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 border border-zinc-300 text-zinc-900 text-xs font-semibold mb-4">
                  <Sparkles className="w-3.5 h-3.5 text-zinc-900" /> Academic Attendance SaaS
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-zinc-900 tracking-tight leading-tight">
                  University & College <br />
                  <span className="text-black">
                    Attendance Kiosk
                  </span>
                </h1>
                <p className="text-zinc-600 text-sm sm:text-base mt-3 max-w-md mx-auto lg:mx-0">
                  Touchless student verification with campus GPS geofencing & face recognition scanner.
                </p>
              </div>

              {/* Live Digital Clock Card */}
              <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between text-xs text-zinc-500 mb-2 font-medium">
                  <span className="flex items-center gap-1.5 text-zinc-900 font-semibold">
                    <Clock className="w-4 h-4 text-black" /> Kiosk Clock Engine
                  </span>
                  <span className="bg-zinc-100 px-2.5 py-0.5 rounded-full text-zinc-800 border border-zinc-200">Campus Live Sync</span>
                </div>
                <div className="font-mono text-3xl sm:text-4xl lg:text-5xl font-black text-black tracking-tight">
                  {mounted && now ? format(now, 'hh:mm:ss a') : '--:--:-- --'}
                </div>
                <p className="text-sm font-semibold text-zinc-600 mt-2">
                  {mounted && now ? format(now, 'EEEE, dd MMMM yyyy') : '...'}
                </p>
              </div>

              {/* Quick Navigation Tabs */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <a
                  href="/activate-face"
                  className="flex items-center justify-center gap-2 rounded-2xl p-3.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-800 hover:text-black transition text-xs font-bold group"
                >
                  <Scan className="w-4 h-4 text-black group-hover:scale-110 transition" />
                  <span>1-Click Face Activation</span>
                </a>
                <a
                  href="/admin/roster-import"
                  className="flex items-center justify-center gap-2 rounded-2xl p-3.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-800 hover:text-black transition text-xs font-bold group"
                >
                  <UserCheck className="w-4 h-4 text-black group-hover:scale-110 transition" />
                  <span>CSV Roster Import</span>
                </a>
              </div>
            </div>

            {/* Right Column: Attendance Verification Card */}
            <div className="lg:col-span-7">
              <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-lg relative">
                
                <div className="flex items-center justify-between pb-6 border-b border-zinc-200 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                      <span>Student Verification</span>
                    </h2>
                    <p className="text-xs text-zinc-500 mt-0.5">Enter Student Roll Number or ID to mark attendance</p>
                  </div>
                  <div className="p-2 rounded-xl bg-zinc-100 border border-zinc-300 text-zinc-900">
                    <Scan className="w-5 h-5" />
                  </div>
                </div>

                {/* ID Input Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-2">
                      Student Roll Number / ID
                    </label>
                    <div className="flex gap-3">
                      <input
                        className="flex-1 bg-white border border-zinc-300 focus:border-black focus:ring-2 focus:ring-black/20 rounded-2xl px-4 py-3.5 text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none transition"
                        placeholder="e.g. CS-2026-042 or ATZ-001..."
                        value={employeeId}
                        onChange={e => { setEmployeeId(e.target.value); setEmpInfo(null); }}
                        onKeyDown={e => e.key === 'Enter' && lookupEmployee()}
                        disabled={pageState === STATES.LOADING}
                      />
                      <button
                        onClick={lookupEmployee}
                        disabled={pageState === STATES.LOADING}
                        className="px-6 py-3.5 bg-black hover:bg-zinc-800 text-white font-bold rounded-2xl text-sm transition shadow-sm disabled:opacity-50 flex items-center gap-2"
                      >
                        {pageState === STATES.LOADING ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <span>Find</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* GPS Status Indicator */}
                  {gpsStatus !== 'idle' && (
                    <div className={`flex items-center gap-2 text-xs px-4 py-2.5 rounded-xl border font-medium ${
                      gpsStatus === 'ok' ? 'bg-zinc-100 text-zinc-900 border-zinc-300' :
                      gpsStatus === 'denied' ? 'bg-zinc-200 text-zinc-800 border-zinc-400' :
                      'bg-zinc-100 text-zinc-900 border-zinc-300 animate-pulse'
                    }`}>
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span>
                        {gpsStatus === 'getting' && 'Verifying office GPS geofence coordinates...'}
                        {gpsStatus === 'ok' && 'Office GPS location verified ✓'}
                        {gpsStatus === 'denied' && 'GPS access denied — standard check-in logged'}
                      </span>
                    </div>
                  )}

                  {/* Employee Lookup Result & Action Buttons */}
                  {empInfo && (
                    <div className="animate-fade-in pt-4 border-t border-zinc-200 space-y-4">
                      <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 flex items-center justify-between">
                        <div>
                          <p className="text-xs text-zinc-500 font-medium">Employee Name</p>
                          <p className="text-lg font-bold text-zinc-900">{empInfo.employee_name}</p>
                          <p className="text-xs text-zinc-700 font-mono mt-0.5">{empInfo.employee_id}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          empInfo.status === 'checked_in' ? 'bg-black text-white border border-black' :
                          empInfo.status === 'checked_out' ? 'bg-zinc-200 text-zinc-800 border border-zinc-400' :
                          'bg-zinc-100 text-zinc-700 border border-zinc-300'
                        }`}>
                          {empInfo.status === 'checked_in' ? 'Checked In' : empInfo.status === 'checked_out' ? 'Completed Today' : 'Not Checked In'}
                        </span>
                      </div>

                      {empInfo.status === 'not_checked_in' && (
                        <button
                          onClick={() => handleAction('checkin')}
                          disabled={pageState === STATES.LOADING}
                          className="w-full py-4 bg-black hover:bg-zinc-800 text-white font-extrabold text-lg rounded-2xl transition-all shadow-md active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                          <CheckCircle className="w-6 h-6" />
                          <span>{pageState === STATES.LOADING ? 'Recording Check-In...' : 'CHECK IN NOW'}</span>
                        </button>
                      )}

                      {empInfo.status === 'checked_in' && (
                        <div className="space-y-3">
                          <p className="text-center text-xs text-zinc-600 bg-zinc-100 py-2 rounded-xl border border-zinc-200">
                            ⏱ Checked in at <span className="text-zinc-900 font-bold">{format(new Date(empInfo.check_in_time), 'hh:mm a')}</span>
                          </p>
                          <button
                            onClick={() => handleAction('checkout')}
                            disabled={pageState === STATES.LOADING}
                            className="w-full py-4 bg-zinc-900 hover:bg-black text-white font-extrabold text-lg rounded-2xl transition-all shadow-md active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                          >
                            <LogOut className="w-6 h-6" />
                            <span>{pageState === STATES.LOADING ? 'Recording Check-Out...' : 'CHECK OUT NOW'}</span>
                          </button>
                        </div>
                      )}

                      {empInfo.status === 'checked_out' && (
                        <div className="text-center py-6 bg-zinc-50 border border-zinc-200 rounded-2xl">
                          <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center mx-auto mb-2">
                            <CheckCircle className="w-6 h-6" />
                          </div>
                          <p className="font-bold text-zinc-900">Attendance Completed</p>
                          <p className="text-xs text-zinc-500 mt-1">Check-in and check-out logs recorded for today.</p>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-200 bg-white px-6 py-4 relative z-10 text-xs text-zinc-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 SmartAttendance Cloud (Attendzo). Enterprise SaaS Platform.</p>
          <div className="flex items-center gap-6 font-medium">
            <a href="/attend?mode=face" className="hover:text-black transition">👤 Face Biometrics</a>
            <a href="/login" className="hover:text-black transition">🔑 Portal Login</a>
            <a href="/admin" className="hover:text-black transition">🛡️ HR Admin</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
