export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Attendzo';

export const ROLES = {
  DEAN: 'dean',
  TEACHER: 'teacher',
  STUDENT: 'student',
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  EMPLOYEE: 'employee',
} as const;

export type RoleType = typeof ROLES[keyof typeof ROLES];

export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LEAVE: 'leave',
  HALF_DAY: 'half_day',
  LATE: 'late',
} as const;

export type AttendanceStatusType = typeof ATTENDANCE_STATUS[keyof typeof ATTENDANCE_STATUS];

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  ATTEND: '/attend',
  ACTIVATE_FACE: '/activate-face',
  TEACHER_LECTURE_QR: '/teacher/lecture-qr',
  TEACHER_STUDENTS: '/teacher/students',
  ADMIN: '/admin',
  ADMIN_EMPLOYEES: '/admin/employees',
  ADMIN_LEAVE: '/admin/leave',
  ADMIN_PAYROLL: '/admin/payroll',
  ADMIN_REPORTS: '/admin/reports',
  ADMIN_ROSTER_IMPORT: '/admin/roster-import',
  ADMIN_ATTENDANCE: '/admin/attendance',
  EMPLOYEE: '/employee',
  EMPLOYEE_LEAVE: '/employee/leave',
  EMPLOYEE_PAYROLL: '/employee/payroll',
} as const;
