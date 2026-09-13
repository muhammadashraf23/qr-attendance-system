'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import { saveTokenToIDB } from '@/utils/offlineDB';

// ─── Employee Auth ────────────────────────────────────────────
const EmployeeAuthContext = createContext(null);

export function EmployeeAuthProvider({ children }) {
  const [employee, setEmployee] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('employee_token');
    const data  = localStorage.getItem('employee_data');
    if (token && data) setEmployee(JSON.parse(data));
    setLoading(false);
  }, []);

  const login = useCallback(async (identifier, password) => {
    const { data } = await api.post('/auth/login', { identifier, password });
    localStorage.setItem('employee_token', data.token);
    localStorage.setItem('employee_data',  JSON.stringify(data.employee));
    await saveTokenToIDB(data.token).catch(() => {});
    setEmployee(data.employee);
    router.push('/employee');
  }, [router]);

  const logout = useCallback(() => {
    localStorage.removeItem('employee_token');
    localStorage.removeItem('employee_data');
    setEmployee(null);
    router.push('/login');
  }, [router]);

  return (
    <EmployeeAuthContext.Provider value={{ employee, login, logout, loading }}>
      {children}
    </EmployeeAuthContext.Provider>
  );
}

export const useEmployeeAuth = () => {
  const ctx = useContext(EmployeeAuthContext);
  if (!ctx) throw new Error('useEmployeeAuth must be inside EmployeeAuthProvider');
  return ctx;
};

// ─── Admin Auth ───────────────────────────────────────────────
const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin,   setAdmin]   = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const data  = localStorage.getItem('admin_data');
    if (token && data) setAdmin(JSON.parse(data));
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/admin/login', { email, password });
    localStorage.setItem('admin_token', data.token);
    localStorage.setItem('admin_data',  JSON.stringify(data.admin));
    setAdmin(data.admin);
    router.push('/admin');
  }, [router]);

  const logout = useCallback(() => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_data');
    setAdmin(null);
    router.push('/login');
  }, [router]);

  return (
    <AdminAuthContext.Provider value={{ admin, login, logout, loading }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be inside AdminAuthProvider');
  return ctx;
};
