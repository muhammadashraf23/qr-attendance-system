const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    member_id: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    date: {
      type: String, // Format: YYYY-MM-DD
      required: true,
      index: true,
    },
    clock_in_time: {
      type: Date,
      default: null,
    },
    clock_out_time: {
      type: Date,
      default: null,
    },
    working_minutes: {
      type: Number,
      default: 0,
    },
    clock_in_lat: {
      type: Number,
      default: null,
    },
    clock_in_lng: {
      type: Number,
      default: null,
    },
    clock_out_lat: {
      type: Number,
      default: null,
    },
    clock_out_lng: {
      type: Number,
      default: null,
    },
    gps_verified: {
      type: Boolean,
      default: false,
    },
    device_id: {
      type: String,
      default: null,
    },
    ip_address: {
      type: String,
      default: null,
    },
    method: {
      type: String,
      enum: ['qr', 'face', 'manual', 'kiosk', 'offline_sync'],
      default: 'qr',
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'leave', 'holiday', 'half_day'],
      default: 'present',
    },
    is_late: {
      type: Boolean,
      default: false,
    },
    late_minutes: {
      type: Number,
      default: 0,
    },
    is_offline_record: {
      type: Boolean,
      default: false,
    },
    synced_at: {
      type: Date,
      default: null,
    },
    is_manually_edited: {
      type: Boolean,
      default: false,
    },
    edited_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff',
      default: null,
    },
    edit_reason: {
      type: String,
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

// Enforce one record per member per date
attendanceSchema.index({ member_id: 1, date: 1 }, { unique: true });

module.exports = mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);
