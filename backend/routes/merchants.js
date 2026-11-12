const router = require("express").Router();
const controller = require("../controllers/adminController");
const { authenticate, allowRoles } = require("../middleware/auth");

router.use(authenticate, allowRoles("admin"));
router.get("/", controller.listMerchants);
router.post("/authorize", controller.authorizeMerchant);

module.exports = router;
