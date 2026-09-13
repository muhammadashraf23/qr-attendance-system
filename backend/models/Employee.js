const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    employee_id: {
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
      required: true,
      unique: true,
      trim: true,
      index: true,
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
    designation: {
      type: String,
      default: '',
    },
    date_of_joining: {
      type: Date,
      required: true,
      default: Date.now,
    },
    base_salary: {
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
    sick_leave_balance: {
      type: Number,
      default: 10,
    },
    paid_leave_balance: {
      type: Number,
      default: 15,
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

module.exports = mongoose.models.Employee || mongoose.model('Employee', employeeSchema);

