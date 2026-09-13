const bcrypt = require('bcrypt');
const { connectDB } = require('../config/db');
const { Admin } = require('../models');

async function seedAdmin() {
  try {
    const existing = await Admin.findOne({ email: 'admin@company.com' });

    if (!existing) {
      const hashedPassword = await bcrypt.hash('Admin@1234', 12);

      await Admin.create({
        name: 'System Admin',
        email: 'admin@company.com',
        password_hash: hashedPassword,
        role: 'super_admin',
        is_active: true,
      });

      console.log('✅ Default admin created');
      console.log('Email: admin@company.com');
      console.log('Password: Admin@1234');
    } else {
      console.log('ℹ️ Admin already exists');
    }
  } catch (error) {
    console.error('Admin seed error:', error.message);
  }
}

if (require.main === module) {
  connectDB()
    .then(() => seedAdmin())
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = seedAdmin;
