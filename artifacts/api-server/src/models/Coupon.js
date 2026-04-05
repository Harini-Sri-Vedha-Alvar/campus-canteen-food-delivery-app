import mongoose from "mongoose";
const couponSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, uppercase: true },
    description: { type: String, required: true },
    discountType: { type: String, enum: ["percentage", "flat"], required: true },
    discountValue: { type: Number, required: true },
    minOrderAmount: { type: Number, required: true },
    maxDiscount: { type: Number, default: null },
    isActive: { type: Boolean, default: true },
    expiresAt: { type: String, default: null },
    usageLimit: { type: Number, default: null },
    usedCount: { type: Number, default: 0 },
}, { timestamps: true });
export const Coupon = mongoose.model("Coupon", couponSchema);
