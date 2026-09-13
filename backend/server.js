require("dotenv").config();
const app = require("./app");
const { connectDB } = require("./config/db");
const seedAdmin = require("./scripts/seedAdmin");
const env = require("./config/env");

const PORT = env.PORT || 5000;

async function start() {
  try {
    await connectDB();

    // AUTO CREATE ADMIN
    await seedAdmin();

  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

start();
