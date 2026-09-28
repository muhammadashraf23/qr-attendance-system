const mongoose = require('mongoose');

const academicHolidaySchema = new mongoose.Schema(
  {
    date: {
      type: String, // Format: YYYY-MM-DD
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    holiday_type: {
      type: String,
      enum: ['national', 'academic', 'semester_break', 'other'],
      default: 'national',
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.AcademicHoliday ||
  mongoose.model('AcademicHoliday', academicHolidaySchema);
