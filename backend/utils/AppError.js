// utils/AppError.js
class AppError extends Error {
  constructor(code, message, statusCode = 500, extra = {}) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.extra = extra;
    this.isOperational = true;
  }
}
module.exports = { AppError };
