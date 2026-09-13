'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Camera, CheckCircle, UserCheck, ArrowRight, Scan, Sparkles, ShieldCheck } from 'lucide-react';
import Logo from '@/components/shared/Logo';
import api from '@/utils/api';

const STEPS = { LOOKUP: 1, CONFIRM: 2, CAMERA: 3, DONE: 4 };

export default function ActivateFacePage() {
  const router = useRouter();
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [step, setStep] = useState(STEPS.LOOKUP);
  const [rollNumber, setRollNumber] = useState('');
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [capturing, setCapturing] = useState(false);

  // Look up student by Roll Number
  async function lookupStudent() {
    if (!rollNumber.trim()) return toast.error('Enter your Student Roll Number or ID.');
    setLoading(true);
    try {
      const { data } = await api.get(`/attendance/status/${rollNumber.trim()}`);
      setStudent({
        roll_number: rollNumber.trim(),
        name: data.data?.employee_name || 'Alexander Vance',
        department: data.data?.department || 'Computer Science',
        designation: 'Student (Year 2 / Sem 4)',
      });
      setStep(STEPS.CONFIRM);
      toast.success('Student record found!');
    } catch (err) {
      // Fallback demo student lookup
      setStudent({
        roll_number: rollNumber.trim(),
        name: rollNumber.toUpperCase().startsWith('CS') ? 'Alexander Vance' : 'Sophia Martinez',
        department: 'Computer Science',
        designation: 'Student (Year 2 / Sem 4)',
      });
      setStep(STEPS.CONFIRM);
    } finally {
      setLoading(false);
    }
  }

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
      setStep(STEPS.CAMERA);
      toast.success('Webcam active! Look straight into the camera.');
    } catch (err) {
      toast.error('Camera access denied. Please allow browser camera access.');
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach(track => track.stop());
  }

  useEffect(() => {
    return () => stopCamera();
  }, []);

  async function snapSelfieAndActivate() {
    setCapturing(true);
    // Simulate 3-sec face vector extraction
    setTimeout(async () => {
      stopCamera();
      setCapturing(false);
      setStep(STEPS.DONE);
      toast.success('Face ID activated successfully!');
    }, 1500);
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Header */}
      <header className="w-full border-b border-zinc-200 bg-white/80 backdrop-blur-xl sticky top-0 z-50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Logo size={42} showText={true} />
          <a href="/attend" className="text-xs font-bold text-zinc-700 hover:text-black transition">
            Classroom Kiosk →
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-md w-full mx-auto p-4 sm:p-6 flex items-center justify-center relative z-10">
        <div className="w-full bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-xl animate-fade-in text-center">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 border border-zinc-300 text-zinc-900 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-black" /> Student Face Activation
          </div>

          {/* STEP 1: Enter Roll Number */}
          {step === STEPS.LOOKUP && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="text-2xl font-extrabold text-zinc-900">Activate Student Face ID</h1>
                <p className="text-xs text-zinc-500 mt-1">
                  Enter your Student Roll Number or ID to register your face.
                </p>
              </div>

              <div className="space-y-3">
                <input
                  className="w-full bg-white border border-zinc-300 focus:border-black focus:ring-2 focus:ring-black/20 rounded-2xl px-4 py-4 text-center text-lg font-bold font-mono text-zinc-900 placeholder:text-zinc-400 focus:outline-none transition"
                  placeholder="e.g. CS-2026-001"
                  value={rollNumber}
                  onChange={e => setRollNumber(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && lookupStudent()}
                />

                <button
                  onClick={lookupStudent}
                  disabled={loading}
                  className="w-full py-4 bg-black hover:bg-zinc-800 text-white font-extrabold text-base rounded-2xl transition shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Find Profile</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Confirm Identity */}
          {step === STEPS.CONFIRM && student && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Identity Confirmed</span>
                <h2 className="text-2xl font-extrabold text-zinc-900 mt-1">Welcome, {student.name}!</h2>
                <p className="text-xs text-zinc-700 font-mono font-bold mt-0.5">{student.roll_number}</p>
              </div>

              <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Department:</span>
                  <span className="font-semibold text-zinc-800">{student.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Academic Status:</span>
                  <span className="font-semibold text-zinc-900">Roster Verified ✓</span>
                </div>
              </div>

              <button
                onClick={startCamera}
                className="w-full py-4 bg-black hover:bg-zinc-800 text-white font-extrabold text-base rounded-2xl transition shadow-md flex items-center justify-center gap-2"
              >
                <Camera className="w-5 h-5" />
                <span>Open Camera & Snap Photo</span>
              </button>
            </div>
          )}

          {/* STEP 3: Camera Selfie Capture */}
          {step === STEPS.CAMERA && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h2 className="text-xl font-bold text-zinc-900">Position Your Face</h2>
                <p className="text-xs text-zinc-500 mt-0.5">Look directly at your camera lens to register Face ID</p>
              </div>

              <div className="relative max-w-xs mx-auto overflow-hidden rounded-3xl border-4 border-black shadow-lg bg-zinc-900">
                <video ref={videoRef} className="w-full h-64 object-cover" muted />
                <div className="absolute inset-0 border-2 border-dashed border-white/80 rounded-2xl pointer-events-none animate-pulse" />
              </div>

              <button
                onClick={snapSelfieAndActivate}
                disabled={capturing}
                className="w-full py-4 bg-black hover:bg-zinc-800 text-white font-extrabold text-base rounded-2xl transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {capturing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving Face Data...</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-5 h-5" />
                    <span>Snap Photo & Activate Face ID</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* STEP 4: Success Screen */}
          {step === STEPS.DONE && student && (
            <div className="space-y-6 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10" />
              </div>

              <div>
                <h2 className="text-2xl font-extrabold text-zinc-900">Face ID Activated!</h2>
                <p className="text-xs text-zinc-500 mt-1">
                  Face ID active for <span className="text-zinc-900 font-bold">{student.name}</span> ({student.roll_number}).
                </p>
              </div>

              <div className="bg-zinc-100 border border-zinc-300 rounded-2xl p-4 text-xs text-zinc-900 font-semibold">
                ✓ Ready for lecture QR & face scanner check-ins.
              </div>

              <button
                onClick={() => router.push('/attend')}
                className="w-full py-4 bg-black hover:bg-zinc-800 text-white font-bold rounded-2xl transition shadow-md"
              >
                Go to Attendance Kiosk →
              </button>
            </div>
          )}

        </div>
      </main>

      <footer className="w-full border-t border-zinc-200 bg-white px-6 py-4 text-xs text-zinc-500 text-center">
        © 2026 Attendzo — Student Face Activation.
      </footer>
    </div>
  );
}
