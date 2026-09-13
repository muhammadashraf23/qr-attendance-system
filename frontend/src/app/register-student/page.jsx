'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { UserCheck, Camera, CheckCircle, GraduationCap, ArrowRight, Scan, Shield } from 'lucide-react';
import Logo from '@/components/shared/Logo';
import api from '@/utils/api';

export default function RegisterStudentPage() {
  const router = useRouter();
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [faceRegistered, setFaceRegistered] = useState(false);
  const [faceVector, setFaceVector] = useState(null);

  const [formData, setFormData] = useState({
    roll_number: '',
    name: '',
    email: '',
    department: 'Computer Science',
    year_semester: 'Year 1 / Fall 2026',
    password: '',
  });

  // Camera start/stop
  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 400, height: 400 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
      toast.success('Webcam initialized! Look straight into the lens.');
    } catch (err) {
      toast.error('Unable to access camera. Check browser permissions.');
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach(track => track.stop());
    setCameraActive(false);
  }

  useEffect(() => {
    return () => stopCamera();
  }, []);

  function captureFaceEmbedding() {
    // Generate simulated 128-d face embedding descriptor vector
    const dummyVector = Array.from({ length: 128 }, () => Math.random() * 0.2 - 0.1);
    setFaceVector(dummyVector);
    setFaceRegistered(true);
    stopCamera();
    toast.success('Facial Biometric embedding captured successfully!');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.roll_number.trim()) return toast.error('Enter Student Roll Number / ID.');
    if (!formData.name.trim()) return toast.error('Enter full name.');

    setLoading(true);
    try {
      await api.post('/employees', {
        employee_id: formData.roll_number,
        name: formData.name,
        email: formData.email || `${formData.roll_number.toLowerCase()}@student.edu`,
        department_name: formData.department,
        designation: `Student (${formData.year_semester})`,
        status: 'active',
        face_vector: faceVector,
      });
      setSuccess(true);
      toast.success('Student registered successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Check if Student ID exists.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="w-full border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Logo size={42} showText={true} />
          <a href="/attend" className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition">
            Go to Kiosk →
          </a>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center relative z-10">
        {success ? (
          <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 backdrop-blur-2xl rounded-3xl p-8 text-center animate-fade-in shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-white">Student Registered!</h2>
            <p className="text-sm text-slate-400 mt-2">
              Facial Biometric & Student ID profile active for <span className="text-indigo-400 font-bold">{formData.name}</span>.
            </p>

            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 my-6 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Roll Number / Student ID:</span>
                <span className="font-mono text-slate-200 font-bold">{formData.roll_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Department / Branch:</span>
                <span className="font-semibold text-slate-300">{formData.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Biometric Face ID:</span>
                <span className="font-semibold text-emerald-400">{faceRegistered ? 'Registered ✓' : 'Not Registered'}</span>
              </div>
            </div>

            <button
              onClick={() => router.push('/attend')}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition shadow-lg shadow-indigo-600/30"
            >
              Test Attendance Kiosk Check-In
            </button>
          </div>
        ) : (
          <div className="w-full bg-slate-900/90 border border-slate-800 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-2xl">
            
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-3">
                <GraduationCap className="w-4 h-4" /> Student Portal Registration
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Student & Face Biometric Registration
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-md mx-auto">
                Register your Roll Number and Face ID for touchless campus attendance.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Student Personal Information */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Student Roll Number / ID</label>
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
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Full Student Name</label>
                    <input
                      required
                      type="text"
                      className="input"
                      placeholder="e.g. Alexander Vance"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Department / Faculty</label>
                    <select
                      className="input"
                      value={formData.department}
                      onChange={e => setFormData({ ...formData, department: e.target.value })}
                    >
                      <option value="Computer Science">Computer Science & AI</option>
                      <option value="Electrical Engineering">Electrical Engineering</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                      <option value="Business Administration">Business Administration</option>
                      <option value="Medical Sciences">Medical Sciences</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Year / Semester</label>
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

              {/* Face Biometric Camera Registration Section */}
              <div className="pt-4 border-t border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                      <Scan className="w-4 h-4" /> Facial Biometric Camera Registration
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Scan face descriptor to enable touchless kiosk entry</p>
                  </div>
                  {faceRegistered && (
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Face Registered
                    </span>
                  )}
                </div>

                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-center">
                  {cameraActive ? (
                    <div className="relative max-w-xs mx-auto overflow-hidden rounded-2xl border-2 border-indigo-500 shadow-xl">
                      <video ref={videoRef} className="w-full h-56 object-cover" muted />
                      <div className="absolute inset-0 border-2 border-dashed border-cyan-400/60 rounded-2xl pointer-events-none animate-pulse" />
                      <button
                        type="button"
                        onClick={captureFaceEmbedding}
                        className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-lg transition"
                      >
                        📸 Capture Face Scan
                      </button>
                    </div>
                  ) : (
                    <div className="py-6 space-y-3">
                      <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                        <Camera className="w-6 h-6" />
                      </div>
                      <p className="text-xs text-slate-400">
                        {faceRegistered
                          ? 'Biometric embedding captured! You can re-scan if needed.'
                          : 'Position your face clearly in front of your camera.'}
                      </p>
                      <button
                        type="button"
                        onClick={startCamera}
                        className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl transition"
                      >
                        {faceRegistered ? 'Re-take Camera Scan' : 'Start Camera Scan'}
                      </button>
                    </div>
                  )}
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
                    <span>Complete Student Registration</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

          </div>
        )}
      </main>

      <footer className="w-full border-t border-slate-800/80 bg-slate-900/60 backdrop-blur-xl px-6 py-4 text-xs text-slate-400 text-center">
        © 2026 Attendzo — Student Attendance Registration Portal.
      </footer>
    </div>
  );
}

