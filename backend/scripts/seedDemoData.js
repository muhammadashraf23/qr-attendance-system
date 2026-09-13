const bcrypt = require('bcrypt');
const { connectDB } = require('../config/db');
const { Admin, Department, Employee, SystemSetting } = require('../models');

async function seedDemoData() {
  try {
    await connectDB();
    console.log('🌱 Starting demo data seed...');

    // 1. System Settings
    const defaultSettings = [
      { key: 'company_name', value: 'QR Attendance System', description: 'System name' },
      { key: 'office_lat', value: '22.5726', description: 'Office latitude' },
      { key: 'office_lng', value: '88.3639', description: 'Office longitude' },
      { key: 'gps_radius_meters', value: '100', description: 'Allowed GPS radius' },
      { key: 'face_confidence', value: '0.85', description: 'Face confidence threshold' },
      { key: 'late_threshold', value: '09:30', description: 'Late time threshold' },
      { key: 'working_hours_per_day', value: '8', description: 'Standard working hours' },
    ];

    for (const setting of defaultSettings) {
      await SystemSetting.findOneAndUpdate(
        { key: setting.key },
        { value: setting.value, description: setting.description },
        { upsert: true }
      );
    }
    console.log('✅ System settings seeded');

    // 2. Departments
    const deptNames = ['Management', 'Operations', 'Finance', 'HR', 'IT'];
    for (const name of deptNames) {
      await Department.findOneAndUpdate({ name }, { name }, { upsert: true });
    }
    console.log('✅ Departments seeded');

    // 3. Admin User
    const adminPassword = await bcrypt.hash('Admin@1234', 12);
    await Admin.findOneAndUpdate(
      { email: 'admin@company.com' },
      {
        name: 'System Admin',
        email: 'admin@company.com',
        password_hash: adminPassword,
        role: 'super_admin',
        is_active: true,
      },
      { upsert: true }
    );
    console.log('✅ Admin seeded: admin@company.com / Admin@1234');

    // 4. Demo Employees
    const empPassword = await bcrypt.hash('Admin@1234', 12);
    const demoEmployees = [
      {
        employee_id: 'ATZ-001',
        full_name: 'Rahul Sharma',
        email: 'rahul@company.com',
        phone: '9876543210',
        department_name: 'Management',
        designation: 'Manager',
        date_of_joining: new Date('2024-01-01'),
        base_salary: 45000,
        password_hash: empPassword,
        is_active: true,
      },
      {
        employee_id: 'ATZ-002',
        full_name: 'Priya Singh',
        email: 'priya@company.com',
        phone: '9876543211',
        department_name: 'Operations',
        designation: 'Field Officer',
        date_of_joining: new Date('2024-02-01'),
        base_salary: 35000,
        password_hash: empPassword,
        is_active: true,
      },
    ];

    for (const emp of demoEmployees) {
      await Employee.findOneAndUpdate({ employee_id: emp.employee_id }, emp, { upsert: true });
    }
    console.log('✅ Demo employees seeded: ATZ-001, ATZ-002 (Password: Admin@1234)');

    console.log('🎉 Demo data seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  seedDemoData();
}

module.exports = seedDemoData;

