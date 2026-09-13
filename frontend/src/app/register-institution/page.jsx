'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { GraduationCap, MapPin, Building, Mail, Lock, ShieldCheck, ArrowRight, CheckCircle, Sparkles } from 'lucide-react';
import Logo from '@/components/shared/Logo';
import api from '@/utils/api';

export default function RegisterInstitutionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fetchingGps, setFetchingGps] = useState(false);

  const [formData, setFormData] = useState({
    institution_name: '',
    institution_code: '',
    admin_name: '',
    admin_email: '',
    password: '',
    confirm_password: '',
    campus_lat: '',
    campus_lng: '',
    geofence_radius: '100',
    type: 'university', // university | college | school
  });

  // Auto-detect browser GPS coordinates for Campus Geofence
  function detectGPS() {
    if (!navigator.geolocation) return toast.error('Geolocation is not supported by your browser.');
    setFetchingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData(prev => ({
          ...prev,
          campus_lat: pos.coords.latitude.toFixed(6),
          campus_lng: pos.coords.longitude.toFixed(6),
        }));
        setFetchingGps(false);
        toast.success('Campus GPS coordinates captured!');
      },
      () => {
        setFetchingGps(false);
        toast.error('Unable to fetch location. Please enter coordinates manually.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.institution_name.trim()) return toast.error('Enter institution name.');
    if (!formData.admin_email.trim()) return toast.error('Enter admin email.');
    if (formData.password.length < 6) return toast.error('Password must be at least 6 characters.');
    if (formData.password !== formData.confirm_password) return toast.error('Passwords do not match.');

    setLoading(true);
    try {
      await api.post('/auth/register-institution', {
        institution_name: formData.institution_name,
        institution_code: formData.institution_code || formData.institution_name.toLowerCase().replace(/\s+/g, '-'),
        admin_name: formData.admin_name,
        email: formData.admin_email,
        password: formData.password,
        office_lat: parseFloat(formData.campus_lat) || 0,
        office_lng: parseFloat(formData.campus_lng) || 0,
        geofence_radius_meters: parseInt(formData.geofence_radius, 10) || 100,
        type: formData.type,
      });
      setSuccess(true);
      toast.success('Institution registered successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="w-full border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Logo size={42} showText={true} />
          <a href="/login" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition">
            Admin Login →
          </a>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center relative z-10">
        {success ? (
          <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 backdrop-blur-2xl rounded-3xl p-8 text-center animate-fade-in shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-white">Institution Registered!</h2>
            <p className="text-sm text-slate-400 mt-2">
              Your academic SaaS workspace has been provisioned for <span className="text-indigo-400 font-bold">{formData.institution_name}</span>.
            </p>

            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 my-6 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Admin Email:</span>
                <span className="font-mono text-slate-200">{formData.admin_email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Campus Geofence:</span>
                <span className="font-semibold text-emerald-400">{formData.geofence_radius}m radius set</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => router.push('/login')}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition shadow-lg shadow-indigo-600/30"
              >
                Go to Admin Portal Login
              </button>
              <button
                onClick={() => router.push('/register-student')}
                className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition border border-slate-700"
              >
                Onboard Students →
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full bg-slate-900/90 border border-slate-800 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-2xl">
            
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
                <GraduationCap className="w-4 h-4" /> Attendzo SaaS Onboarding
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Register Your Educational Institution
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-md mx-auto">
                Set up your University, College, or School for automated QR & AI Face attendance management.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Institution Details */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                  <Building className="w-4 h-4" /> Institution Profile
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Institution Name</label>
                    <input
                      required
                      type="text"
                      className="input"
                      placeholder="e.g. Stanford University"
                      value={formData.institution_name}
                      onChange={e => setFormData({ ...formData, institution_name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Institution Type</label>
                    <select
                      className="input"
                      value={formData.type}
                      onChange={e => setFormData({ ...formData, type: e.target.value })}
                    >
                      <option value="university">University / Higher Ed</option>
                      <option value="college">College / Institute</option>
                      <option value="school">High School / Secondary</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Admin Credentials */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Dean / Administrator Account
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Admin Full Name</label>
                    <input
                      required
                      type="text"
                      className="input"
                      placeholder="e.g. Dr. Arthur Pendelton"
                      value={formData.admin_name}
                      onChange={e => setFormData({ ...formData, admin_name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Admin Work Email</label>
                    <input
                      required
                      type="email"
                      className="input"
                      placeholder="dean@university.edu"
                      value={formData.admin_email}
                      onChange={e => setFormData({ ...formData, admin_email: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                    <input
                      required
                      type="password"
                      className="input"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm Password</label>
                    <input
                      required
                      type="password"
                      className="input"
                      placeholder="••••••••"
                      value={formData.confirm_password}
                      onChange={e => setFormData({ ...formData, confirm_password: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Campus GPS Geofence */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Campus GPS Geofence Settings
                  </h3>
                  <button
                    type="button"
                    onClick={detectGPS}
                    disabled={fetchingGps}
                    className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 px-3 py-1 rounded-lg border border-cyan-500/20 transition"
                  >
                    {fetchingGps ? 'Detecting GPS...' : '📍 Auto-Detect Current GPS'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Campus Latitude</label>
                    <input
                      type="number"
                      step="any"
                      className="input"
                      placeholder="e.g. 37.4275"
                      value={formData.campus_lat}
                      onChange={e => setFormData({ ...formData, campus_lat: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Campus Longitude</label>
                    <input
                      type="number"
                      step="any"
                      className="input"
                      placeholder="e.g. -122.1697"
                      value={formData.campus_lng}
                      onChange={e => setFormData({ ...formData, campus_lng: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Radius (Meters)</label>
                    <input
                      type="number"
                      className="input"
                      placeholder="100"
                      value={formData.geofence_radius}
                      onChange={e => setFormData({ ...formData, geofence_radius: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-extrabold text-base rounded-2xl transition-all shadow-xl shadow-indigo-600/30 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Register Institution SaaS Workspace</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

          </div>
        )}
      </main>

      <footer className="w-full border-t border-slate-800/80 bg-slate-900/60 backdrop-blur-xl px-6 py-4 text-xs text-slate-400 text-center">
        © 2026 Attendzo — Multi-Tenant Educational Attendance Platform.
      </footer>
    </div>
  );
}

