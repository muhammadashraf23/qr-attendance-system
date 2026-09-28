const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema(
  {
    member_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    full_name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      required: false,
      unique: false,
      trim: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    department_name: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['student', 'teacher', 'lab_assistant', 'hod'],
      default: 'student',
    },
    role_title: {
      // e.g. "Senior Faculty", "BS Student", "Lab Demonstrator"
      type: String,
      default: '',
    },
    enrolled_at: {
      // enrollment date for students, joining date for staff
      type: Date,
      default: Date.now,
    },
    semester: {
      type: String,
      default: '',
    },
    batch_year: {
      type: Number,
      default: null,
    },
    monthly_stipend: {
      // relevant for teachers only; 0 for students
      type: Number,
      default: 0,
    },
    password_hash: {
      type: String,
      required: true,
    },
    casual_leave_balance: {
      type: Number,
      default: 12,
    },
    medical_leave_balance: {
      type: Number,
      default: 10,
    },
    official_leave_balance: {
      type: Number,
      default: 15,
    },
    face_registered: {
      type: Boolean,
      default: false,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    profile_photo_url: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Member || mongoose.model('Member', memberSchema);
