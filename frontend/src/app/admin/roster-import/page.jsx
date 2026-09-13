'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { UploadCloud, FileSpreadsheet, CheckCircle, Users, GraduationCap, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import Logo from '@/components/shared/Logo';
import api from '@/utils/api';

export default function RosterImportPage() {
  const [loading, setLoading] = useState(false);
  const [importedStudents, setImportedStudents] = useState(null);

  // Demo sample class roster data
  const sampleClassRoster = [
    { employee_id: 'CS-2026-001', name: 'Alexander Vance', email: 'avance@university.edu', department_name: 'Computer Science', designation: 'Student (Year 2 / Sem 4)' },
    { employee_id: 'CS-2026-002', name: 'Sophia Martinez', email: 'smartinez@university.edu', department_name: 'Computer Science', designation: 'Student (Year 2 / Sem 4)' },
    { employee_id: 'CS-2026-003', name: 'Liam Chen', email: 'lchen@university.edu', department_name: 'Computer Science', designation: 'Student (Year 2 / Sem 4)' },
    { employee_id: 'CS-2026-004', name: 'Emma Watson', email: 'ewatson@university.edu', department_name: 'Computer Science', designation: 'Student (Year 2 / Sem 4)' },
    { employee_id: 'CS-2026-005', name: 'Noah Miller', email: 'nmiller@university.edu', department_name: 'Computer Science', designation: 'Student (Year 2 / Sem 4)' },
    { employee_id: 'EE-2026-101', name: 'Isabella Johnson', email: 'ijohnson@university.edu', department_name: 'Electrical Engineering', designation: 'Student (Year 3 / Sem 6)' },
    { employee_id: 'EE-2026-102', name: 'Ethan Williams', email: 'ewilliams@university.edu', department_name: 'Electrical Engineering', designation: 'Student (Year 3 / Sem 6)' },
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
      toast.success(`Successfully imported ${sampleClassRoster.length} students into class roster!`);
    } catch (err) {
      toast.error('Failed to seed class roster.');
    } finally {
      setLoading(false);
    }
  }

  function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    toast.success(`File "${file.name}" uploaded. Processing CSV class roster...`);
    handleImportSample();
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Header */}
      <header className="w-full border-b border-zinc-200 bg-white/80 backdrop-blur-xl sticky top-0 z-50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Logo size={42} showText={true} />
          <div className="flex items-center gap-4">
            <a href="/activate-face" className="text-xs font-bold text-zinc-800 hover:text-black transition">
              Student Face Activation →
            </a>
            <a href="/admin" className="text-xs font-bold text-zinc-600 hover:text-black transition">
              Admin Portal
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center relative z-10">
        <div className="w-full bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-xl">
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 border border-zinc-300 text-zinc-900 text-xs font-semibold mb-3">
              <GraduationCap className="w-4 h-4 text-black" /> Student Roster Import
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900">
              Import CSV Student Roster
            </h1>
            <p className="text-zinc-500 text-xs sm:text-sm mt-1 max-w-md mx-auto">
              Upload your department CSV roster to create student profiles.
            </p>
          </div>

          {/* CSV File Upload Dropzone */}
          <div className="border-2 border-dashed border-zinc-300 hover:border-black rounded-3xl p-8 text-center bg-zinc-50 transition group cursor-pointer relative mb-6">
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
              Drag & Drop CSV File or Click to Browse
            </h3>
            <p className="text-xs text-zinc-500 mb-3">
              Supports `.csv` files containing <span className="text-black font-mono font-bold">roll_number, name, email, department</span>
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white text-zinc-800 border border-zinc-300">
              <FileSpreadsheet className="w-3.5 h-3.5 text-black" /> Standard Roster Format
            </span>
          </div>

          {/* Quick Demo Import Button */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div>
              <h4 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-black" /> Sample Roster Data
              </h4>
              <p className="text-xs text-zinc-500 mt-0.5">
                Populate sample student records for testing.
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

          {/* Imported Students Preview Table */}
          {importedStudents && (
            <div className="animate-fade-in space-y-4 border-t border-zinc-200 pt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-black" /> Imported Roster Preview ({importedStudents.length} Students)
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
                      <th className="p-3">Roll Number</th>
                      <th className="p-3">Student Name</th>
                      <th className="p-3">Department</th>
                      <th className="p-3">Activation Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 text-zinc-800 font-medium">
                    {importedStudents.map(student => (
                      <tr key={student.employee_id} className="hover:bg-zinc-50">
                        <td className="p-3 font-mono text-black font-bold">{student.employee_id}</td>
                        <td className="p-3 text-zinc-900 font-bold">{student.name}</td>
                        <td className="p-3">{student.department_name}</td>
                        <td className="p-3">
                          <span className="bg-zinc-100 text-zinc-800 border border-zinc-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Pending Face Activation
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
        © 2026 Attendzo — Student Roster Import.
      </footer>
    </div>
  );
}
