'use client';

import React from 'react';
import Link from 'next/link';
import Logo from '@/components/shared/Logo';
import ModernDashboardOverview from '@/components/ModernDashboardOverview';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-white">CloudAttend<span className="text-indigo-400">.io</span></span>
                <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] uppercase font-bold tracking-widest bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
                  v2.0 SaaS
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-300">
              <a href="#interactive-suite" className="hover:text-white transition">Platform Live Sandbox</a>
              <a href="#architecture" className="hover:text-white transition">Engineering Architecture</a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="px-4 py-2 text-sm font-semibold text-gray-300 hover:text-white transition">
              Sign In
            </Link>
            <Link
              href="/register-institution"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-sm text-white shadow-lg shadow-indigo-600/30 transition transform hover:-translate-y-0.5"
            >
              Deploy Institution
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Engineered with Next.js 16 Turbopack &amp; Node.js High-Concurrency Backend
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-tight sm:leading-none max-w-5xl mx-auto">
          The Zero-Proxy <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-sky-400 bg-clip-text text-transparent">
            Smart Attendance SaaS
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto font-normal leading-relaxed">
          Eliminate proxy check-ins forever. Designed for dual operation: <strong>University Campuses</strong> with 75% exam defaulter compliance radar, and <strong>Enterprise Organizations</strong> with GPS geofenced shift check-ins and face biometrics.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#interactive-suite"
            className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold shadow-xl shadow-indigo-600/25 transition transform hover:-translate-y-0.5 text-sm sm:text-base"
          >
            Launch Interactive Sandbox
          </a>
          <Link
            href="/attend"
            className="px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold transition text-sm sm:text-base flex items-center gap-2"
          >
            Live Web Scanner
          </Link>
          <Link
            href="/admin"
            className="px-7 py-3.5 rounded-xl bg-gray-800 hover:bg-gray-750 border border-gray-700 text-gray-300 font-semibold transition text-sm sm:text-base"
          >
            Admin Portal Demo
          </Link>
        </div>
      </section>

      {/* Interactive Platform Live Sandbox */}
      <section id="interactive-suite" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="bg-gray-100 text-gray-900 rounded-3xl p-6 sm:p-10 shadow-2xl border border-white/20">
          <ModernDashboardOverview />
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/10 bg-slate-950 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-gray-400">
          <div className="flex items-center gap-3">
            <Logo size={32} />
            <span>&copy; {new Date().getFullYear()} CloudAttend Enterprise. Built with Next.js 16 &amp; TypeScript.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-white transition">Sign In</Link>
            <Link href="/register" className="hover:text-white transition">Register Account</Link>
            <Link href="/admin" className="hover:text-white transition">Admin Console</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
