'use client';

import { useRouter } from 'next/navigation';
import { Sparkles, QrCode, Scan, ShieldCheck, ArrowRight, CheckCircle2, Clock, Users, GraduationCap, BookOpen, MapPin, Award } from 'lucide-react';
import Logo from '@/components/shared/Logo';

export default function SaaSLandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Top Navbar */}
      <header className="w-full border-b border-zinc-200 bg-white/80 backdrop-blur-xl sticky top-0 z-50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Logo size={42} />

          <div className="flex items-center gap-3">
            <a
              href="/register"
              className="text-xs font-semibold text-zinc-600 hover:text-black px-3.5 py-2 rounded-xl transition hover:bg-zinc-100"
            >
              Sign Up
            </a>
            <a
              href="/login"
              className="px-4 py-2 bg-black hover:bg-zinc-800 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" /> Sign In
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 relative z-10 space-y-16">
        
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-100 border border-zinc-300 text-zinc-900 text-xs font-bold tracking-wide">
            <Sparkles className="w-4 h-4 text-black" /> Attendance System for Universities & Colleges
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-zinc-900 tracking-tight leading-tight">
            Smart Attendance & <br />
            <span className="text-black">
              Defaulter Analytics
            </span>
          </h1>

          <p className="text-zinc-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Attendance platform for colleges and universities. Generate subject-wise lecture QR codes, register face ID, and verify campus location.
          </p>

          {/* Quick CTA Gateway Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => router.push('/activate-face')}
              className="px-6 py-4 bg-black hover:bg-zinc-800 text-white font-extrabold text-sm rounded-2xl transition shadow-md flex items-center gap-2"
            >
              <Scan className="w-5 h-5" />
              <span>Student Face Activation</span>
            </button>

            <button
              onClick={() => router.push('/teacher/lecture-qr')}
              className="px-6 py-4 bg-zinc-900 hover:bg-black text-white font-extrabold text-sm rounded-2xl transition shadow-md flex items-center gap-2"
            >
              <BookOpen className="w-5 h-5" />
              <span>Teacher Lecture QR</span>
            </button>

            <button
              onClick={() => router.push('/admin')}
              className="px-6 py-4 bg-white hover:bg-zinc-100 border border-zinc-300 text-zinc-900 font-bold text-sm rounded-2xl transition flex items-center gap-2"
            >
              <ShieldCheck className="w-5 h-5 text-black" />
              <span>Admin Portal</span>
            </button>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'Subject Lecture QR',
              subtitle: 'Classroom QR',
              desc: 'Teachers generate live timed QR codes for specific lectures (CS101 Algorithms) with session countdown timers.',
              icon: QrCode,
              color: 'text-black',
              bg: 'bg-zinc-100 border-zinc-300',
            },
            {
              title: 'Face ID Setup',
              subtitle: 'Touchless Scan',
              desc: 'Students enter Roll Number, confirm identity, and snap a quick camera selfie to register Face ID.',
              icon: Scan,
              color: 'text-black',
              bg: 'bg-zinc-100 border-zinc-300',
            },
            {
              title: 'Campus GPS Geofence',
              subtitle: 'Location Check',
              desc: 'Server-side GPS distance calculation ensures attendance is marked strictly within campus boundaries.',
              icon: MapPin,
              color: 'text-black',
              bg: 'bg-zinc-100 border-zinc-300',
            },
            {
              title: '75% Defaulter Alert',
              subtitle: 'Exam Eligibility',
              desc: 'Real-time subject attendance % tracking with automated defaulter alerts for students below the 75% rule.',
              icon: Award,
              color: 'text-black',
              bg: 'bg-zinc-100 border-zinc-300',
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm hover:border-zinc-400 transition space-y-4"
              >
                <div className={`w-12 h-12 rounded-2xl ${item.bg} border flex items-center justify-center ${item.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{item.subtitle}</span>
                  <h3 className="text-lg font-bold text-zinc-900 mt-0.5">{item.title}</h3>
                  <p className="text-xs text-zinc-500 mt-2 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* 3-Role Gateway Cards */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-lg">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="text-2xl font-extrabold text-zinc-900">Select Your Portal</h2>
            <p className="text-xs text-zinc-500 mt-1">Direct access tailored for Students, Teachers, and Institution Deans.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Student Card */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6 text-center space-y-4 hover:border-zinc-400 transition group">
              <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center mx-auto group-hover:scale-110 transition">
                <GraduationCap className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900">Student Portal</h3>
                <p className="text-xs text-zinc-500 mt-1">Activate Face ID, scan lecture QR codes, and view your attendance.</p>
              </div>
              <button
                onClick={() => router.push('/activate-face')}
                className="w-full py-3 bg-black hover:bg-zinc-800 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <span>Student Face Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Teacher Card */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6 text-center space-y-4 hover:border-zinc-400 transition group">
              <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center mx-auto group-hover:scale-110 transition">
                <BookOpen className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900">Teacher / Faculty</h3>
                <p className="text-xs text-zinc-500 mt-1">Select your subject, generate lecture QR codes, and view live attendance.</p>
              </div>
              <button
                onClick={() => router.push('/teacher/lecture-qr')}
                className="w-full py-3 bg-black hover:bg-zinc-800 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <span>Teacher Lecture QR</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Dean / Admin Card */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6 text-center space-y-4 hover:border-zinc-400 transition group">
              <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center mx-auto group-hover:scale-110 transition">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900">Dean & Admin Portal</h3>
                <p className="text-xs text-zinc-500 mt-1">Import student rosters, set campus locations, and view attendance reports.</p>
              </div>
              <button
                onClick={() => router.push('/admin')}
                className="w-full py-3 bg-black hover:bg-zinc-800 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <span>Admin Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-200 bg-white px-6 py-6 text-xs text-zinc-500 relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Attendzo — Attendance Management System.</p>
          <div className="flex items-center gap-6 font-medium">
            <a href="/activate-face" className="hover:text-black transition">Face Activation</a>
            <a href="/teacher/lecture-qr" className="hover:text-black transition">Teacher QR</a>
            <a href="/admin/roster-import" className="hover:text-black transition">Roster Import</a>
            <a href="/admin" className="hover:text-black transition">Admin Portal</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
