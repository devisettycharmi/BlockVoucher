const { randomUUID } = require("crypto");
const Coupon = require("../models/Coupon");
const Redemption = require("../models/Redemption");
const User = require("../models/User");
const { getContract } = require("../config/blockchain");

async function createCoupon(req, res, next) {
  try {
    const { name, description, discountType, discountValue, expiresAt, customerId, merchantId } = req.body;
    const expiry = new Date(expiresAt);
    const value = Number(discountValue);
    const limit = 1;
    if (!name?.trim() || !["percentage", "fixed"].includes(discountType) || !Number.isFinite(value) || value <= 0 ||
        !Number.isFinite(limit) || limit < 1 || Number.isNaN(expiry.getTime()) || expiry <= new Date()) {
      return res.status(400).json({ message: "Provide valid coupon details and a future expiry date" });
    }
    if (discountType === "percentage" && value > 100) return res.status(400).json({ message: "Percentage discount cannot exceed 100" });
    const customer = await User.findOne({ _id: customerId, role: "customer", active: true });
    if (!customer) return res.status(400).json({ message: "Select an active customer for this one-time coupon" });
    const merchant = merchantId ? await User.findOne({ _id: merchantId, role: "merchant", active: true }) : null;
    if (merchantId && !merchant) return res.status(400).json({ message: "Selected merchant is unavailable" });
    let couponId;
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const candidate = `BV-${randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase()}`;
      if (!(await Coupon.exists({ couponId: candidate }))) {
        couponId = candidate;
        break;
      }
    }
    if (!couponId) return res.status(503).json({ message: "Could not allocate a unique coupon ID; please retry" });
    const contract = getContract({ signer: true });
    const tx = await contract.createCoupon(couponId, name.trim(), discountType === "percentage" ? 0 : 1, Math.round(value * 100), Math.floor(expiry.getTime() / 1000), limit);
    const receipt = await tx.wait();
    const coupon = await Coupon.create({
      couponId, name: name.trim(), description: description || "", discountType, discountValue: value,
      expiresAt: expiry, maxRedemptions: limit, customer: customer._id, merchant: merchant?._id || null, createdBy: req.user._id,
      txHash: receipt.hash
    });
    await coupon.populate("customer", "name email");
    res.status(201).json({ coupon, txHash: receipt.hash });
  } catch (error) { next(error); }
}

async function listCoupons(req, res, next) {
  try {
    const query = {};
    if (req.user.role === "customer") query.active = true;
    if (req.user.role === "customer") query.customer = req.user._id;
    if (req.user.role === "merchant") query.$or = [{ merchant: req.user._id }, { merchant: null }];
    const coupons = await Coupon.find(query).populate("merchant", "name email").populate("customer", "name email").sort({ createdAt: -1 });
    res.json({ coupons });
  } catch (error) { next(error); }
}

async function getCoupon(req, res, next) {
  try {
    const coupon = await Coupon.findOne({ couponId: req.params.id }).populate("merchant", "name email").populate("customer", "name email");
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    if (req.user.role === "customer" && (!coupon.customer || String(coupon.customer._id) !== String(req.user._id))) {
      return res.status(404).json({ message: "Coupon not found" });
    }
    res.json({ coupon });
  } catch (error) { next(error); }
}

async function verifyCoupon(req, res, next) {
  try {
    const couponId = String(req.body.couponId || "").trim();
    if (!couponId) return res.status(400).json({ message: "Coupon ID is required" });
    const contract = getContract();
    const [valid, reason] = await contract.verifyCoupon(couponId);
    const coupon = await Coupon.findOne({ couponId }).populate("merchant", "name");
    const messages = ["Valid coupon", "Coupon does not exist on-chain", "Coupon has been deactivated", "Coupon has expired", "This coupon has already been used"];
    if (!valid) return res.json({ valid: false, alreadyRedeemed: Number(reason) === 4, reason: messages[Number(reason)] || "Coupon is invalid" });
    if (!coupon) return res.json({ valid: false, reason: "Coupon metadata is unavailable" });
    if (req.user.role === "merchant" && coupon.merchant && String(coupon.merchant._id) !== String(req.user._id)) {
      return res.json({ valid: false, reason: "Coupon is assigned to another merchant" });
    }
    res.json({ valid: true, coupon });
  } catch (error) { next(error); }
}

async function redeemCoupon(req, res, next) {
  try {
    if (req.user.role !== "merchant") return res.status(403).json({ message: "Only merchants can redeem coupons" });
    const couponId = String(req.body.couponId || "").trim();
    const coupon = await Coupon.findOne({ couponId });
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    if (coupon.merchant && String(coupon.merchant) !== String(req.user._id)) return res.status(403).json({ message: "Coupon is assigned to another merchant" });
    if (!req.user.walletAddress) return res.status(400).json({ message: "Link your authorized wallet before redeeming" });
    const txHashInput = String(req.body.txHash || "");
    if (txHashInput && !/^0x[a-fA-F0-9]{64}$/.test(txHashInput)) return res.status(400).json({ message: "Invalid blockchain transaction hash" });
    if (!txHashInput && !process.env.DEMO_MERCHANT_PRIVATE_KEY) {
      return res.status(503).json({ message: "Merchant wallet signing is not configured" });
    }
    const contract = txHashInput
      ? getContract()
      : getContract({ signer: true, privateKey: process.env.DEMO_MERCHANT_PRIVATE_KEY });
    const signerAddress = txHashInput ? req.user.walletAddress : await contract.runner.getAddress();
    if (!signerAddress || signerAddress.toLowerCase() !== req.user.walletAddress.toLowerCase()) {
      return res.status(403).json({ message: "Redemption signer does not match the merchant's linked wallet" });
    }
    let receipt;
    if (txHashInput) {
      receipt = await contract.runner.getTransactionReceipt(txHashInput);
    } else {
      const tx = await contract.redeemCoupon(couponId);
      receipt = await tx.wait();
    }
    if (!receipt || receipt.status !== 1) return res.status(400).json({ message: "Redemption transaction was not confirmed successfully" });
    const txHash = receipt.hash;
    const contractAddress = (process.env.CONTRACT_ADDRESS || require("../config/contract.json").address).toLowerCase();
    const redemptionEvent = receipt.logs.filter((log) => log.address.toLowerCase() === contractAddress).map((log) => {
      try { return contract.interface.parseLog(log); } catch { return null; }
    }).find((event) => event?.name === "CouponRedeemed" &&
      event.args.couponId === couponId &&
      event.args.merchant.toLowerCase() === signerAddress.toLowerCase());
    if (!redemptionEvent) return res.status(400).json({ message: "Transaction does not contain a matching coupon redemption event" });
    if (await Redemption.exists({ txHash })) return res.status(409).json({ message: "This transaction has already been recorded" });
    const updated = await Coupon.findOneAndUpdate(
      { _id: coupon._id, redemptionCount: { $lt: coupon.maxRedemptions } },
      { $inc: { redemptionCount: 1 } }, { new: true }
    );
    if (!updated) return res.status(409).json({ message: "Coupon redemption limit reached" });
    const redemption = await Redemption.create({ coupon: coupon._id, couponId, merchant: req.user._id, txHash });
    res.json({ message: "Coupon redeemed successfully", redemption, txHash });
  } catch (error) { next(error); }
}

async function deactivateCoupon(req, res, next) {
  try {
    const coupon = await Coupon.findOne({ couponId: req.params.id });
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    const tx = await getContract({ signer: true }).deactivateCoupon(coupon.couponId);
    const receipt = await tx.wait();
    coupon.active = false;
    await coupon.save();
    res.json({ message: "Coupon deactivated", txHash: receipt.hash });
  } catch (error) { next(error); }
}

module.exports = { createCoupon, listCoupons, getCoupon, verifyCoupon, redeemCoupon, deactivateCoupon };
