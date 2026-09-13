'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Building, MapPin, ShieldCheck, ArrowRight, CheckCircle, Upload, Scan } from 'lucide-react';
import Logo from '@/components/shared/Logo';
import api from '@/utils/api';

export default function RegisterPage() {
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
        institution_name: formData.institution_name.trim(),
        institution_code: formData.institution_code.trim() || formData.institution_name.slice(0, 4).toUpperCase(),
        admin_name: formData.admin_name.trim(),
        email: formData.admin_email.trim(),
        password: formData.password,
        office_lat: parseFloat(formData.campus_lat) || 0,
        office_lng: parseFloat(formData.campus_lng) || 0,
        geofence_radius_meters: parseInt(formData.geofence_radius, 10) || 100,
      });

      toast.success('Institution setup complete!');
      setSuccess(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please check details.');
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
          <div className="flex items-center gap-4">
            <a href="/attend" className="text-xs font-bold text-zinc-800 hover:text-black transition">
              Kiosk Attendance →
            </a>
            <a href="/login" className="text-xs font-bold text-zinc-600 hover:text-black transition">
              Sign In
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center relative z-10">
        {success ? (
          <div className="w-full max-w-md bg-white border border-zinc-200 rounded-3xl p-8 text-center animate-fade-in shadow-xl">
            <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-zinc-900">Institution Registered!</h2>
            <p className="text-sm text-zinc-500 mt-2">
              Your campus workspace for <span className="font-bold text-zinc-900">{formData.institution_name}</span> is ready.
            </p>

            <div className="space-y-3 mt-6">
              <button
                onClick={() => router.push('/login')}
                className="w-full py-3.5 bg-black hover:bg-zinc-800 text-white font-bold text-sm rounded-2xl transition shadow-md flex items-center justify-center gap-2"
              >
                <span>Login to Dean Dashboard →</span>
              </button>
              <a
                href="/admin/roster-import"
                className="block text-xs font-bold text-zinc-600 hover:text-black py-2 transition"
              >
                Import Class Roster (CSV) →
              </a>
            </div>
          </div>
        ) : (
          <div className="w-full bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-xl">
            
            {/* Header Title */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 border border-zinc-300 text-zinc-900 text-xs font-semibold mb-3">
                <Building className="w-4 h-4 text-black" /> Institution Registration
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900">
                Register Institution Workspace
              </h1>
              <p className="text-zinc-500 text-xs sm:text-sm mt-1 max-w-lg mx-auto">
                Set up your College or University account. Once registered, Deans & Admins bulk import student and teacher class rosters via CSV.
              </p>
            </div>

            {/* Architecture Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
              <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-left">
                <ShieldCheck className="w-5 h-5 text-black mb-2" />
                <h4 className="text-xs font-extrabold text-zinc-900">1. Dean Registration</h4>
                <p className="text-[11px] text-zinc-500 mt-1">Dean registers institution with admin email and secure password.</p>
              </div>
              <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-left">
                <Upload className="w-5 h-5 text-black mb-2" />
                <h4 className="text-xs font-extrabold text-zinc-900">2. Roster CSV Import</h4>
                <p className="text-[11px] text-zinc-500 mt-1">Dean imports student & faculty lists from admin dashboard.</p>
              </div>
              <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-left">
                <Scan className="w-5 h-5 text-black mb-2" />
                <h4 className="text-xs font-extrabold text-zinc-900">3. Face ID & Kiosk</h4>
                <p className="text-[11px] text-zinc-500 mt-1">Students activate face at <code className="text-black font-bold">/activate-face</code> using Roll Number.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Institution Details */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-2">
                  <Building className="w-4 h-4 text-black" /> Institution Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Institution Name *</label>
                    <input
                      required
                      type="text"
                      className="w-full bg-white border border-zinc-300 focus:border-black focus:ring-2 focus:ring-black/20 rounded-2xl px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none transition"
                      placeholder="e.g. Stanford Institute of Technology"
                      value={formData.institution_name}
                      onChange={e => setFormData({ ...formData, institution_name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Institution Code</label>
                    <input
                      type="text"
                      className="w-full bg-white border border-zinc-300 focus:border-black focus:ring-2 focus:ring-black/20 rounded-2xl px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none transition"
                      placeholder="e.g. SIT-2026"
                      value={formData.institution_code}
                      onChange={e => setFormData({ ...formData, institution_code: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Dean / Admin Credentials */}
              <div className="space-y-4 pt-4 border-t border-zinc-200">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-black" /> Dean / Administrator Account Credentials
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Dean / Admin Full Name *</label>
                    <input
                      required
                      type="text"
                      className="w-full bg-white border border-zinc-300 focus:border-black focus:ring-2 focus:ring-black/20 rounded-2xl px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none transition"
                      placeholder="e.g. Dr. Eleanor Vance"
                      value={formData.admin_name}
                      onChange={e => setFormData({ ...formData, admin_name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Admin Email Address *</label>
                    <input
                      required
                      type="email"
                      className="w-full bg-white border border-zinc-300 focus:border-black focus:ring-2 focus:ring-black/20 rounded-2xl px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none transition"
                      placeholder="dean@university.edu"
                      value={formData.admin_email}
                      onChange={e => setFormData({ ...formData, admin_email: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Password *</label>
                    <input
                      required
                      type="password"
                      className="w-full bg-white border border-zinc-300 focus:border-black focus:ring-2 focus:ring-black/20 rounded-2xl px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none transition"
                      placeholder="At least 6 characters"
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Confirm Password *</label>
                    <input
                      required
                      type="password"
                      className="w-full bg-white border border-zinc-300 focus:border-black focus:ring-2 focus:ring-black/20 rounded-2xl px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none transition"
                      placeholder="Re-enter password"
                      value={formData.confirm_password}
                      onChange={e => setFormData({ ...formData, confirm_password: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Campus GPS Geofencing (Optional) */}
              <div className="space-y-4 pt-4 border-t border-zinc-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-black" /> Campus GPS Center & Geofence
                  </h3>
                  <button
                    type="button"
                    onClick={detectGPS}
                    disabled={fetchingGps}
                    className="text-xs font-bold text-black hover:underline flex items-center gap-1.5"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    {fetchingGps ? 'Detecting Location...' : 'Auto-Detect Current GPS'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Campus Latitude</label>
                    <input
                      type="text"
                      className="w-full bg-white border border-zinc-300 focus:border-black focus:ring-2 focus:ring-black/20 rounded-2xl px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none transition"
                      placeholder="e.g. 37.774929"
                      value={formData.campus_lat}
                      onChange={e => setFormData({ ...formData, campus_lat: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Campus Longitude</label>
                    <input
                      type="text"
                      className="w-full bg-white border border-zinc-300 focus:border-black focus:ring-2 focus:ring-black/20 rounded-2xl px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none transition"
                      placeholder="e.g. -122.419416"
                      value={formData.campus_lng}
                      onChange={e => setFormData({ ...formData, campus_lng: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Geofence Radius (Meters)</label>
                    <select
                      className="w-full bg-white border border-zinc-300 focus:border-black focus:ring-2 focus:ring-black/20 rounded-2xl px-4 py-3 text-sm text-zinc-900 focus:outline-none transition"
                      value={formData.geofence_radius}
                      onChange={e => setFormData({ ...formData, geofence_radius: e.target.value })}
                    >
                      <option value="50">50 Meters (Tight Campus)</option>
                      <option value="100">100 Meters (Standard Building)</option>
                      <option value="250">250 Meters (Medium Campus)</option>
                      <option value="500">500 Meters (Large Campus)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-zinc-500">
                  Already have an account?{' '}
                  <a href="/login" className="font-bold text-black hover:underline">
                    Sign in here
                  </a>
                </p>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-8 py-4 bg-black hover:bg-zinc-800 text-white font-extrabold text-sm rounded-2xl transition shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Register Institution Workspace</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-200 bg-white px-6 py-4 text-xs text-zinc-500 text-center relative z-10">
        © 2026 Attendzo — Attendance System.
      </footer>
    </div>
  );
}
