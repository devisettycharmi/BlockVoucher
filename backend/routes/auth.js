const router = require("express").Router();
const { register, login, profile } = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authenticate, profile);
module.exports = router;
