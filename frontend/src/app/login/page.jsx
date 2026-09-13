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
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Header */}
      <header className="w-full border-b border-zinc-200 bg-white/80 backdrop-blur-xl sticky top-0 z-50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Logo size={42} />
          <a href="/register" className="text-xs font-bold text-zinc-700 hover:text-black transition">
            Create Account →
          </a>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-md w-full mx-auto p-4 sm:p-6 flex items-center justify-center relative z-10">
        <div className="w-full bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-xl animate-fade-in text-center">
          
          <div className="flex justify-center mb-6">
            <Logo size={56} />
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-extrabold text-zinc-900">Academic Portal Sign In</h1>
            <p className="text-xs text-zinc-500 mt-1">Access your Student, Faculty, or Dean dashboard</p>
          </div>

          {/* Role Selector Tabs */}
          <div className="grid grid-cols-2 gap-2 mb-6 p-1.5 bg-zinc-100 border border-zinc-200 rounded-2xl">
            <button
              type="button"
              onClick={() => setRole('employee')}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-extrabold transition-all ${
                role === 'employee'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900'
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
                  ? 'bg-black text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Dean / Admin</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                {role === 'admin' ? 'Admin Email Address' : 'Student Roll Number / Teacher ID / Email'}
              </label>
              <input
                required
                type="text"
                className="w-full bg-white border border-zinc-300 focus:border-black focus:ring-2 focus:ring-black/20 rounded-2xl px-4 py-3.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none transition"
                placeholder={role === 'admin' ? 'dean@university.edu' : 'e.g. CS-2026-001 or TCH-901'}
                value={formData.identifier}
                onChange={e => setFormData({ ...formData, identifier: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Password</label>
              <input
                required
                type="password"
                className="w-full bg-white border border-zinc-300 focus:border-black focus:ring-2 focus:ring-black/20 rounded-2xl px-4 py-3.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none transition"
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-4 bg-black hover:bg-zinc-800 text-white font-extrabold text-sm rounded-2xl transition shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
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

          <div className="mt-6 pt-4 border-t border-zinc-200 text-xs text-zinc-500">
            <span>Just marking attendance? </span>
            <a href="/attend" className="text-black font-bold hover:underline">
              Open Classroom Kiosk →
            </a>
          </div>

        </div>
      </main>

      <footer className="w-full border-t border-zinc-200 bg-white px-6 py-4 text-xs text-zinc-500 text-center">
        © 2026 Attendzo — Attendance System.
      </footer>
    </div>
  );
}
