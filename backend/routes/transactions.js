const router = require("express").Router();
const Redemption = require("../models/Redemption");
const { authenticate, allowRoles } = require("../middleware/auth");

router.get("/", authenticate, allowRoles("admin", "merchant"), async (req, res, next) => {
  try {
    const filter = req.user.role === "merchant" ? { merchant: req.user._id } : {};
    const records = await Redemption.find(filter).populate("merchant", "name").sort({ redeemedAt: -1 }).limit(100);
    res.json({
      transactions: records.map((item) => ({
        txHash: item.txHash, couponId: item.couponId, type: "Coupon redeemed",
        timestamp: item.redeemedAt, actor: item.merchant?.name || "Merchant"
      }))
    });
  } catch (error) { next(error); }
});

module.exports = router;
