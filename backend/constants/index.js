const ROLES = {
  SUPER_ADMIN: 'super_admin',
  HR_ADMIN: 'hr_admin',
  EMPLOYEE: 'employee',
};

const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LEAVE: 'leave',
  HALF_DAY: 'half_day',
};

const LEAVE_TYPES = {
  CASUAL: 'casual',
  SICK: 'sick',
  PAID: 'paid',
};

const LEAVE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

module.exports = {
  ROLES,
  ATTENDANCE_STATUS,
  LEAVE_TYPES,
  LEAVE_STATUS,
};
