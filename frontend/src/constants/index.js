export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Attendzo';

export const ROLES = {
  DEAN: 'dean',
  TEACHER: 'teacher',
  STUDENT: 'student',
};

export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LEAVE: 'leave',
  HALF_DAY: 'half_day',
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  ATTEND: '/attend',
  ADMIN: '/admin',
  ADMIN_EMPLOYEES: '/admin/employees',
  ADMIN_LEAVE: '/admin/leave',
  ADMIN_PAYROLL: '/admin/payroll',
  ADMIN_REPORTS: '/admin/reports',
  EMPLOYEE: '/employee',
  EMPLOYEE_LEAVE: '/employee/leave',
  EMPLOYEE_PAYROLL: '/employee/payroll',
};
