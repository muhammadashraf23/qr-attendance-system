'use client';

import { useRouter } from 'next/navigation';
import { Sparkles, QrCode, Scan, ShieldCheck, ArrowRight, CheckCircle2, Clock, Users, GraduationCap, BookOpen, MapPin, Award } from 'lucide-react';
import Logo from '@/components/shared/Logo';

export default function SaaSLandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-10 w-[350px] h-[350px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <header className="w-full border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Logo size={42} showText={true} />

          <div className="flex items-center gap-3">
            <a
              href="/register"
              className="text-xs font-semibold text-slate-300 hover:text-white px-3.5 py-2 rounded-xl transition hover:bg-slate-800/60"
            >
              Unified Signup
            </a>
            <a
              href="/login"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" /> Sign In
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 relative z-10 space-y-16">
        
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold tracking-wide">
            <Sparkles className="w-4 h-4" /> Attendzo Academic SaaS Platform
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            Touchless Attendance & <br />
            <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Academic Defaulter Analytics
            </span>
          </h1>

          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            The next-generation cloud attendance platform for Colleges & Universities. Features subject-wise lecture QR codes, 1-click selfie face activation, and campus GPS geofencing.
          </p>

          {/* Quick CTA Gateway Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => router.push('/activate-face')}
              className="px-6 py-4 bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 text-white font-extrabold text-sm rounded-2xl transition shadow-xl shadow-emerald-600/30 flex items-center gap-2"
            >
              <Scan className="w-5 h-5" />
              <span>1-Click Student Face Activation</span>
            </button>

            <button
              onClick={() => router.push('/teacher/lecture-qr')}
              className="px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm rounded-2xl transition shadow-xl shadow-indigo-600/30 flex items-center gap-2"
            >
              <BookOpen className="w-5 h-5" />
              <span>Teacher Lecture QR Kiosk</span>
            </button>

            <button
              onClick={() => router.push('/admin')}
              className="px-6 py-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-sm rounded-2xl transition flex items-center gap-2"
            >
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              <span>Admin Portal</span>
            </button>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'Subject Lecture QR',
              subtitle: 'Option B Classroom Kiosk',
              desc: 'Teachers generate live timed QR codes for specific lectures (CS101 Algorithms) with session countdown timers.',
              icon: QrCode,
              color: 'text-indigo-400',
              bg: 'bg-indigo-500/10 border-indigo-500/20',
            },
            {
              title: '1-Click Face Activation',
              subtitle: 'Zero Long Forms',
              desc: 'Students enter Roll Number, confirm identity, and snap a 3-second camera selfie to register Face ID.',
              icon: Scan,
              color: 'text-emerald-400',
              bg: 'bg-emerald-500/10 border-emerald-500/20',
            },
            {
              title: 'Campus GPS Geofence',
              subtitle: 'Haversine Validation',
              desc: 'Server-side GPS distance calculation ensures attendance is marked strictly within campus boundaries.',
              icon: MapPin,
              color: 'text-cyan-400',
              bg: 'bg-cyan-500/10 border-cyan-500/20',
            },
            {
              title: '75% Defaulter Alert',
              subtitle: 'Exam Eligibility Rule',
              desc: 'Real-time subject attendance % tracking with automated defaulter alerts for students below the 75% rule.',
              icon: Award,
              color: 'text-amber-400',
              bg: 'bg-amber-500/10 border-amber-500/20',
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-slate-900/80 border border-slate-800 backdrop-blur-xl rounded-3xl p-6 shadow-xl hover:border-slate-700 transition space-y-4"
              >
                <div className={`w-12 h-12 rounded-2xl ${item.bg} border flex items-center justify-center ${item.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{item.subtitle}</span>
                  <h3 className="text-lg font-bold text-white mt-0.5">{item.title}</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* 3-Role Gateway Cards */}
        <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="text-2xl font-extrabold text-white">Select Your Academic Portal Gateway</h2>
            <p className="text-xs text-slate-400 mt-1">Direct access tailored for Students, Teachers, and Institution Deans.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Student Card */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 text-center space-y-4 hover:border-cyan-500/50 transition group">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto group-hover:scale-110 transition">
                <GraduationCap className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Student Portal</h3>
                <p className="text-xs text-slate-400 mt-1">1-Click Face Activation, Scan Lecture QR, and check subject attendance %.</p>
              </div>
              <button
                onClick={() => router.push('/activate-face')}
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <span>Student Face Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Teacher Card */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 text-center space-y-4 hover:border-indigo-500/50 transition group">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto group-hover:scale-110 transition">
                <BookOpen className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Teacher / Faculty Kiosk</h3>
                <p className="text-xs text-slate-400 mt-1">Select subject course (CS101), generate lecture QR, & view live class feed.</p>
              </div>
              <button
                onClick={() => router.push('/teacher/lecture-qr')}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <span>Teacher Lecture Kiosk</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Dean / Admin Card */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 text-center space-y-4 hover:border-emerald-500/50 transition group">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto group-hover:scale-110 transition">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Dean & HR Admin Portal</h3>
                <p className="text-xs text-slate-400 mt-1">Manage CSV rosters, campus GPS geofence, and 75% defaulter reports.</p>
              </div>
              <button
                onClick={() => router.push('/admin')}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <span>Admin Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-slate-900/60 backdrop-blur-xl px-6 py-6 text-xs text-slate-400 relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Attendzo — Academic SaaS Platform (University & College Attendance).</p>
          <div className="flex items-center gap-6">
            <a href="/activate-face" className="hover:text-indigo-400 transition">1-Click Face Activation</a>
            <a href="/teacher/lecture-qr" className="hover:text-indigo-400 transition">Teacher QR Kiosk</a>
            <a href="/admin/roster-import" className="hover:text-indigo-400 transition">CSV Roster Import</a>
            <a href="/admin" className="hover:text-indigo-400 transition">Admin Portal</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
