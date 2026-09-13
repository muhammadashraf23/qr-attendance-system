const mongoose = require('mongoose');

const publicHolidaySchema = new mongoose.Schema(
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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.PublicHoliday || mongoose.model('PublicHoliday', publicHolidaySchema);

