const mongoose = require('mongoose');

const payrollRecordSchema = new mongoose.Schema(
  {
    employee_id: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
    base_salary: {
      type: Number,
      default: 0,
    },
    working_days: {
      type: Number,
      default: 0,
    },
    present_days: {
      type: Number,
      default: 0,
    },
    absent_days: {
      type: Number,
      default: 0,
    },
    leave_days: {
      type: Number,
      default: 0,
    },
    late_deduction: {
      type: Number,
      default: 0,
    },
    overtime_bonus: {
      type: Number,
      default: 0,
    },
    other_deductions: {
      type: Number,
      default: 0,
    },
    other_allowances: {
      type: Number,
      default: 0,
    },
    gross_salary: {
      type: Number,
      default: 0,
    },
    net_salary: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['draft', 'finalized', 'paid'],
      default: 'draft',
    },
    generated_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
    generated_at: {
      type: Date,
      default: Date.now,
    },
    finalized_at: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

payrollRecordSchema.index({ employee_id: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.models.PayrollRecord || mongoose.model('PayrollRecord', payrollRecordSchema);

