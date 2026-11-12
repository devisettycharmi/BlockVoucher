const router = require("express").Router();
const controller = require("../controllers/adminController");
const { authenticate, allowRoles } = require("../middleware/auth");

router.use(authenticate, allowRoles("admin"));
router.get("/merchants", controller.listMerchants);
router.get("/customers", controller.listCustomers);
router.get("/transactions", controller.transactions);
router.get("/stats", controller.stats);
router.post("/authorize", controller.authorizeMerchant);
module.exports = router;
