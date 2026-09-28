const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    hod_id: {
      // Head of Department member_id
      type: String,
      default: null,
    },
    faculty_count: {
      type: Number,
      default: 0,
    },
    student_count: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Department || mongoose.model('Department', departmentSchema);
