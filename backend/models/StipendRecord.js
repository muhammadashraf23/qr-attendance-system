const mongoose = require('mongoose');

const stipendRecordSchema = new mongoose.Schema(
  {
    staff_id: {
      // Only teaching staff receive stipends
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
    base_stipend: {
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
    other_deductions: {
      type: Number,
      default: 0,
    },
    other_allowances: {
      type: Number,
      default: 0,
    },
    gross_stipend: {
      type: Number,
      default: 0,
    },
    net_stipend: {
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
      ref: 'Staff',
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

stipendRecordSchema.index({ staff_id: 1, month: 1, year: 1 }, { unique: true });

module.exports =
  mongoose.models.StipendRecord ||
  mongoose.model('StipendRecord', stipendRecordSchema);
