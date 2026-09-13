const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema(
  {
    name: {
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
    password_hash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['dean', 'admin', 'super_admin', 'hr_admin', 'viewer'],
      default: 'dean',
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    last_login_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Admin || mongoose.model('Admin', adminSchema);

