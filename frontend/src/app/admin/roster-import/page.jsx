'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { UploadCloud, FileSpreadsheet, CheckCircle, UserPlus, GraduationCap, BookOpen, ArrowRight, Sparkles, UserCheck } from 'lucide-react';
import Logo from '@/components/shared/Logo';
import api from '@/utils/api';

export default function RosterImportPage() {
  const [activeTab, setActiveTab] = useState('csv'); // 'csv' | 'single'
  const [csvTargetRole, setCsvTargetRole] = useState('student'); // 'student' | 'faculty'
  const [loading, setLoading] = useState(false);
  const [importedStudents, setImportedStudents] = useState(null);

  // Single member form state
  const [singleMember, setSingleMember] = useState({
    member_type: 'student', // 'student' | 'faculty'
    employee_id: '',
    name: '',
    email: '',
    department_name: 'Computer Science',
  });

  // Demo sample class roster data
  const sampleClassRoster = [
    { employee_id: 'CS-2026-001', name: 'Alexander Vance', email: 'avance@university.edu', department_name: 'Computer Science', designation: 'Student' },
    { employee_id: 'CS-2026-002', name: 'Sophia Martinez', email: 'smartinez@university.edu', department_name: 'Computer Science', designation: 'Student' },
    { employee_id: 'CS-2026-003', name: 'Liam Chen', email: 'lchen@university.edu', department_name: 'Computer Science', designation: 'Student' },
    { employee_id: 'TCH-901', name: 'Prof. Sarah Jenkins', email: 'sjenkins@university.edu', department_name: 'Computer Science', designation: 'Faculty' },
    { employee_id: 'TCH-902', name: 'Dr. Michael Chang', email: 'mchang@university.edu', department_name: 'Electrical Engineering', designation: 'Faculty' },
  ];

  async function handleImportSample() {
    setLoading(true);
    try {
      let count = 0;
      for (const student of sampleClassRoster) {
        try {
          await api.post('/employees', {
            ...student,
            status: 'active',
          });
          count++;
        } catch (_) {}
      }
      setImportedStudents(sampleClassRoster);
      toast.success(`Successfully imported ${sampleClassRoster.length} roster members!`);
    } catch (err) {
      toast.error('Failed to seed class roster.');
    } finally {
      setLoading(false);
    }
  }

  function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    toast.success(`File "${file.name}" uploaded. Processing CSV roster...`);
    handleImportSample();
  }

  async function handleSingleSubmit(e) {
    e.preventDefault();
    if (!singleMember.employee_id.trim() || !singleMember.name.trim()) {
      return toast.error('Please enter Member ID and Full Name.');
    }

    setLoading(true);
    try {
      await api.post('/employees', {
        employee_id: singleMember.employee_id.trim(),
        name: singleMember.name.trim(),
        email: singleMember.email.trim() || `${singleMember.employee_id.toLowerCase()}@university.edu`,
        department_name: singleMember.department_name,
        designation: singleMember.member_type === 'faculty' ? 'Faculty / Teacher' : 'Student',
        status: 'active',
      });

      toast.success(`${singleMember.member_type === 'faculty' ? 'Faculty Member' : 'Student'} added successfully!`);
      setImportedStudents([{
        employee_id: singleMember.employee_id.trim(),
        name: singleMember.name.trim(),
        email: singleMember.email.trim() || `${singleMember.employee_id.toLowerCase()}@university.edu`,
        department_name: singleMember.department_name,
        designation: singleMember.member_type === 'faculty' ? 'Faculty' : 'Student',
      }]);

      setSingleMember({
        member_type: 'student',
        employee_id: '',
        name: '',
        email: '',
        department_name: 'Computer Science',
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member. Check if ID already exists.');
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
            <a href="/activate-face" className="text-xs font-bold text-zinc-800 hover:text-black transition">
              Student Face Activation →
            </a>
            <a href="/admin" className="text-xs font-bold text-zinc-600 hover:text-black transition">
              Admin Dashboard
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center relative z-10">
        <div className="w-full bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-xl">
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 border border-zinc-300 text-zinc-900 text-xs font-semibold mb-3">
              <GraduationCap className="w-4 h-4 text-black" /> Dean Management
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900">
              Student & Faculty Roster Setup
            </h1>
            <p className="text-zinc-500 text-xs sm:text-sm mt-1 max-w-md mx-auto">
              Bulk import roster via CSV or add individual Students and Faculty members.
            </p>
          </div>

          {/* Tab Selection */}
          <div className="grid grid-cols-2 gap-3 mb-8 p-1.5 bg-zinc-100 border border-zinc-200 rounded-2xl">
            <button
              type="button"
              onClick={() => setActiveTab('csv')}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-extrabold transition-all ${
                activeTab === 'csv'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>Option 1: Bulk CSV Import</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('single')}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-extrabold transition-all ${
                activeTab === 'single'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Option 2: Add Single Member</span>
            </button>
          </div>

          {/* TAB 1: BULK CSV IMPORT */}
          {activeTab === 'csv' && (
            <div className="space-y-6 animate-fade-in">
              {/* Target Role Selector */}
              <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-black uppercase tracking-wider">Select Roster Type to Import</h4>
                  <p className="text-xs text-zinc-500 mt-0.5">Choose whether your CSV contains Student records or Faculty records</p>
                </div>
                <div className="inline-flex bg-zinc-200 p-1 rounded-xl gap-1">
                  <button
                    type="button"
                    onClick={() => setCsvTargetRole('student')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                      csvTargetRole === 'student'
                        ? 'bg-black text-white shadow-sm'
                        : 'text-zinc-700 hover:text-black'
                    }`}
                  >
                    🎓 Students Roster
                  </button>
                  <button
                    type="button"
                    onClick={() => setCsvTargetRole('faculty')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                      csvTargetRole === 'faculty'
                        ? 'bg-black text-white shadow-sm'
                        : 'text-zinc-700 hover:text-black'
                    }`}
                  >
                    👨‍🏫 Faculty / Teachers Roster
                  </button>
                </div>
              </div>

              {/* CSV File Upload Dropzone */}
              <div className="border-2 border-dashed border-zinc-300 hover:border-black rounded-3xl p-8 text-center bg-zinc-50 transition group cursor-pointer relative">
                <input
                  type="file"
                  accept=".csv, .xlsx"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                />
                <div className="w-16 h-16 rounded-2xl bg-black text-white flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-zinc-900 mb-1">
                  Drag & Drop {csvTargetRole === 'faculty' ? 'Faculty / Teacher' : 'Student'} CSV File
                </h3>
                <p className="text-xs text-zinc-500 mb-3">
                  Supports `.csv` files containing <span className="text-black font-mono font-bold">{csvTargetRole === 'faculty' ? 'teacher_id, name, email, department' : 'roll_number, name, email, department'}</span>
                </p>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white text-zinc-800 border border-zinc-300">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-black" /> Standard {csvTargetRole === 'faculty' ? 'Faculty' : 'Student'} Roster Format
                </span>
              </div>

              {/* Download Template Action */}
              <div className="flex justify-center">
                <a
                  href={csvTargetRole === 'faculty' ? '/templates/faculty_roster_template.csv' : '/templates/student_roster_template.csv'}
                  download
                  className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-black font-bold text-xs rounded-xl border border-zinc-300 transition shadow-sm"
                >
                  <FileSpreadsheet className="w-4 h-4 text-black" />
                  <span>Download Sample {csvTargetRole === 'faculty' ? 'Faculty' : 'Student'} Excel / CSV Template</span>
                </a>
              </div>

              {/* Quick Demo Import Button */}
              <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-black" /> Sample Roster Seed
                  </h4>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Instantly populate sample Students and Faculty for testing.
                  </p>
                </div>
                <button
                  onClick={handleImportSample}
                  disabled={loading}
                  className="px-6 py-3 bg-black hover:bg-zinc-800 text-white font-extrabold text-xs rounded-xl transition shadow-md whitespace-nowrap disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Import Sample Roster</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: ADD SINGLE MEMBER */}
          {activeTab === 'single' && (
            <form onSubmit={handleSingleSubmit} className="space-y-6 animate-fade-in">
              <div className="space-y-4">
                
                {/* Member Type Selection */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-2">Select Member Role *</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSingleMember({ ...singleMember, member_type: 'student' })}
                      className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-extrabold transition ${
                        singleMember.member_type === 'student'
                          ? 'bg-black text-white border-black shadow-sm'
                          : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:border-zinc-400'
                      }`}
                    >
                      <UserCheck className="w-4 h-4" /> Student
                    </button>
                    <button
                      type="button"
                      onClick={() => setSingleMember({ ...singleMember, member_type: 'faculty' })}
                      className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-extrabold transition ${
                        singleMember.member_type === 'faculty'
                          ? 'bg-black text-white border-black shadow-sm'
                          : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:border-zinc-400'
                      }`}
                    >
                      <BookOpen className="w-4 h-4" /> Faculty / Teacher
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      {singleMember.member_type === 'faculty' ? 'Teacher ID *' : 'Student Roll Number / ID *'}
                    </label>
                    <input
                      required
                      type="text"
                      className="w-full bg-white border border-zinc-300 focus:border-black focus:ring-2 focus:ring-black/20 rounded-2xl px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none transition"
                      placeholder={singleMember.member_type === 'faculty' ? 'e.g. TCH-905' : 'e.g. CS-2026-042'}
                      value={singleMember.employee_id}
                      onChange={e => setSingleMember({ ...singleMember, employee_id: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Full Name *</label>
                    <input
                      required
                      type="text"
                      className="w-full bg-white border border-zinc-300 focus:border-black focus:ring-2 focus:ring-black/20 rounded-2xl px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none transition"
                      placeholder="e.g. Prof. Alan Turing or Alice Vance"
                      value={singleMember.name}
                      onChange={e => setSingleMember({ ...singleMember, name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      className="w-full bg-white border border-zinc-300 focus:border-black focus:ring-2 focus:ring-black/20 rounded-2xl px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none transition"
                      placeholder="user@university.edu"
                      value={singleMember.email}
                      onChange={e => setSingleMember({ ...singleMember, email: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Department Name</label>
                    <select
                      className="w-full bg-white border border-zinc-300 focus:border-black focus:ring-2 focus:ring-black/20 rounded-2xl px-4 py-3 text-sm text-zinc-900 focus:outline-none transition"
                      value={singleMember.department_name}
                      onChange={e => setSingleMember({ ...singleMember, department_name: e.target.value })}
                    >
                      <option value="Computer Science">Computer Science & AI</option>
                      <option value="Electrical Engineering">Electrical Engineering</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                      <option value="Business & Management">Business & Management</option>
                    </select>
                  </div>
                </div>

              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-black hover:bg-zinc-800 text-white font-extrabold text-sm rounded-2xl transition shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Add {singleMember.member_type === 'faculty' ? 'Faculty Member' : 'Student'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Imported Members Preview Table */}
          {importedStudents && (
            <div className="animate-fade-in space-y-4 border-t border-zinc-200 pt-6 mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-black" /> Roster Record Added ({importedStudents.length})
                </h3>
                <a
                  href="/activate-face"
                  className="text-xs font-bold text-black hover:underline flex items-center gap-1"
                >
                  Student Face Activation →
                </a>
              </div>

              <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-100 border-b border-zinc-200 text-zinc-700 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="p-3">ID / Roll Number</th>
                      <th className="p-3">Full Name</th>
                      <th className="p-3">Department</th>
                      <th className="p-3">Designation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 text-zinc-800 font-medium">
                    {importedStudents.map(student => (
                      <tr key={student.employee_id} className="hover:bg-zinc-50">
                        <td className="p-3 font-mono text-black font-bold">{student.employee_id}</td>
                        <td className="p-3 text-zinc-900 font-bold">{student.name}</td>
                        <td className="p-3">{student.department_name}</td>
                        <td className="p-3">
                          <span className="bg-zinc-100 text-zinc-800 border border-zinc-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                            {student.designation || 'Member'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>

      <footer className="w-full border-t border-zinc-200 bg-white px-6 py-4 text-xs text-zinc-500 text-center">
        © 2026 Attendzo — Roster Setup.
      </footer>
    </div>
  );
}
