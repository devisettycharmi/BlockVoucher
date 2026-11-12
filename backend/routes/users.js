const router = require("express").Router();
const { authenticate } = require("../middleware/auth");
const { updateWallet } = require("../controllers/adminController");
router.put("/wallet", authenticate, updateWallet);
module.exports = router;
