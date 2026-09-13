'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { UserCheck, BookOpen, ShieldCheck, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';
import Logo from '@/components/shared/Logo';
import api from '@/utils/api';

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState('employee'); // 'employee' (Student/Faculty) | 'admin' (Dean)
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ identifier: '', password: '' });

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.identifier.trim() || !formData.password)
      return toast.error('Please fill in all credentials.');

    setLoading(true);
    try {
      if (role === 'admin') {
        const { data } = await api.post('/auth/admin/login', {
          email: formData.identifier.trim(),
          password: formData.password,
        });
        localStorage.setItem('admin_token', data.token);
        toast.success('Admin login successful!');
        router.push('/admin/dashboard');
      } else {
        const { data } = await api.post('/auth/login', {
          identifier: formData.identifier.trim(),
          password: formData.password,
        });
        localStorage.setItem('employee_token', data.token);
        toast.success('Login successful!');
        if (data.employee?.designation?.toLowerCase().includes('faculty') || data.employee?.designation?.toLowerCase().includes('teacher')) {
          router.push('/teacher/lecture-qr');
        } else {
          router.push('/activate-face');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid login credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="w-full border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Logo size={42} showText={true} />
          <a href="/register" className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition">
            Create Account →
          </a>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-md w-full mx-auto p-4 sm:p-6 flex items-center justify-center relative z-10">
        <div className="w-full bg-slate-900/90 border border-slate-800 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-2xl animate-fade-in text-center">
          
          <div className="flex justify-center mb-6">
            <Logo size={56} showText={true} />
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-extrabold text-white">Academic Portal Sign In</h1>
            <p className="text-xs text-slate-400 mt-1">Access your Student, Faculty, or Dean dashboard</p>
          </div>

          {/* Role Selector Tabs */}
          <div className="grid grid-cols-2 gap-2 mb-6 p-1.5 bg-slate-950/80 border border-slate-800 rounded-2xl">
            <button
              type="button"
              onClick={() => setRole('employee')}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-extrabold transition-all ${
                role === 'employee'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Student / Faculty</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-extrabold transition-all ${
                role === 'admin'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Dean / Admin</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {role === 'admin' ? 'Admin Email Address' : 'Student Roll Number / Teacher ID / Email'}
              </label>
              <input
                required
                type="text"
                className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 rounded-2xl px-4 py-3.5 text-sm text-white placeholder:text-slate-500 focus:outline-none transition"
                placeholder={role === 'admin' ? 'dean@university.edu' : 'e.g. CS-2026-001 or TCH-901'}
                value={formData.identifier}
                onChange={e => setFormData({ ...formData, identifier: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
              <input
                required
                type="password"
                className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 rounded-2xl px-4 py-3.5 text-sm text-white placeholder:text-slate-500 focus:outline-none transition"
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-4 bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-extrabold text-sm rounded-2xl transition shadow-xl shadow-indigo-600/30 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In as {role === 'admin' ? 'Dean Admin' : 'Academic User'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-400">
            <span>Just marking attendance? </span>
            <a href="/attend" className="text-indigo-400 font-bold hover:underline">
              Open Classroom Kiosk →
            </a>
          </div>

        </div>
      </main>

      <footer className="w-full border-t border-slate-800/80 bg-slate-900/60 backdrop-blur-xl px-6 py-4 text-xs text-slate-400 text-center">
        © 2026 Attendzo — Academic SaaS Authentication Gateway.
      </footer>
    </div>
  );
}
