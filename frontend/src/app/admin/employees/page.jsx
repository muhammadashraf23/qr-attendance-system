'use client';

import { useQuery } from '@tanstack/react-query';
import { UserPlus, Users } from 'lucide-react';
import api from '@/utils/api';

export default function EmployeesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-employees'],
    queryFn: async () => {
      const { data } = await api.get('/admin/employees');
      return data.data || [];
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Employee Management</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage workforce profiles and credentials</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
        <Users className="w-12 h-12 text-brand-primary mx-auto mb-3 opacity-80" />
        <h2 className="text-lg font-bold text-gray-800">Employee Directory</h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto mt-1">
          View, add, edit, or update employee records and face embeddings.
        </p>
      </div>
    </div>
  );
}
