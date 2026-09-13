'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { GraduationCap, Building, UserCheck, BookOpen, ShieldCheck, MapPin, Camera, CheckCircle, ArrowRight, Scan } from 'lucide-react';
import Logo from '@/components/shared/Logo';
import api from '@/utils/api';

export default function UnifiedRegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState('student'); // 'institution' | 'teacher' | 'student'
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fetchingGps, setFetchingGps] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    // Institution fields
    institution_name: '',
    admin_name: '',
    admin_email: '',
    password: '',
    campus_lat: '',
    campus_lng: '',
    geofence_radius: '100',
    
    // Teacher fields
    teacher_id: '',
    teacher_name: '',
    teacher_email: '',
    department: 'Computer Science & AI',
    subjects: 'CS101 Algorithms, CS102 Data Structures',

    // Student fields
    roll_number: '',
    student_name: '',
    student_email: '',
    year_semester: 'Year 2 / Fall 2026',
    face_vector: null,
  });

  // GPS auto-detect for institution setup
  function detectGPS() {
    if (!navigator.geolocation) return toast.error('Geolocation is not supported.');
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
        toast.error('Unable to fetch location.');
      },
      { enableHighAccuracy: true }
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      if (role === 'institution') {
        if (!formData.institution_name || !formData.admin_email || !formData.password)
          return toast.error('Fill in all required institution fields.');
        await api.post('/auth/register-institution', {
          institution_name: formData.institution_name,
          admin_name: formData.admin_name,
          email: formData.admin_email,
          password: formData.password,
          office_lat: parseFloat(formData.campus_lat) || 0,
          office_lng: parseFloat(formData.campus_lng) || 0,
          geofence_radius_meters: parseInt(formData.geofence_radius, 10) || 100,
        });
        toast.success('Institution SaaS Workspace Registered!');
      } else if (role === 'teacher') {
        if (!formData.teacher_id || !formData.teacher_name || !formData.teacher_email)
          return toast.error('Fill in all required teacher fields.');
        await api.post('/employees', {
          employee_id: formData.teacher_id,
          name: formData.teacher_name,
          email: formData.teacher_email,
          department_name: formData.department,
          designation: `Faculty / Teacher (${formData.subjects})`,
          status: 'active',
        });
        toast.success('Teacher Account Registered!');
      } else {
        // Student
        if (!formData.roll_number || !formData.student_name)
          return toast.error('Fill in Student Roll Number and Name.');
        await api.post('/employees', {
          employee_id: formData.roll_number,
          name: formData.student_name,
          email: formData.student_email || `${formData.roll_number.toLowerCase()}@student.edu`,
          department_name: formData.department,
          designation: `Student (${formData.year_semester})`,
          status: 'active',
        });
        toast.success('Student Account Registered!');
      }

      setSuccess(true);
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
          <div className="flex items-center gap-4">
            <a href="/attend" className="text-xs font-bold text-zinc-800 hover:text-black transition">
              Kiosk Attendance →
            </a>
            <a href="/login" className="text-xs font-bold text-zinc-600 hover:text-black transition">
              Login
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
            <h2 className="text-2xl font-extrabold text-zinc-900">Registration Complete!</h2>
            <p className="text-sm text-zinc-500 mt-2">
              Your account has been provisioned under role <span className="text-black font-bold uppercase">{role}</span>.
            </p>

            <div className="space-y-3 mt-6">
              {role === 'teacher' ? (
                <button
                  onClick={() => router.push('/teacher/lecture-qr')}
                  className="w-full py-3.5 bg-black hover:bg-zinc-800 text-white font-bold rounded-xl transition shadow-sm"
                >
                  Generate Subject Lecture QR Code →
                </button>
              ) : role === 'student' ? (
                <button
                  onClick={() => router.push('/attend')}
                  className="w-full py-3.5 bg-black hover:bg-zinc-800 text-white font-bold rounded-xl transition shadow-sm"
                >
                  Go to Classroom Kiosk →
                </button>
              ) : (
                <button
                  onClick={() => router.push('/login')}
                  className="w-full py-3.5 bg-black hover:bg-zinc-800 text-white font-bold rounded-xl transition shadow-sm"
                >
                  Go to Admin Portal Login →
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-xl">
            
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 border border-zinc-300 text-zinc-900 text-xs font-semibold mb-3">
                <GraduationCap className="w-4 h-4 text-black" /> Account Registration
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900">
                Registration Portal
              </h1>
              <p className="text-zinc-500 text-xs sm:text-sm mt-1 max-w-md mx-auto">
                Select your role below to create your account.
              </p>
            </div>

            {/* Role Selection Tabs */}
            <div className="grid grid-cols-3 gap-3 mb-8 p-1.5 bg-zinc-100 border border-zinc-200 rounded-2xl">
              {[
                { id: 'student', title: 'Student', icon: UserCheck, color: 'text-black' },
                { id: 'teacher', title: 'Teacher / Faculty', icon: BookOpen, color: 'text-black' },
                { id: 'institution', title: 'Institution Dean', icon: Building, color: 'text-black' },
              ].map(item => {
                const Icon = item.icon;
                const active = role === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setRole(item.id)}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-extrabold transition-all ${
                      active
                        ? 'bg-black text-white shadow-sm'
                        : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-white' : item.color}`} />
                    <span className="hidden sm:inline">{item.title}</span>
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* STUDENT FORM */}
              {role === 'student' && (
                <div className="space-y-4 animate-fade-in">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-2">
                    <UserCheck className="w-4 h-4" /> Student Profile & Registration
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">Roll Number / Student ID</label>
                      <input
                        required
                        type="text"
                        className="input"
                        placeholder="e.g. CS-2026-042"
                        value={formData.roll_number}
                        onChange={e => setFormData({ ...formData, roll_number: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">Full Student Name</label>
                      <input
                        required
                        type="text"
                        className="input"
                        placeholder="e.g. Alexander Vance"
                        value={formData.student_name}
                        onChange={e => setFormData({ ...formData, student_name: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">Department / Branch</label>
                      <select
                        className="input"
                        value={formData.department}
                        onChange={e => setFormData({ ...formData, department: e.target.value })}
                      >
                        <option value="Computer Science & AI">Computer Science & AI</option>
                        <option value="Electrical Engineering">Electrical Engineering</option>
                        <option value="Mechanical Engineering">Mechanical Engineering</option>
                        <option value="Business Administration">Business Administration</option>
                        <option value="Medical Sciences">Medical Sciences</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">Year / Semester</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="e.g. Year 2 / Semester 4"
                        value={formData.year_semester}
                        onChange={e => setFormData({ ...formData, year_semester: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TEACHER FORM */}
              {role === 'teacher' && (
                <div className="space-y-4 animate-fade-in">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" /> Faculty / Teacher Account Setup
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">Teacher / Faculty ID</label>
                      <input
                        required
                        type="text"
                        className="input"
                        placeholder="e.g. TCH-901"
                        value={formData.teacher_id}
                        onChange={e => setFormData({ ...formData, teacher_id: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">Full Teacher Name</label>
                      <input
                        required
                        type="text"
                        className="input"
                        placeholder="e.g. Prof. Sarah Jenkins"
                        value={formData.teacher_name}
                        onChange={e => setFormData({ ...formData, teacher_name: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">Work Email</label>
                      <input
                        required
                        type="email"
                        className="input"
                        placeholder="sjenkins@university.edu"
                        value={formData.teacher_email}
                        onChange={e => setFormData({ ...formData, teacher_email: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">Assigned Subjects / Courses</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="e.g. CS101 Algorithms, CS102 Data Structures"
                        value={formData.subjects}
                        onChange={e => setFormData({ ...formData, subjects: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* INSTITUTION FORM */}
              {role === 'institution' && (
                <div className="space-y-4 animate-fade-in">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-2">
                    <Building className="w-4 h-4" /> Institution Profile & Campus GPS Setup
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">Institution Name</label>
                      <input
                        required
                        type="text"
                        className="input"
                        placeholder="e.g. Harvard University"
                        value={formData.institution_name}
                        onChange={e => setFormData({ ...formData, institution_name: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">Dean / Admin Email</label>
                      <input
                        required
                        type="email"
                        className="input"
                        placeholder="dean@harvard.edu"
                        value={formData.admin_email}
                        onChange={e => setFormData({ ...formData, admin_email: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">Admin Password</label>
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
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">Geofence Radius (Meters)</label>
                      <input
                        type="number"
                        className="input"
                        placeholder="100"
                        value={formData.geofence_radius}
                        onChange={e => setFormData({ ...formData, geofence_radius: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={detectGPS}
                      disabled={fetchingGps}
                      className="text-xs font-bold text-zinc-900 bg-zinc-100 hover:bg-zinc-200 px-3.5 py-2 rounded-xl border border-zinc-300 transition flex items-center gap-2"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>{fetchingGps ? 'Detecting GPS...' : '📍 Auto-Detect Campus GPS Coordinates'}</span>
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-black hover:bg-zinc-800 text-white font-extrabold text-base rounded-2xl transition-all shadow-md active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Register Account</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

          </div>
        )}
      </main>

      <footer className="w-full border-t border-zinc-200 bg-white px-6 py-4 text-xs text-zinc-500 text-center">
        © 2026 Attendzo — Attendance System.
      </footer>
    </div>
  );
}
