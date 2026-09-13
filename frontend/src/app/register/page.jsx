'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { GraduationCap, MapPin, Building, ShieldCheck, ArrowRight, CheckCircle } from 'lucide-react';
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
    type: 'university',
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
      const { data } = await api.post('/auth/register-institution', {
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

      // Store session token & profile
      if (data?.token) {
        localStorage.setItem('admin_token', data.token);
      }
      localStorage.setItem('admin_data', JSON.stringify(data?.admin || { name: formData.admin_name || 'Dean Admin', email: formData.admin_email, role: 'dean' }));

      toast.success('Institution registered! Welcome to Dean Dashboard.');
      router.push('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Try again.');
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
          <a href="/login" className="text-xs font-bold text-zinc-700 hover:text-black transition">
            Admin Login →
          </a>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center relative z-10">
        <div className="w-full bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-xl">
            
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 border border-zinc-300 text-zinc-900 text-xs font-semibold mb-3">
                <GraduationCap className="w-4 h-4 text-black" /> Institution Setup
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900">
                Register Your Educational Institution
              </h1>
              <p className="text-zinc-500 text-xs sm:text-sm mt-1 max-w-md mx-auto">
                Set up your university, college, or school for QR and face attendance management.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Institution Details */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-2">
                  <Building className="w-4 h-4" /> Institution Profile
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Institution Name</label>
                    <input
                      required
                      type="text"
                      className="w-full bg-white border border-zinc-300 focus:border-black focus:ring-2 focus:ring-black/20 rounded-2xl px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none transition"
                      placeholder="e.g. Stanford University"
                      value={formData.institution_name}
                      onChange={e => setFormData({ ...formData, institution_name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Institution Type</label>
                    <select
                      className="w-full bg-white border border-zinc-300 focus:border-black focus:ring-2 focus:ring-black/20 rounded-2xl px-4 py-3 text-sm text-zinc-900 focus:outline-none transition"
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
              <div className="space-y-4 pt-4 border-t border-zinc-200">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Dean / Administrator Account
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Admin Full Name</label>
                    <input
                      required
                      type="text"
                      className="w-full bg-white border border-zinc-300 focus:border-black focus:ring-2 focus:ring-black/20 rounded-2xl px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none transition"
                      placeholder="e.g. Dr. Arthur Pendelton"
                      value={formData.admin_name}
                      onChange={e => setFormData({ ...formData, admin_name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Admin Work Email</label>
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
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Password</label>
                    <input
                      required
                      type="password"
                      className="w-full bg-white border border-zinc-300 focus:border-black focus:ring-2 focus:ring-black/20 rounded-2xl px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none transition"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Confirm Password</label>
                    <input
                      required
                      type="password"
                      className="w-full bg-white border border-zinc-300 focus:border-black focus:ring-2 focus:ring-black/20 rounded-2xl px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none transition"
                      placeholder="••••••••"
                      value={formData.confirm_password}
                      onChange={e => setFormData({ ...formData, confirm_password: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Campus GPS Geofence */}
              <div className="space-y-4 pt-4 border-t border-zinc-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Campus GPS Geofence Settings
                  </h3>
                  <button
                    type="button"
                    onClick={detectGPS}
                    disabled={fetchingGps}
                    className="text-xs font-bold text-zinc-900 bg-zinc-100 hover:bg-zinc-200 px-3 py-1 rounded-lg border border-zinc-300 transition"
                  >
                    {fetchingGps ? 'Detecting GPS...' : '📍 Auto-Detect Current GPS'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Campus Latitude</label>
                    <input
                      type="number"
                      step="any"
                      className="w-full bg-white border border-zinc-300 focus:border-black focus:ring-2 focus:ring-black/20 rounded-2xl px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none transition"
                      placeholder="e.g. 37.4275"
                      value={formData.campus_lat}
                      onChange={e => setFormData({ ...formData, campus_lat: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Campus Longitude</label>
                    <input
                      type="number"
                      step="any"
                      className="w-full bg-white border border-zinc-300 focus:border-black focus:ring-2 focus:ring-black/20 rounded-2xl px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none transition"
                      placeholder="e.g. -122.1697"
                      value={formData.campus_lng}
                      onChange={e => setFormData({ ...formData, campus_lng: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Radius (Meters)</label>
                    <input
                      type="number"
                      className="w-full bg-white border border-zinc-300 focus:border-black focus:ring-2 focus:ring-black/20 rounded-2xl px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none transition"
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
                className="w-full py-4 bg-black hover:bg-zinc-800 text-white font-extrabold text-base rounded-2xl transition-all shadow-md active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Register Institution</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

          </div>
      </main>

      <footer className="w-full border-t border-zinc-200 bg-white px-6 py-4 text-xs text-zinc-500 text-center">
        © 2026 Attendzo — Educational Attendance System.
      </footer>
    </div>
  );
}
