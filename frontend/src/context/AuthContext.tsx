'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import { saveTokenToIDB } from '@/utils/offlineDB';

export interface EmployeeData {
  _id?: string;
  id?: string;
  employee_id: string;
  full_name: string;
  email: string;
  role: string;
  department_name?: string;
  designation?: string;
  [key: string]: any;
}

export interface AdminData {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: string;
  [key: string]: any;
}

interface EmployeeAuthContextType {
  employee: EmployeeData | null;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

interface AdminAuthContextType {
  admin: AdminData | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const EmployeeAuthContext = createContext<EmployeeAuthContextType | null>(null);

export function EmployeeAuthProvider({ children }: { children: React.ReactNode }) {
  const [employee, setEmployee] = useState<EmployeeData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const token = localStorage.getItem('employee_token');
      const data = localStorage.getItem('employee_data');
      if (token && data) setEmployee(JSON.parse(data));
    } catch (e) {
      console.error('Error loading employee session', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(
    async (identifier: string, password: string) => {
      const { data } = await api.post('/auth/login', { identifier, password });
      localStorage.setItem('employee_token', data.token);
      localStorage.setItem('employee_data', JSON.stringify(data.employee));
      await saveTokenToIDB(data.token).catch(() => {});
      setEmployee(data.employee);
      router.push('/employee');
    },
    [router]
  );

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

export const useEmployeeAuth = (): EmployeeAuthContextType => {
  const ctx = useContext(EmployeeAuthContext);
  if (!ctx) throw new Error('useEmployeeAuth must be inside EmployeeAuthProvider');
  return ctx;
};

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const token = localStorage.getItem('admin_token');
      const data = localStorage.getItem('admin_data');
      if (token && data) setAdmin(JSON.parse(data));
    } catch (e) {
      console.error('Error loading admin session', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const { data } = await api.post('/auth/admin/login', { email, password });
      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_data', JSON.stringify(data.admin));
      setAdmin(data.admin);
      router.push('/admin');
    },
    [router]
  );

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

export const useAdminAuth = (): AdminAuthContextType => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be inside AdminAuthProvider');
  return ctx;
};
