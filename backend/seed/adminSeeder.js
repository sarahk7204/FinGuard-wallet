/**
 * Run: node src/seed/adminSeeder.js
 * Creates the default admin account if one doesn't already exist.
 */
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Wallet = require("../models/Wallet");

const seedAdmin = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  const existing = await User.findOne({ email: "admin@finguard.com" });
  if (existing) {
    console.log("Admin already exists. Skipping.");
    process.exit(0);
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash("Admin@123", salt);

  const admin = await User.create({
    name: "FinGuard Admin",
    email: "admin@finguard.com",
    password: hashedPassword,
    role: "admin",
    status: "active",
  });

  // Admin also gets a wallet (for consistency)
  await Wallet.create({
    userId: admin._id,
    balance: 0,
    currency: "PKR",
    status: "active",
  });

  console.log("✅ Admin created:");
  console.log("   Email:    admin@finguard.com");
  console.log("   Password: Admin@123");
  console.log("   (Change this password after first login!)");
  process.exit(0);
};

seedAdmin().catch((err) => {
  console.error("Seeder failed:", err);
  process.exit(1);
});
