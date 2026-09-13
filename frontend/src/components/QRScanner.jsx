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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Nav */}
      <header className="w-full border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Logo size={42} showText={true} />

          <div className="flex items-center gap-4">
            {/* Online/Offline indicator */}
            <span className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
              online
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse'
            }`}>
              {online ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              {online ? 'System Online' : 'Offline Mode Buffer'}
            </span>

            <a
              href="/admin"
              className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-indigo-400 transition"
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
          <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl animate-fade-in text-center">
            <div className={`w-20 h-20 mx-auto mb-5 rounded-2xl flex items-center justify-center shadow-lg ${
              result.type === 'checkin' ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400' : 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
            }`}>
              {result.type === 'checkin' ? <CheckCircle className="w-10 h-10" /> : <LogOut className="w-10 h-10" />}
            </div>

            <h2 className="text-2xl font-extrabold text-white mb-1">
              {result.type === 'checkin' ? 'Check-In Recorded!' : 'Check-Out Recorded!'}
            </h2>
            <p className="text-sm text-slate-400 mb-6">
              {result.offline
                ? '⚡ Saved offline — will automatically sync to database'
                : result.type === 'checkin' ? 'Welcome! Have a productive workday.' : 'Check-out registered. See you tomorrow!'}
            </p>

            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 text-left space-y-3 text-sm mb-6">
              {[
                ['Employee', result.employee_name || result.employee_id],
                ['Date', format(new Date(), 'dd MMMM yyyy')],
                ['Timestamp', format(new Date(), 'hh:mm:ss a')],
                ...(result.is_late ? [['Arrival Status', '⚠️ Marked Late']] : []),
                ...(result.working_hours ? [['Working Hours', result.working_hours]] : []),
                ['Verification', result.offline ? 'Offline Buffer' : 'QR Verification + GPS'],
              ].map(([key, val]) => (
                <div key={key} className="flex justify-between items-center py-1 border-b border-slate-700/40 last:border-0">
                  <span className="text-slate-400 font-medium">{key}</span>
                  <span className="font-semibold text-slate-100">{val}</span>
                </div>
              ))}
            </div>

            <button
              onClick={reset}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition shadow-lg shadow-indigo-600/30"
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
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-4">
                  <Sparkles className="w-3.5 h-3.5" /> Academic Attendance SaaS
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                  University & College <br />
                  <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                    Attendance Kiosk
                  </span>
                </h1>
                <p className="text-slate-400 text-sm sm:text-base mt-3 max-w-md mx-auto lg:mx-0">
                  Touchless student verification with campus GPS geofencing & face recognition scanner.
                </p>
              </div>

              {/* Live Digital Clock Card */}
              <div className="bg-slate-900/80 border border-slate-800 backdrop-blur-xl rounded-3xl p-6 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-medium">
                  <span className="flex items-center gap-1.5 text-indigo-400 font-semibold">
                    <Clock className="w-4 h-4" /> Kiosk Clock Engine
                  </span>
                  <span className="bg-slate-800 px-2.5 py-0.5 rounded-full text-slate-300">Campus Live Sync</span>
                </div>
                <div className="font-mono text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight text-gradient">
                  {mounted && now ? format(now, 'hh:mm:ss a') : '--:--:-- --'}
                </div>
                <p className="text-sm font-semibold text-slate-400 mt-2">
                  {mounted && now ? format(now, 'EEEE, dd MMMM yyyy') : '...'}
                </p>
              </div>

              {/* Quick Navigation Tabs */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <a
                  href="/activate-face"
                  className="flex items-center justify-center gap-2 rounded-2xl p-3.5 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition text-xs font-bold group"
                >
                  <Scan className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition" />
                  <span>1-Click Face Activation</span>
                </a>
                <a
                  href="/admin/roster-import"
                  className="flex items-center justify-center gap-2 rounded-2xl p-3.5 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition text-xs font-bold group"
                >
                  <UserCheck className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition" />
                  <span>CSV Roster Import</span>
                </a>
              </div>
            </div>

            {/* Right Column: Attendance Verification Card */}
            <div className="lg:col-span-7">
              <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-2xl relative">
                
                <div className="flex items-center justify-between pb-6 border-b border-slate-800 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <span>Student Verification</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">Enter Student Roll Number or ID to mark attendance</p>
                  </div>
                  <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                    <Scan className="w-5 h-5" />
                  </div>
                </div>

                {/* ID Input Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                      Student Roll Number / ID
                    </label>
                    <div className="flex gap-3">
                      <input
                        className="flex-1 bg-slate-950/80 border border-slate-700/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 rounded-2xl px-4 py-3.5 text-base text-white placeholder:text-slate-500 focus:outline-none transition"
                        placeholder="e.g. CS-2026-042 or ATZ-001..."
                        value={employeeId}
                        onChange={e => { setEmployeeId(e.target.value); setEmpInfo(null); }}
                        onKeyDown={e => e.key === 'Enter' && lookupEmployee()}
                        disabled={pageState === STATES.LOADING}
                      />
                      <button
                        onClick={lookupEmployee}
                        disabled={pageState === STATES.LOADING}
                        className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-sm transition shadow-lg shadow-indigo-600/30 disabled:opacity-50 flex items-center gap-2"
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
                      gpsStatus === 'ok' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                      gpsStatus === 'denied' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                      'bg-indigo-500/10 text-indigo-400 border-indigo-500/30 animate-pulse'
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
                    <div className="animate-fade-in pt-4 border-t border-slate-800/80 space-y-4">
                      <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                        <div>
                          <p className="text-xs text-slate-400 font-medium">Employee Name</p>
                          <p className="text-lg font-bold text-white">{empInfo.employee_name}</p>
                          <p className="text-xs text-indigo-400 font-mono mt-0.5">{empInfo.employee_id}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          empInfo.status === 'checked_in' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                          empInfo.status === 'checked_out' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' :
                          'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}>
                          {empInfo.status === 'checked_in' ? 'Checked In' : empInfo.status === 'checked_out' ? 'Completed Today' : 'Not Checked In'}
                        </span>
                      </div>

                      {empInfo.status === 'not_checked_in' && (
                        <button
                          onClick={() => handleAction('checkin')}
                          disabled={pageState === STATES.LOADING}
                          className="w-full py-4 bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-extrabold text-lg rounded-2xl transition-all shadow-xl shadow-indigo-600/30 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                          <CheckCircle className="w-6 h-6" />
                          <span>{pageState === STATES.LOADING ? 'Recording Check-In...' : 'CHECK IN NOW'}</span>
                        </button>
                      )}

                      {empInfo.status === 'checked_in' && (
                        <div className="space-y-3">
                          <p className="text-center text-xs text-slate-400 bg-slate-800/40 py-2 rounded-xl border border-slate-800">
                            ⏱ Checked in at <span className="text-emerald-400 font-bold">{format(new Date(empInfo.check_in_time), 'hh:mm a')}</span>
                          </p>
                          <button
                            onClick={() => handleAction('checkout')}
                            disabled={pageState === STATES.LOADING}
                            className="w-full py-4 bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-extrabold text-lg rounded-2xl transition-all shadow-xl shadow-amber-600/30 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                          >
                            <LogOut className="w-6 h-6" />
                            <span>{pageState === STATES.LOADING ? 'Recording Check-Out...' : 'CHECK OUT NOW'}</span>
                          </button>
                        </div>
                      )}

                      {empInfo.status === 'checked_out' && (
                        <div className="text-center py-6 bg-slate-950/40 border border-slate-800/80 rounded-2xl">
                          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                            <CheckCircle className="w-6 h-6" />
                          </div>
                          <p className="font-bold text-white">Attendance Completed</p>
                          <p className="text-xs text-slate-400 mt-1">Check-in and check-out logs recorded for today.</p>
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
      <footer className="w-full border-t border-slate-800/80 bg-slate-900/60 backdrop-blur-xl px-6 py-4 relative z-10 text-xs text-slate-400">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 SmartAttendance Cloud (Attendzo). Enterprise SaaS Platform.</p>
          <div className="flex items-center gap-6">
            <a href="/attend?mode=face" className="hover:text-indigo-400 transition">👤 Face Biometrics</a>
            <a href="/login" className="hover:text-indigo-400 transition">🔑 Portal Login</a>
            <a href="/admin" className="hover:text-indigo-400 transition">🛡️ HR Admin</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
