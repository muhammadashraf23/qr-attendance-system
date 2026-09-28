const mongoose = require('mongoose');

/**
 * LectureSession — represents one live lecture QR session.
 * A teacher opens this; the QR code encodes session_token.
 * Students scan it to mark attendance for that subject lecture.
 */
const lectureSessionSchema = new mongoose.Schema(
  {
    session_token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    subject_code: {
      type: String,
      required: true,
      trim: true,
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
    teacher_name: {
      type: String,
      default: '',
    },
    department: {
      type: String,
      default: '',
    },
    // When the QR is valid (timed window)
    expires_at: {
      type: Date,
      required: true,
      index: true,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    // Students who attended this lecture
    attendees: [
      {
        student_id: { type: String, required: true },
        student_name: { type: String, default: '' },
        roll_number: { type: String, default: '' },
        scanned_at: { type: Date, default: Date.now },
        method: { type: String, enum: ['qr', 'face'], default: 'qr' },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.models.LectureSession ||
  mongoose.model('LectureSession', lectureSessionSchema);

