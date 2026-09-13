const ROLES = {
  DEAN: 'dean',
  TEACHER: 'teacher',
  STUDENT: 'student',
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
