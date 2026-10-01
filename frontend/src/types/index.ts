export type UserRole = 'dean' | 'admin' | 'hod' | 'teacher' | 'student' | 'employee' | 'staff' | 'manager';

export interface Member {
  id: string | number;
  name: string;
  email: string;
  role: UserRole;
  institution_id?: string | number;
  roll_number?: string;
  department?: string;
  designation?: string;
  semester?: string | number;
  shift_id?: string | number;
  face_registered?: boolean;
  is_active?: boolean;
  created_at?: string;
  phone?: string;
  stipend_amount?: number;
}

export type User = Member;

export interface StaffMember {
  id: string | number;
  name: string;
  email: string;
  role: 'dean' | 'admin' | 'hod' | 'teacher' | 'staff';
  institution_id?: string | number;
  department?: string;
  designation?: string;
}

export interface AttendanceRecord {
  id: string | number;
  user_id?: string | number;
  member_id?: string | number;
  employee_id?: string;
  roll_number?: string;
  full_name?: string;
  name?: string;
  department?: string;
  date?: string;
  check_in_time?: string;
  check_out_time?: string;
  time?: string;
  status?: string;
  method?: string;
  is_late?: boolean;
  latitude?: number;
  longitude?: number;
  verified_at?: string;
  notes?: string;
}

export interface DefaulterStudent {
  id: string | number;
  name: string;
  roll_number: string;
  department: string;
  semester: string | number;
  total_lectures: number;
  attended_lectures: number;
  percentage: number;
  is_defaulter: boolean;
  parent_email?: string;
  phone?: string;
}

export interface LeaveApplication {
  id: string | number;
  user_id?: string | number;
  member_id?: string | number;
  employee_id?: string;
  employee_name?: string;
  member_name?: string;
  department?: string;
  leave_type: 'casual' | 'sick' | 'duty' | 'semester' | 'paid' | 'other' | string;
  from_date?: string;
  to_date?: string;
  start_date?: string;
  end_date?: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | string;
  created_at: string;
}

export type LeaveRequest = LeaveApplication;
