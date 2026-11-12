const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  couponId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, default: "" },
  discountType: { type: String, enum: ["percentage", "fixed"], required: true },
  discountValue: { type: Number, required: true, min: 1 },
  expiresAt: { type: Date, required: true },
  maxRedemptions: { type: Number, required: true, min: 1 },
  redemptionCount: { type: Number, default: 0 },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  merchant: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  txHash: { type: String, required: true },
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Coupon", couponSchema);
