const router = require("express").Router();
const controller = require("../controllers/couponController");
const { authenticate, allowRoles } = require("../middleware/auth");

router.use(authenticate);
router.get("/", controller.listCoupons);
router.get("/:id", controller.getCoupon);
router.post("/", allowRoles("admin"), controller.createCoupon);
router.post("/verify", allowRoles("merchant"), controller.verifyCoupon);
router.post("/redeem", allowRoles("merchant"), controller.redeemCoupon);
router.post("/:id/deactivate", allowRoles("admin"), controller.deactivateCoupon);
module.exports = router;
