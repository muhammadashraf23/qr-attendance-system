const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema(
  {
    employee_id: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    leave_type: {
      type: String,
      enum: ['casual', 'sick', 'paid', 'other'],
      required: true,
    },
    from_date: {
      type: String, // Format: YYYY-MM-DD
      required: true,
    },
    to_date: {
      type: String, // Format: YYYY-MM-DD
      required: true,
    },
    days_requested: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled'],
      default: 'pending',
      index: true,
    },
    admin_comment: {
      type: String,
      default: null,
    },
    reviewed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
    reviewed_at: {
      type: Date,
      default: null,
    },
    submitted_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.LeaveRequest || mongoose.model('LeaveRequest', leaveRequestSchema);

