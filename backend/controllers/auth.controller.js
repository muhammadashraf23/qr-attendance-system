const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Employee, Admin } = require('../models');
const { AppError } = require('../utils/AppError');
const env = require('../config/env');

// ─── POST /api/auth/login  (employee) ────────────────────────
const employeeLogin = async (req, res, next) => {
  try {
    const { identifier, password } = req.body; // identifier = employee_id, email, or phone
    if (!identifier || !password)
      throw new AppError('VALIDATION_ERROR', 'identifier and password are required.', 400);

    const emp = await Employee.findOne({
      $or: [{ employee_id: identifier }, { email: identifier.toLowerCase() }, { phone: identifier }],
      is_active: true,
    });

    if (!emp)
      throw new AppError('INVALID_CREDENTIALS', 'Invalid credentials.', 401);

    const ok = await bcrypt.compare(password, emp.password_hash);
    if (!ok) throw new AppError('INVALID_CREDENTIALS', 'Invalid credentials.', 401);

    const token = jwt.sign(
      { employee_id: emp.employee_id, name: emp.full_name, type: 'employee' },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN || '7d' }
    );

    const empObj = emp.toObject();
    delete empObj.password_hash;

    return res.json({ success: true, token, employee: empObj });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/auth/admin/login ───────────────────────────────
const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      throw new AppError('VALIDATION_ERROR', 'email and password are required.', 400);

    const admin = await Admin.findOne({ email: email.toLowerCase(), is_active: true });
    if (!admin)
      throw new AppError('INVALID_CREDENTIALS', 'Invalid credentials.', 401);

    const ok = await bcrypt.compare(password, admin.password_hash);
    if (!ok) throw new AppError('INVALID_CREDENTIALS', 'Invalid credentials.', 401);

    admin.last_login_at = new Date();
    await admin.save();

    const token = jwt.sign(
      { id: admin._id, name: admin.name, email: admin.email, role: admin.role, type: 'admin' },
      env.JWT_SECRET,
      { expiresIn: env.JWT_ADMIN_EXPIRES_IN || '8h' }
    );

    const adminObj = admin.toObject();
    delete adminObj.password_hash;

    return res.json({ success: true, token, admin: adminObj });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/auth/register  (admin creates employee) ───────
const registerEmployee = async (req, res, next) => {
  try {
    const {
      employee_id,
      full_name,
      email,
      phone,
      department_id,
      department_name,
      designation,
      date_of_joining,
      base_salary,
      password,
    } = req.body;

    const required = [employee_id, full_name, email, phone, date_of_joining, password];
    if (required.some((v) => !v))
      throw new AppError('VALIDATION_ERROR', 'Missing required fields.', 400);

    const hash = await bcrypt.hash(password, 12);

    const employee = await Employee.create({
      employee_id,
      full_name,
      email: email.toLowerCase(),
      phone,
      department_name: department_name || '',
      designation: designation || '',
      date_of_joining: new Date(date_of_joining),
      base_salary: base_salary || 0,
      password_hash: hash,
    });

    const empObj = employee.toObject();
    delete empObj.password_hash;

    return res.status(201).json({ success: true, employee: empObj });
  } catch (err) {
    if (err.code === 11000)
      return next(new AppError('DUPLICATE', 'Employee ID, email, or phone already exists.', 409));
    next(err);
  }
};

// ─── POST /api/auth/register-institution ─────────────────────
const registerInstitution = async (req, res, next) => {
  try {
    const { institution_name, institution_code, admin_name, email, password, office_lat, office_lng, geofence_radius_meters, type } = req.body;
    if (!institution_name || !email || !password)
      throw new AppError('VALIDATION_ERROR', 'institution_name, email, and password are required.', 400);

    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
    if (existingAdmin)
      throw new AppError('DUPLICATE', 'An admin with this email already exists.', 409);

    const hash = await bcrypt.hash(password, 12);

    const admin = await Admin.create({
      name: admin_name || `${institution_name} Admin`,
      email: email.toLowerCase(),
      password_hash: hash,
      role: req.body.role || 'dean',
    });

    const token = jwt.sign(
      { id: admin._id, name: admin.name, email: admin.email, role: admin.role, type: 'admin' },
      env.JWT_SECRET,
      { expiresIn: env.JWT_ADMIN_EXPIRES_IN || '8h' }
    );

    const adminObj = admin.toObject();
    delete adminObj.password_hash;

    return res.status(201).json({
      success: true,
      token,
      message: 'Institution workspace registered successfully.',
      admin: adminObj,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { employeeLogin, adminLogin, registerEmployee, registerInstitution };
