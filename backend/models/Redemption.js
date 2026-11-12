const mongoose = require("mongoose");

const redemptionSchema = new mongoose.Schema({
  coupon: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon", required: true },
  couponId: { type: String, required: true },
  merchant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  txHash: { type: String, required: true },
  redeemedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("Redemption", redemptionSchema);
