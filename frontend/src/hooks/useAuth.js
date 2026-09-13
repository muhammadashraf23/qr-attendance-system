'use client';

import { useEmployeeAuth, useAdminAuth } from '@/context/AuthContext';

export { useEmployeeAuth, useAdminAuth };

export default function useAuth() {
  const employeeCtx = useEmployeeAuth();
  return employeeCtx;
}
