import { Router } from "express";
import { Coupon } from "../models/Coupon";
import { requireAuth, requireAdmin } from "../lib/auth";
const router = Router();
function formatCoupon(c) {
    return {
        id: c._id.toString(),
        code: c.code,
        description: c.description,
        discountType: c.discountType,
        discountValue: c.discountValue,
        minOrderAmount: c.minOrderAmount,
        maxDiscount: c.maxDiscount,
        isActive: c.isActive,
        expiresAt: c.expiresAt,
        usageLimit: c.usageLimit,
        usedCount: c.usedCount,
    };
}
router.get("/coupons", async (_req, res) => {
    const coupons = await Coupon.find({ isActive: true });
    res.json(coupons.map(formatCoupon));
});
router.post("/coupons", requireAuth, requireAdmin, async (req, res) => {
    const { code, description, discountType, discountValue, minOrderAmount, maxDiscount, usageLimit, expiresAt } = req.body;
    if (!code || !description || !discountType || discountValue === undefined || minOrderAmount === undefined) {
        res.status(400).json({ error: "Missing required fields" });
        return;
    }
    const coupon = new Coupon({
        code: code.toUpperCase(),
        description,
        discountType,
        discountValue,
        minOrderAmount,
        maxDiscount,
        usageLimit,
        expiresAt,
    });
    await coupon.save();
    res.status(201).json(formatCoupon(coupon));
});
router.post("/coupons/validate", async (req, res) => {
    const { code, orderAmount } = req.body;
    if (!code || orderAmount === undefined) {
        res.status(400).json({ error: "code and orderAmount are required" });
        return;
    }
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) {
        res.status(400).json({ error: "Invalid or expired coupon" });
        return;
    }
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
        res.status(400).json({ error: "Coupon has expired" });
        return;
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        res.status(400).json({ error: "Coupon usage limit reached" });
        return;
    }
    if (orderAmount < coupon.minOrderAmount) {
        res.status(400).json({ error: `Minimum order amount is ₹${coupon.minOrderAmount}` });
        return;
    }
    res.json(formatCoupon(coupon));
});
export default router;
