export interface User {
  id: string | number;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'student' | 'employee' | 'manager';
  institution_id?: string | number;
  roll_number?: string;
  department?: string;
  designation?: string;
  shift_id?: string | number;
  face_registered?: boolean;
}

export interface AttendanceRecord {
  id: string | number;
  user_id?: string | number;
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

export interface LeaveRequest {
  id: string | number;
  user_id?: string | number;
  employee_id?: string;
  employee_name?: string;
  department?: string;
  leave_type: 'casual' | 'sick' | 'paid' | 'other' | string;
  from_date?: string;
  to_date?: string;
  start_date?: string;
  end_date?: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | string;
  created_at: string;
}
