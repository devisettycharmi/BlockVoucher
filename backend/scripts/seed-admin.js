const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../models/User");

async function main() {
  if (!process.env.MONGODB_URI || !process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    throw new Error("Set MONGODB_URI, ADMIN_EMAIL, and ADMIN_PASSWORD in backend/.env");
  }
  if (process.env.ADMIN_PASSWORD.length < 12) throw new Error("ADMIN_PASSWORD must be at least 12 characters");
  await mongoose.connect(process.env.MONGODB_URI);
  const email = process.env.ADMIN_EMAIL.toLowerCase();
  const existing = await User.findOne({ email });
  if (existing) throw new Error(`Account ${email} already exists; refusing to overwrite it`);
  const user = await User.create({
    name: "BlockVoucher Administrator", email,
    passwordHash: await bcrypt.hash(process.env.ADMIN_PASSWORD, 12), role: "admin"
  });
  console.log(`Created admin account ${user.email}`);
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error.message);
  await mongoose.disconnect().catch(() => {});
  process.exitCode = 1;
});
