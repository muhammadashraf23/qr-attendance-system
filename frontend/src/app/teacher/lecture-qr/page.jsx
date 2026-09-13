'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { QrCode, BookOpen, Clock, Users, RefreshCw, CheckCircle2, ShieldCheck, Sparkles, Play, StopCircle } from 'lucide-react';
import Logo from '@/components/shared/Logo';

export default function TeacherLectureQRPage() {
  const [subject, setSubject] = useState('CS101');
  const [subjectName, setSubjectName] = useState('CS101 - Algorithms & Data Structures');
  const [activeSession, setActiveSession] = useState(false);
  const [timer, setTimer] = useState(45 * 60); // 45 minutes countdown
  const [checkedInCount, setCheckedInCount] = useState(18);

  const mockStudents = [
    { id: 'CS-2026-042', name: 'Alexander Vance', time: '09:15 AM', status: 'Present' },
    { id: 'CS-2026-018', name: 'Sophia Martinez', time: '09:16 AM', status: 'Present' },
    { id: 'CS-2026-089', name: 'Liam Chen', time: '09:18 AM', status: 'Present' },
    { id: 'CS-2026-004', name: 'Emma Watson', time: '09:22 AM', status: 'Late' },
  ];

  useEffect(() => {
    let interval = null;
    if (activeSession && timer > 0) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [activeSession, timer]);

  function startLectureSession() {
    setActiveSession(true);
    setTimer(45 * 60);
    toast.success(`Lecture QR Code active for ${subject}! Project on classroom screen.`);
  }

  function stopLectureSession() {
    setActiveSession(false);
    toast.error('Lecture session ended. Attendance locked.');
  }

  function formatTimer(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Header */}
      <header className="w-full border-b border-zinc-200 bg-white/80 backdrop-blur-xl sticky top-0 z-50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Logo size={42} />
          <div className="flex items-center gap-3">
            <span className="bg-zinc-100 text-zinc-900 border border-zinc-300 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-black" /> Faculty Portal
            </span>
            <a href="/admin" className="text-xs font-bold text-zinc-600 hover:text-black transition">
              Dashboard
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: QR Generator & Lecture Session Controls */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-xl">
              
              <div className="flex items-center justify-between pb-6 border-b border-zinc-200 mb-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 border border-zinc-300 text-zinc-900 text-xs font-semibold mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-black" /> Subject Lecture Attendance
                  </div>
                  <h1 className="text-2xl font-extrabold text-zinc-900">Subject Lecture QR Generator</h1>
                </div>
                <div className="p-3 rounded-2xl bg-zinc-100 border border-zinc-300 text-zinc-900">
                  <QrCode className="w-6 h-6" />
                </div>
              </div>

              {/* Subject Selector */}
              <div className="space-y-4 mb-6">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700">
                  Select Active Subject / Course Lecture
                </label>
                <select
                  disabled={activeSession}
                  value={subject}
                  onChange={e => {
                    setSubject(e.target.value);
                    const nameMap = {
                      CS101: 'CS101 - Algorithms & Data Structures',
                      EE202: 'EE202 - Digital Signal Processing',
                      ME301: 'ME301 - Engineering Thermodynamics',
                      BA405: 'BA405 - Corporate Finance & Analytics',
                    };
                    setSubjectName(nameMap[e.target.value]);
                  }}
                  className="input text-base font-bold bg-white border-zinc-300 text-zinc-900 focus:border-black focus:ring-black/20"
                >
                  <option value="CS101">CS101 - Algorithms & Data Structures</option>
                  <option value="EE202">EE202 - Digital Signal Processing</option>
                  <option value="ME301">ME301 - Engineering Thermodynamics</option>
                  <option value="BA405">BA405 - Corporate Finance & Analytics</option>
                </select>
              </div>

              {/* QR Display Area */}
              <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-6 text-center space-y-4">
                {activeSession ? (
                  <div className="space-y-4 animate-fade-in">
                    <div className="inline-block p-5 bg-white rounded-3xl shadow-xl border-4 border-black">
                      {/* Generates dynamic classroom SVG QR code */}
                      <svg className="w-48 h-48 mx-auto" viewBox="0 0 100 100">
                        <path fill="#000000" d="M0,0 h30 v30 h-30 z M40,0 h20 v10 h-20 z M70,0 h30 v30 h-30 z M10,10 h10 v10 h-10 z M80,10 h10 v10 h-10 z M0,40 h10 v20 h-10 z M20,40 h30 v10 h-30 z M60,40 h40 v10 h-40 z M0,70 h30 v30 h-30 z M10,80 h10 v10 h-10 z M40,60 h20 v40 h-20 z M70,70 h30 v30 h-30 z M80,80 h10 v10 h-10 z" />
                      </svg>
                    </div>

                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 bg-zinc-200 px-3 py-1 rounded-full border border-zinc-300">
                        Live Classroom QR • Project on Screen
                      </span>
                      <h3 className="text-lg font-bold text-zinc-900 mt-2">{subjectName}</h3>
                    </div>

                    <div className="flex items-center justify-center gap-6 pt-2">
                      <div className="flex items-center gap-2 text-zinc-900 font-mono text-xl font-bold bg-white px-4 py-2 rounded-2xl border border-zinc-300 shadow-sm">
                        <Clock className="w-5 h-5 text-black" />
                        <span>{formatTimer(timer)}</span>
                      </div>

                      <button
                        onClick={stopLectureSession}
                        className="px-5 py-2.5 bg-zinc-900 hover:bg-black text-white font-bold rounded-2xl text-xs transition flex items-center gap-2 shadow-sm"
                      >
                        <StopCircle className="w-4 h-4" /> End Session
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-black text-white flex items-center justify-center mx-auto">
                      <QrCode className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-zinc-900">Start Lecture Attendance Session</h3>
                      <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                        Generates a timed QR code for {subject}. Students scan on their phones to log subject attendance.
                      </p>
                    </div>
                    <button
                      onClick={startLectureSession}
                      className="px-8 py-4 bg-black hover:bg-zinc-800 text-white font-extrabold text-base rounded-2xl transition shadow-md flex items-center justify-center gap-2 mx-auto"
                    >
                      <Play className="w-5 h-5 fill-current" /> Start {subject} Lecture Session
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Right Column: Live Class Attendance Stream */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-xl">
              
              <div className="flex items-center justify-between pb-4 border-b border-zinc-200 mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-black" />
                  <h3 className="text-base font-bold text-zinc-900">Live Class Attendance</h3>
                </div>
                <span className="bg-zinc-100 text-zinc-900 border border-zinc-300 text-xs font-bold px-3 py-1 rounded-full">
                  {checkedInCount} Present
                </span>
              </div>

              <div className="space-y-3">
                {mockStudents.map(student => (
                  <div key={student.id} className="bg-zinc-50 border border-zinc-200 rounded-2xl p-3.5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-zinc-900 text-sm">{student.name}</p>
                      <p className="text-xs text-zinc-600 font-mono mt-0.5">{student.id}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        student.status === 'Present' ? 'bg-black text-white border-black' : 'bg-zinc-200 text-zinc-800 border-zinc-400'
                      }`}>
                        {student.status}
                      </span>
                      <p className="text-[10px] text-zinc-500 mt-1">{student.time}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-zinc-200 text-center">
                <p className="text-xs text-zinc-500">
                  Attendance recorded for <span className="text-zinc-900 font-semibold">{subjectName}</span>. Defaulter thresholds (&lt;75%) auto-updated.
                </p>
              </div>

            </div>
          </div>

        </div>
      </main>

      <footer className="w-full border-t border-zinc-200 bg-white px-6 py-4 text-xs text-zinc-500 text-center">
        © 2026 Attendzo — Subject Lecture Attendance.
      </footer>
    </div>
  );
}
