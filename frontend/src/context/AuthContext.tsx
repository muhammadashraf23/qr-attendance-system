'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import { saveTokenToIDB } from '@/utils/offlineDB';

export interface UserData {
  _id?: string;
  id?: string;
  user_id?: string;
  employee_id?: string;
  roll_number?: string;
  full_name: string;
  name?: string;
  email: string;
  role: string;
  department_name?: string;
  department?: string;
  designation?: string;
  semester?: string | number;
  [key: string]: any;
}

export type EmployeeData = UserData;
export type MemberData = UserData;

export interface StaffData {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  designation?: string;
  [key: string]: any;
}

export type AdminData = StaffData;

interface UserAuthContextType {
  user: UserData | null;
  employee: UserData | null;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export type EmployeeAuthContextType = UserAuthContextType;

interface StaffAuthContextType {
  staff: StaffData | null;
  admin: StaffData | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export type AdminAuthContextType = StaffAuthContextType;

const UserAuthContext = createContext<UserAuthContextType | null>(null);

export function UserAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const token = localStorage.getItem('user_token') || localStorage.getItem('employee_token');
      const data = localStorage.getItem('user_data') || localStorage.getItem('employee_data');
      if (token && data) setUser(JSON.parse(data));
    } catch (e) {
      console.error('Error loading user session', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(
    async (identifier: string, password: string) => {
      let res;
      try {
        res = await api.post('/auth/user/login', { identifier, password });
      } catch (err: any) {
        if (err.response?.status === 404) {
          res = await api.post('/auth/login', { identifier, password });
        } else {
          throw err;
        }
      }
      const data = res.data;
      const token = data.token;
      const userData = data.user || data.employee || data.member;

      localStorage.setItem('user_token', token);
      localStorage.setItem('employee_token', token);
      localStorage.setItem('user_data', JSON.stringify(userData));
      localStorage.setItem('employee_data', JSON.stringify(userData));
      await saveTokenToIDB(token).catch(() => {});
      setUser(userData);
      router.push('/student');
    },
    [router]
  );

  const logout = useCallback(() => {
    localStorage.removeItem('user_token');
    localStorage.removeItem('employee_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('employee_data');
    setUser(null);
    router.push('/login');
  }, [router]);

  return (
    <UserAuthContext.Provider value={{ user, employee: user, login, logout, loading }}>
      {children}
    </UserAuthContext.Provider>
  );
}

export const EmployeeAuthProvider = UserAuthProvider;

export const useUserAuth = (): UserAuthContextType => {
  const ctx = useContext(UserAuthContext);
  if (!ctx) throw new Error('useUserAuth must be inside UserAuthProvider');
  return ctx;
};

export const useEmployeeAuth = useUserAuth;
export const useStudentAuth = useUserAuth;

const StaffAuthContext = createContext<StaffAuthContextType | null>(null);

export function StaffAuthProvider({ children }: { children: React.ReactNode }) {
  const [staff, setStaff] = useState<StaffData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const token = localStorage.getItem('staff_token') || localStorage.getItem('admin_token');
      const data = localStorage.getItem('staff_data') || localStorage.getItem('admin_data');
      if (token && data) setStaff(JSON.parse(data));
    } catch (e) {
      console.error('Error loading staff session', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      let res;
      try {
        res = await api.post('/auth/staff/login', { email, password });
      } catch (err: any) {
        if (err.response?.status === 404) {
          res = await api.post('/auth/admin/login', { email, password });
        } else {
          throw err;
        }
      }
      const data = res.data;
      const token = data.token;
      const staffData = data.staff || data.admin;

      localStorage.setItem('staff_token', token);
      localStorage.setItem('admin_token', token);
      localStorage.setItem('staff_data', JSON.stringify(staffData));
      localStorage.setItem('admin_data', JSON.stringify(staffData));
      setStaff(staffData);
      router.push('/dean');
    },
    [router]
  );

  const logout = useCallback(() => {
    localStorage.removeItem('staff_token');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('staff_data');
    localStorage.removeItem('admin_data');
    setStaff(null);
    router.push('/login');
  }, [router]);

  return (
    <StaffAuthContext.Provider value={{ staff, admin: staff, login, logout, loading }}>
      {children}
    </StaffAuthContext.Provider>
  );
}

export const AdminAuthProvider = StaffAuthProvider;
export const DeanAuthProvider = StaffAuthProvider;

export const useStaffAuth = (): StaffAuthContextType => {
  const ctx = useContext(StaffAuthContext);
  if (!ctx) throw new Error('useStaffAuth must be inside StaffAuthProvider');
  return ctx;
};

export const useAdminAuth = useStaffAuth;
export const useDeanAuth = useStaffAuth;
