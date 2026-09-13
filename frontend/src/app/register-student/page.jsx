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
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Header */}
      <header className="w-full border-b border-zinc-200 bg-white/80 backdrop-blur-xl sticky top-0 z-50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Logo size={42} />
          <a href="/attend" className="text-xs font-bold text-zinc-700 hover:text-black transition">
            Go to Kiosk →
          </a>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center relative z-10">
        {success ? (
          <div className="w-full max-w-md bg-white border border-zinc-200 rounded-3xl p-8 text-center animate-fade-in shadow-xl">
            <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-zinc-900">Student Registered!</h2>
            <p className="text-sm text-zinc-500 mt-2">
              Student profile registered for <span className="text-black font-bold">{formData.name}</span>.
            </p>

            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 my-6 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-zinc-500">Roll Number / Student ID:</span>
                <span className="font-mono text-zinc-900 font-bold">{formData.roll_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Department:</span>
                <span className="font-semibold text-zinc-700">{formData.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Face ID:</span>
                <span className="font-semibold text-zinc-900">{faceRegistered ? 'Registered ✓' : 'Not Registered'}</span>
              </div>
            </div>

            <button
              onClick={() => router.push('/attend')}
              className="w-full py-3.5 bg-black hover:bg-zinc-800 text-white font-bold rounded-xl transition shadow-sm"
            >
              Go to Kiosk Check-In
            </button>
          </div>
        ) : (
          <div className="w-full bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-xl">
            
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 border border-zinc-300 text-zinc-900 text-xs font-semibold mb-3">
                <GraduationCap className="w-4 h-4 text-black" /> Student Registration
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900">
                Student & Face Registration
              </h1>
              <p className="text-zinc-500 text-xs sm:text-sm mt-1 max-w-md mx-auto">
                Register your Roll Number and Face ID for attendance check-ins.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Student Personal Information */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Student Roll Number / ID</label>
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
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Department</label>
                    <select
                      className="input"
                      value={formData.department}
                      onChange={e => setFormData({ ...formData, department: e.target.value })}
                    >
                      <option value="Computer Science">Computer Science</option>
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

              {/* Face Registration Section */}
              <div className="pt-4 border-t border-zinc-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-2">
                      <Scan className="w-4 h-4" /> Face Registration
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5">Scan your face to enable kiosk entry</p>
                  </div>
                  {faceRegistered && (
                    <span className="bg-black text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Face Registered
                    </span>
                  )}
                </div>

                <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-center">
                  {cameraActive ? (
                    <div className="relative max-w-xs mx-auto overflow-hidden rounded-2xl border-2 border-black shadow-lg">
                      <video ref={videoRef} className="w-full h-56 object-cover" muted />
                      <div className="absolute inset-0 border-2 border-dashed border-white/80 rounded-2xl pointer-events-none animate-pulse" />
                      <button
                        type="button"
                        onClick={captureFaceEmbedding}
                        className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black hover:bg-zinc-800 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md transition"
                      >
                        📸 Capture Face Scan
                      </button>
                    </div>
                  ) : (
                    <div className="py-6 space-y-3">
                      <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center mx-auto">
                        <Camera className="w-6 h-6" />
                      </div>
                      <p className="text-xs text-zinc-500">
                        {faceRegistered
                          ? 'Face data captured. You can re-scan if needed.'
                          : 'Position your face clearly in front of your camera.'}
                      </p>
                      <button
                        type="button"
                        onClick={startCamera}
                        className="px-5 py-2.5 bg-zinc-900 hover:bg-black text-white text-xs font-bold rounded-xl transition"
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
                className="w-full py-4 bg-black hover:bg-zinc-800 text-white font-extrabold text-base rounded-2xl transition-all shadow-md active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
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

      <footer className="w-full border-t border-zinc-200 bg-white px-6 py-4 text-xs text-zinc-500 text-center">
        © 2026 Attendzo — Student Registration.
      </footer>
    </div>
  );
}
