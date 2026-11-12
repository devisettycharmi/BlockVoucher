const User = require("../models/User");
const Coupon = require("../models/Coupon");
const Redemption = require("../models/Redemption");
const { getContract } = require("../config/blockchain");

async function listMerchants(req, res, next) {
  try { res.json({ merchants: await User.find({ role: "merchant" }).select("name email walletAddress active createdAt") }); }
  catch (error) { next(error); }
}

async function listCustomers(req, res, next) {
  try { res.json({ customers: await User.find({ role: "customer", active: true }).select("name email active createdAt") }); }
  catch (error) { next(error); }
}

async function authorizeMerchant(req, res, next) {
  try {
    const merchant = await User.findOne({ _id: req.body.merchantId, role: "merchant", active: true });
    if (!merchant) return res.status(404).json({ message: "Active merchant not found" });
    if (!/^0x[a-fA-F0-9]{40}$/.test(merchant.walletAddress)) return res.status(400).json({ message: "Merchant must link a valid wallet address before authorization" });
    const contract = getContract({ signer: true });
    const tx = await contract.authorizeMerchant(merchant.walletAddress);
    const receipt = await tx.wait();
    res.json({ message: "Merchant authorized on-chain", txHash: receipt.hash });
  } catch (error) { next(error); }
}

async function updateWallet(req, res) {
  const { walletAddress } = req.body;
  if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress || "")) return res.status(400).json({ message: "A valid Ethereum address is required" });
  req.user.walletAddress = walletAddress;
  await req.user.save();
  res.json({ walletAddress });
}

async function transactions(req, res, next) {
  try {
    const redemptions = await Redemption.find().populate("merchant", "name").sort({ redeemedAt: -1 }).limit(100);
    const coupons = await Coupon.find().select("couponId txHash createdAt name").sort({ createdAt: -1 }).limit(100);
    res.json({ transactions: [
      ...coupons.map((item) => ({ txHash: item.txHash, couponId: item.couponId, type: "Coupon created", timestamp: item.createdAt, actor: "Admin" })),
      ...redemptions.map((item) => ({ txHash: item.txHash, couponId: item.couponId, type: "Coupon redeemed", timestamp: item.redeemedAt, actor: item.merchant?.name || "Merchant" }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) });
  } catch (error) { next(error); }
}

async function stats(req, res, next) {
  try {
    const now = new Date();
    const [totalCoupons, redeemed, customers, merchants] = await Promise.all([
      Coupon.countDocuments(), Coupon.countDocuments({ redemptionCount: { $gt: 0 } }),
      User.countDocuments({ role: "customer" }), User.countDocuments({ role: "merchant" })
    ]);
    const active = await Coupon.countDocuments({ active: true, expiresAt: { $gt: now }, $expr: { $lt: ["$redemptionCount", "$maxRedemptions"] } });
    res.json({ stats: { totalCoupons, active, redeemed, expired: totalCoupons - active, customers, merchants } });
  } catch (error) { next(error); }
}

module.exports = { listMerchants, listCustomers, authorizeMerchant, updateWallet, transactions, stats };
