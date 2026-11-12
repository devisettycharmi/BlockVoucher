const router = require("express").Router();
const ContactMessage = require("../models/ContactMessage");

router.post("/", async (req, res, next) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim();
    const message = String(req.body.message || "").trim();
    if (!name || name.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || !message || message.length > 5000) {
      return res.status(400).json({ message: "Enter a valid name, email, and message (up to 5,000 characters)" });
    }
    await ContactMessage.create({ name, email, message });
    res.status(201).json({ message: "Your message has been received" });
  } catch (error) { next(error); }
});

module.exports = router;
