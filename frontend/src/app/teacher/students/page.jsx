'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Upload, UserPlus, BookOpen, Users, FileSpreadsheet, CheckCircle2, ArrowLeft } from 'lucide-react';
import Logo from '@/components/shared/Logo';
import api from '@/utils/api';

export default function TeacherStudentRosterPage() {
  const [tab, setTab] = useState('single'); // 'single' | 'bulk'
  const [csvRole, setCsvRole] = useState('student'); // 'student' | 'teacher'
  const [loading, setLoading] = useState(false);
  const [csvFile, setCsvFile] = useState(null);

  // Single Student Form State
  const [formData, setFormData] = useState({
    rollNo: '',
    fullName: '',
    email: '',
    phone: '',
    department: 'Computer Science',
    courseCode: 'CS101',
    role: 'student',
  });

  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/admin/employees', {
        employee_id: formData.rollNo,
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        department_name: formData.department,
        designation: `Student (${formData.courseCode})`,
        role: 'student',
      });
      toast.success(`Student ${formData.fullName} added to ${formData.courseCode} class roster!`);
      setFormData({
        rollNo: '',
        fullName: '',
        email: '',
        phone: '',
        department: 'Computer Science',
        courseCode: 'CS101',
        role: 'student',
      });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to add student');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!csvFile) {
      toast.error('Please select a CSV roster file first.');
      return;
    }
    setLoading(true);
    try {
      const data = new FormData();
      data.append('file', csvFile);
      await api.post('/admin/employees/import', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Class roster CSV imported successfully!');
      setCsvFile(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'CSV Import failed. Check formatting.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col font-sans">
      {/* Header */}
      <header className="w-full border-b border-zinc-200 bg-white/80 backdrop-blur-xl sticky top-0 z-50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Logo size={42} />
          <div className="flex items-center gap-3">
            <span className="bg-zinc-100 text-zinc-900 border border-zinc-300 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-black" /> Faculty Class Portal
            </span>
            <a href="/teacher/lecture-qr" className="text-xs font-bold text-zinc-600 hover:text-black transition flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Lecture QR
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto w-full px-6 py-10 flex-1">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-black tracking-tight">
            Class Roster Management
          </h1>
          <p className="text-zinc-500 text-sm mt-2 max-w-lg mx-auto">
            Enroll students into your course sections via single registration or bulk CSV import.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1 bg-zinc-100 border border-zinc-200 rounded-2xl gap-1">
            <button
              type="button"
              onClick={() => setTab('single')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                tab === 'single'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-zinc-600 hover:text-black'
              }`}
            >
              <UserPlus className="w-4 h-4" /> Add Single Student
            </button>
            <button
              type="button"
              onClick={() => setTab('bulk')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                tab === 'bulk'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-zinc-600 hover:text-black'
              }`}
            >
              <Upload className="w-4 h-4" /> Bulk Class CSV Import
            </button>
          </div>
        </div>

        {/* Option 1: Add Single Student */}
        {tab === 'single' && (
          <div className="bg-white border border-zinc-200 shadow-sm rounded-3xl p-8 max-w-xl mx-auto">
            <h2 className="text-lg font-bold text-black mb-1 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-black" /> Register Individual Student
            </h2>
            <p className="text-zinc-500 text-xs mb-6">
              Fill in student details to add them directly to your active class directory.
            </p>

            <form onSubmit={handleSingleSubmit} className="space-y-4">
              <div className="mb-4">
                <label className="block text-xs font-bold text-zinc-700 mb-1">Roster Role Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'student' })}
                    className={`py-2 px-3 text-xs font-extrabold rounded-xl border transition ${
                      formData.role === 'student'
                        ? 'bg-black text-white border-black'
                        : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:border-zinc-400'
                    }`}
                  >
                    🎓 Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'teacher' })}
                    className={`py-2 px-3 text-xs font-extrabold rounded-xl border transition ${
                      formData.role === 'teacher'
                        ? 'bg-black text-white border-black'
                        : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:border-zinc-400'
                    }`}
                  >
                    👨‍🏫 Faculty / TA
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  {formData.role === 'teacher' ? 'Faculty / Staff ID' : 'Roll Number / Student ID'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={formData.role === 'teacher' ? 'e.g. FAC-2026-09' : 'e.g. CS-2026-104'}
                  value={formData.rollNo}
                  onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="student@univ.edu"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 555-0199"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Department</label>
                  <input
                    type="text"
                    required
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Course Code</label>
                  <input
                    type="text"
                    required
                    value={formData.courseCode}
                    onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-black hover:bg-zinc-800 text-white font-bold text-sm rounded-xl transition shadow-md flex items-center justify-center gap-2 mt-4"
              >
                {loading ? 'Adding Student...' : 'Add Student to Class'}
              </button>
            </form>
          </div>
        )}

        {/* Option 2: Bulk CSV Import */}
        {tab === 'bulk' && (
          <div className="bg-white border border-zinc-200 shadow-sm rounded-3xl p-8 max-w-xl mx-auto">
            <h2 className="text-lg font-bold text-black mb-1 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-black" /> Upload Class CSV Roster
            </h2>
            <p className="text-zinc-500 text-xs mb-6">
              Import multiple students at once. Ensure your CSV contains: <code className="bg-zinc-100 px-1 py-0.5 rounded text-black font-mono">RollNo, FullName, Email, Phone, CourseCode</code>.
            </p>

            <form onSubmit={handleBulkUpload} className="space-y-4">
              <div className="mb-4">
                <label className="block text-xs font-bold text-zinc-700 mb-1">Select Target Roster Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCsvRole('student')}
                    className={`py-2 px-3 text-xs font-extrabold rounded-xl border transition ${
                      csvRole === 'student'
                        ? 'bg-black text-white border-black'
                        : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:border-zinc-400'
                    }`}
                  >
                    🎓 Students CSV
                  </button>
                  <button
                    type="button"
                    onClick={() => setCsvRole('teacher')}
                    className={`py-2 px-3 text-xs font-extrabold rounded-xl border transition ${
                      csvRole === 'teacher'
                        ? 'bg-black text-white border-black'
                        : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:border-zinc-400'
                    }`}
                  >
                    👨‍🏫 Faculty / Teachers CSV
                  </button>
                </div>
              </div>

              <div className="border-2 border-dashed border-zinc-300 hover:border-black rounded-2xl p-8 text-center transition cursor-pointer bg-zinc-50">
                <Upload className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                <label htmlFor="teacher-csv" className="cursor-pointer text-xs font-bold text-black block mb-1">
                  Click to select CSV File
                </label>
                <input
                  id="teacher-csv"
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files[0])}
                  className="hidden"
                />
                <span className="text-zinc-400 text-xs block">
                  {csvFile ? csvFile.name : 'Only .csv formatted roster files supported'}
                </span>
              </div>

              <div className="flex justify-center my-2">
                <a
                  href={csvRole === 'teacher' ? '/templates/faculty_roster_template.csv' : '/templates/student_roster_template.csv'}
                  download
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-black font-bold text-xs rounded-xl border border-zinc-300 transition"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-black" />
                  <span>Download Sample {csvRole === 'teacher' ? 'Faculty' : 'Student'} Excel / CSV Template</span>
                </a>
              </div>

              <button
                type="submit"
                disabled={loading || !csvFile}
                className={`w-full py-3 font-bold text-sm rounded-xl transition shadow-md flex items-center justify-center gap-2 ${
                  csvFile && !loading
                    ? 'bg-black hover:bg-zinc-800 text-white'
                    : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                }`}
              >
                {loading ? 'Uploading Roster...' : 'Import Class Roster'}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

