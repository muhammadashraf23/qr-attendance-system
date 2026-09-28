const jwt = require('jsonwebtoken');
const { AppError } = require('../utils/AppError');

/**
 * Verify JWT and attach decoded payload to req.user (members) / req.staff (staff)
 */
const authenticate = (type = 'member') => (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer '))
    return next(new AppError('UNAUTHORIZED', 'Authentication token required.', 401));

  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== type)
      return next(new AppError('FORBIDDEN', `${type} token required.`, 403));

    if (type === 'staff') req.staff = decoded;
    else req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError')
      return next(new AppError('TOKEN_EXPIRED', 'Session expired. Please log in again.', 401));
    return next(new AppError('INVALID_TOKEN', 'Invalid token.', 401));
  }
};

const authenticateMember = authenticate('member');
const authenticateStaff  = authenticate('staff');

/** Require specific staff role(s) */
const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.staff?.role))
    return next(new AppError('FORBIDDEN', 'Insufficient permissions.', 403));
  next();
};

// Keep legacy alias so any existing code that still says authenticateEmployee/authenticateAdmin
// doesn't crash during a partial migration — remove once frontend is fully updated.
const authenticateEmployee = authenticateMember;
const authenticateAdmin    = authenticateStaff;

module.exports = {
  authenticateMember,
  authenticateStaff,
  authenticateEmployee,   // legacy alias
  authenticateAdmin,      // legacy alias
  requireRole,
};
