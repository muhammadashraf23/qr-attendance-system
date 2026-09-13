require('dotenv').config();

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/qr_attendance',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  JWT_ADMIN_EXPIRES_IN: process.env.JWT_ADMIN_EXPIRES_IN || '8h',
  OFFICE_LATITUDE: parseFloat(process.env.OFFICE_LATITUDE || '22.5726'),
  OFFICE_LONGITUDE: parseFloat(process.env.OFFICE_LONGITUDE || '88.3639'),
  OFFICE_RADIUS: parseFloat(process.env.OFFICE_RADIUS || '100'),
  FACE_CONFIDENCE_THRESHOLD: parseFloat(process.env.FACE_CONFIDENCE_THRESHOLD || '0.85'),
};

module.exports = env;
