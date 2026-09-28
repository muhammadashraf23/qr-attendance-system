require('dotenv').config();
const app       = require('./app');
const { connectDB } = require('./config/db');
const seedDean  = require('./scripts/seedDean');
const env       = require('./config/env');

const PORT = env.PORT || 5000;

async function start() {
  try {
    await connectDB();

    // Seed default dean account + system settings on first run
    await seedDean();

  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Attendzo API running on port ${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/health`);
  });
}

start();
