const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role, walletAddress: user.walletAddress };
}

function issueToken(user) {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is required");
  return jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "1d" });
}

async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body;
    if (!name?.trim() || !email || !password) return res.status(400).json({ message: "Name, email, and password are required" });
    if (password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters" });
    if (!["customer", "merchant"].includes(role || "customer")) return res.status(400).json({ message: "Invalid registration role" });
    const exists = await User.exists({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ message: "An account with this email already exists" });
    const user = await User.create({ name: name.trim(), email, passwordHash: await bcrypt.hash(password, 12), role: role || "customer" });
    res.status(201).json({ token: issueToken(user), user: publicUser(user) });
  } catch (error) { next(error); }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: String(email || "").toLowerCase() }).select("+passwordHash");
    if (!user || !user.active || !(await bcrypt.compare(password || "", user.passwordHash))) {
      return res.status(401).json({ message: "Email or password is incorrect" });
    }
    res.json({ token: issueToken(user), user: publicUser(user) });
  } catch (error) { next(error); }
}

async function profile(req, res) {
  res.json({ user: publicUser(req.user) });
}

module.exports = { register, login, profile };
