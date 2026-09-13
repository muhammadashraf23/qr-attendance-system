const jwt = require('jsonwebtoken');
const { AppError } = require('../utils/AppError');

/**
 * Verify JWT and attach decoded payload to req.user / req.admin
 */
const authenticate = (type = 'employee') => (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer '))
    return next(new AppError('UNAUTHORIZED', 'Authentication token required.', 401));

  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== type)
      return next(new AppError('FORBIDDEN', `${type} token required.`, 403));

    if (type === 'admin') req.admin = decoded;
    else req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError')
      return next(new AppError('TOKEN_EXPIRED', 'Session expired. Please log in again.', 401));
    return next(new AppError('INVALID_TOKEN', 'Invalid token.', 401));
  }
};

const authenticateEmployee = authenticate('employee');
const authenticateAdmin    = authenticate('admin');

/** Require specific admin role(s) */
const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.admin?.role))
    return next(new AppError('FORBIDDEN', 'Insufficient permissions.', 403));
  next();
};

module.exports = { authenticateEmployee, authenticateAdmin, requireRole };
