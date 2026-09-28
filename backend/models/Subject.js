const mongoose = require('mongoose');

/**
 * Subject — master record for a course (CS101 Algorithms etc.)
 * Enrollment list tracks which students are registered in this subject,
 * enabling per-subject defaulter analytics.
 */
const subjectSchema = new mongoose.Schema(
  {
    subject_code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    subject_name: {
      type: String,
      required: true,
      trim: true,
    },
    teacher_id: {
      type: String,
      required: true,
      index: true,
    },
    department: {
      type: String,
      default: '',
    },
    semester: {
      type: String,
      default: '',
    },
    // Total lectures conducted so far (incremented when a session closes)
    total_lectures: {
      type: Number,
      default: 0,
    },
    // Array of enrolled student IDs
    enrolled_students: [
      {
        type: String, // employee_id / roll_number
      },
    ],
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Subject || mongoose.model('Subject', subjectSchema);

