const bcrypt = require('bcrypt');
const { connectDB } = require('../config/db');
const { Staff, SystemSetting } = require('../models');

async function seedDean() {
  try {
    // ── Default Staff (Dean) ────────────────────────────────
    const existing = await Staff.findOne({ email: 'dean@attendzo.edu' });

    if (!existing) {
      const hashedPassword = await bcrypt.hash('Dean@1234', 12);

      await Staff.create({
        full_name:     'Institution Dean',
        email:         'dean@attendzo.edu',
        password_hash: hashedPassword,
        role:          'dean',
        is_active:     true,
      });

      console.log('✅ Default Dean account created');
      console.log('   Email:    dean@attendzo.edu');
      console.log('   Password: Dean@1234');
    } else {
      console.log('ℹ️ Dean account already exists');
    }

    // ── Default System Settings (college-focused) ───────────
    const defaultSettings = [
      { key: 'institution_name',         value: 'Attendzo University',   description: 'Institution name' },
      { key: 'campus_lat',               value: '31.5204',               description: 'Campus latitude (Lahore default)' },
      { key: 'campus_lng',               value: '74.3587',               description: 'Campus longitude (Lahore default)' },
      { key: 'campus_radius_meters',     value: '200',                   description: 'Campus GPS geofence radius (metres)' },
      { key: 'late_threshold',           value: '08:30',                 description: 'Late arrival threshold (HH:MM)' },
      { key: 'working_hours_per_day',    value: '6',                     description: 'Standard academic day hours' },
      { key: 'attendance_threshold_pct', value: '75',                    description: '75% minimum attendance for exam eligibility' },
      { key: 'face_confidence',          value: '0.85',                  description: 'Face recognition confidence threshold' },
      { key: 'default_lecture_duration', value: '90',                    description: 'Default lecture QR window (minutes)' },
    ];

    for (const s of defaultSettings) {
      await SystemSetting.findOneAndUpdate(
        { key: s.key },
        { value: s.value, description: s.description },
        { upsert: true }
      );
    }
    console.log('✅ System settings seeded');
  } catch (error) {
    console.error('Seed error:', error.message);
  }
}

if (require.main === module) {
  connectDB()
    .then(() => seedDean())
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = seedDean;
