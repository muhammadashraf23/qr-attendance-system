const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');
const { Member, Staff } = require('../models');
const { AppError }      = require('../utils/AppError');
const env               = require('../config/env');

// ─── POST /api/auth/login  (student / teacher) ───────────────
const memberLogin = async (req, res, next) => {
  try {
    const { identifier, password } = req.body; // identifier = member_id, email, or phone
    if (!identifier || !password)
      throw new AppError('VALIDATION_ERROR', 'identifier and password are required.', 400);

    const member = await Member.findOne({
      $or: [{ member_id: identifier }, { email: identifier.toLowerCase() }, { phone: identifier }],
      is_active: true,
    });

    if (!member)
      throw new AppError('INVALID_CREDENTIALS', 'Invalid credentials.', 401);

    const ok = await bcrypt.compare(password, member.password_hash);
    if (!ok) throw new AppError('INVALID_CREDENTIALS', 'Invalid credentials.', 401);

    const token = jwt.sign(
      { member_id: member.member_id, name: member.full_name, role: member.role, type: 'member' },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN || '7d' }
    );

    const memberObj = member.toObject();
    delete memberObj.password_hash;

    return res.json({ success: true, token, user: memberObj });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/auth/staff/login  (dean / registrar / hod) ───
const staffLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      throw new AppError('VALIDATION_ERROR', 'email and password are required.', 400);

    const staff = await Staff.findOne({ email: email.toLowerCase(), is_active: true });
    if (!staff)
      throw new AppError('INVALID_CREDENTIALS', 'Invalid credentials.', 401);

    const ok = await bcrypt.compare(password, staff.password_hash);
    if (!ok) throw new AppError('INVALID_CREDENTIALS', 'Invalid credentials.', 401);

    staff.last_login_at = new Date();
    await staff.save();

    const token = jwt.sign(
      { id: staff._id, name: staff.full_name, email: staff.email, role: staff.role, type: 'staff' },
      env.JWT_SECRET,
      { expiresIn: env.JWT_ADMIN_EXPIRES_IN || '8h' }
    );

    const staffObj = staff.toObject();
    delete staffObj.password_hash;

    return res.json({ success: true, token, staff: staffObj });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/auth/register-member  (staff creates a member) ─
const registerMember = async (req, res, next) => {
  try {
    const {
      member_id,
      full_name,
      email,
      phone,
      department_name,
      role_title,
      role = 'student',
      enrolled_at,
      monthly_stipend,
      password,
    } = req.body;

    if (!member_id || !full_name || !email || !password)
      throw new AppError('VALIDATION_ERROR', 'member_id, full_name, email, and password are required.', 400);

    const hash = await bcrypt.hash(password, 12);

    const member = await Member.create({
      member_id,
      full_name,
      email: email.toLowerCase(),
      phone: phone || '',
      department_name: department_name || '',
      role_title: role_title || '',
      role,
      enrolled_at: enrolled_at ? new Date(enrolled_at) : new Date(),
      monthly_stipend: monthly_stipend || 0,
      password_hash: hash,
    });

    const memberObj = member.toObject();
    delete memberObj.password_hash;

    return res.status(201).json({ success: true, member: memberObj });
  } catch (err) {
    if (err.code === 11000)
      return next(new AppError('DUPLICATE', 'Member ID or email already exists.', 409));
    next(err);
  }
};

// ─── POST /api/auth/register-institution ─────────────────────
const registerInstitution = async (req, res, next) => {
  try {
    const { institution_name, admin_name, email, password, role } = req.body;
    if (!institution_name || !email || !password)
      throw new AppError('VALIDATION_ERROR', 'institution_name, email, and password are required.', 400);

    const existing = await Staff.findOne({ email: email.toLowerCase() });
    if (existing)
      throw new AppError('DUPLICATE', 'A staff account with this email already exists.', 409);

    const hash = await bcrypt.hash(password, 12);

    const staff = await Staff.create({
      full_name: admin_name || `${institution_name} Dean`,
      email: email.toLowerCase(),
      password_hash: hash,
      role: role || 'dean',
    });

    const token = jwt.sign(
      { id: staff._id, name: staff.full_name, email: staff.email, role: staff.role, type: 'staff' },
      env.JWT_SECRET,
      { expiresIn: env.JWT_ADMIN_EXPIRES_IN || '8h' }
    );

    const staffObj = staff.toObject();
    delete staffObj.password_hash;

    return res.status(201).json({
      success: true,
      token,
      message: 'Institution registered successfully.',
      staff: staffObj,
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/auth/register-user  (student / teacher self-signup) ─
const registerUser = async (req, res, next) => {
  try {
    const {
      member_id,    // roll_number for students, staff_id for teachers
      full_name,
      email,
      phone,
      password,
      role = 'student',   // 'student' | 'teacher'
      department_name,
      role_title,
      semester,
      batch_year,
    } = req.body;

    if (!member_id || !full_name || !email || !password)
      throw new AppError('VALIDATION_ERROR', 'member_id, full_name, email, and password are required.', 400);

    if (!['student', 'teacher', 'lab_assistant', 'hod'].includes(role))
      throw new AppError('VALIDATION_ERROR', 'Invalid role. Must be student, teacher, lab_assistant, or hod.', 400);

    const hash = await bcrypt.hash(password, 12);

    const member = await Member.create({
      member_id,
      full_name,
      email: email.toLowerCase(),
      phone: phone || '',
      role,
      department_name: department_name || '',
      role_title: role_title || (role === 'teacher' ? 'Faculty' : 'Student'),
      semester: semester || '',
      batch_year: batch_year || null,
      enrolled_at: new Date(),
      password_hash: hash,
    });

    const token = jwt.sign(
      { member_id: member.member_id, name: member.full_name, role: member.role, type: 'member' },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN || '7d' }
    );

    const memberObj = member.toObject();
    delete memberObj.password_hash;

    return res.status(201).json({ success: true, token, user: memberObj });
  } catch (err) {
    if (err.code === 11000)
      return next(new AppError('DUPLICATE', 'Member ID or email already registered.', 409));
    next(err);
  }
};

// ─── GET /api/auth/me  (member — own profile) ────────────────
const getMe = async (req, res, next) => {
  try {
    const { member_id } = req.user;
    const member = await Member.findOne({ member_id }).select('-password_hash').lean();
    if (!member) throw new AppError('NOT_FOUND', 'User not found.', 404);
    return res.json({ success: true, data: member });
  } catch (err) {
    next(err);
  }
};

module.exports = { memberLogin, staffLogin, registerMember, registerInstitution, registerUser, getMe };
