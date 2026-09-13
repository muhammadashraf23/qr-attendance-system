'use client';

import { Wallet } from 'lucide-react';

export default function AdminPayrollPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Payroll Management</h1>
        <p className="text-sm text-gray-400 mt-0.5">Generate monthly salary reports and calculations</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <Wallet className="w-12 h-12 text-brand-primary mx-auto mb-3 opacity-80" />
        <h2 className="text-lg font-bold text-gray-800">Monthly Payroll</h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto mt-1">
          Calculate base salary, overtime bonuses, and attendance deductions for employees.
        </p>
      </div>
    </div>
  );
}
