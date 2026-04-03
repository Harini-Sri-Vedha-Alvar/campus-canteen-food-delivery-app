import { Router, type IRouter, type Request, type Response } from "express";
import { Order } from "../models/Order";
import { MenuItem } from "../models/MenuItem";
import { Restaurant } from "../models/Restaurant";
import { Cart } from "../models/Cart";
import { User } from "../models/User";
import { Coupon } from "../models/Coupon";
import { requireAuth, requireAdmin } from "../lib/auth";

const router: IRouter = Router();

const TRACKING_STEPS = [
  { step: "placed", label: "Order Placed" },
  { step: "confirmed", label: "Order Confirmed" },
  { step: "preparing", label: "Preparing Your Food" },
  { step: "out_for_delivery", label: "Out for Delivery" },
  { step: "delivered", label: "Delivered" },
];

function formatOrder(o: any) {
  return {
    id: o._id.toString(),
    userId: o.userId.toString(),
    userName: o.userName,
    restaurantId: o.restaurantId,
    restaurantName: o.restaurantName,
    items: o.items.map((i: any) => ({
      menuItemId: i.menuItemId,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
      image: i.image,
    })),
    status: o.status,
    paymentMethod: o.paymentMethod,
    paymentStatus: o.paymentStatus,
    subtotal: o.subtotal,
    deliveryFee: o.deliveryFee,
    discount: o.discount,
    total: o.total,
    couponCode: o.couponCode,
    coinsUsed: o.coinsUsed,
    coinsEarned: o.coinsEarned,
    deliveryAddress: o.deliveryAddress,
    estimatedDeliveryTime: o.estimatedDeliveryTime,
    trackingSteps: o.trackingSteps.map((s: any) => ({
      step: s.step,
      label: s.label,
      isCompleted: s.isCompleted,
      completedAt: s.completedAt,
    })),
    createdAt: o.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: o.updatedAt?.toISOString() || new Date().toISOString(),
  };
}

router.get("/orders", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).user.userId;
  const orders = await Order.find({ userId }).sort({ createdAt: -1 });
  res.json(orders.map(formatOrder));
});

router.post("/orders", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).user.userId;
  const { restaurantId, items, paymentMethod, deliveryAddress, couponCode, useCoins } = req.body;
  if (!restaurantId || !items?.length || !paymentMethod || !deliveryAddress) {
    res.status(400).json({ error: "Missing required order fields" });
    return;
  }
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) {
    res.status(404).json({ error: "Restaurant not found" });
    return;
  }
  const user = await User.findById(userId);
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }
  const orderItems: any[] = [];
  let subtotal = 0;
  for (const item of items) {
    const menuItem = await MenuItem.findById(item.menuItemId);
    if (!menuItem) continue;
    const orderItem = {
      menuItemId: item.menuItemId,
      name: menuItem.name,
      price: menuItem.price,
      quantity: item.quantity,
      image: menuItem.image,
    };
    orderItems.push(orderItem);
    subtotal += menuItem.price * item.quantity;
  }
  const deliveryFee = restaurant.deliveryFee;
  let discount = 0;
  let validCoupon = null;
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
    if (coupon && subtotal >= coupon.minOrderAmount) {
      if (coupon.discountType === "percentage") {
        discount = (subtotal * coupon.discountValue) / 100;
        if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
      } else {
        discount = coupon.discountValue;
      }
      validCoupon = coupon;
    }
  }
  let coinsUsed = 0;
  let coinsDiscount = 0;
  if (useCoins && user.coins > 0) {
    coinsUsed = Math.min(user.coins, Math.floor(subtotal / 10) * 50);
    coinsDiscount = (coinsUsed / 50) * 5;
    discount += coinsDiscount;
  }
  const total = Math.max(0, subtotal + deliveryFee - discount);
  const coinsEarned = subtotal >= 200 ? 50 : 10;
  const estimatedMinutes = parseInt(restaurant.deliveryTime) || 35;
  const eta = new Date(Date.now() + estimatedMinutes * 60 * 1000).toISOString();
  const trackingSteps = TRACKING_STEPS.map((s, idx) => ({
    step: s.step,
    label: s.label,
    isCompleted: idx === 0,
    completedAt: idx === 0 ? new Date().toISOString() : null,
  }));
  const order = new Order({
    userId,
    userName: user.name,
    restaurantId,
    restaurantName: restaurant.name,
    items: orderItems,
    paymentMethod,
    paymentStatus: paymentMethod === "online" ? "paid" : "pending",
    subtotal,
    deliveryFee,
    discount,
    total,
    couponCode: validCoupon?.code || null,
    coinsUsed,
    coinsEarned,
    deliveryAddress,
    estimatedDeliveryTime: eta,
    trackingSteps,
  });
  await order.save();
  user.coins = user.coins - coinsUsed + coinsEarned;
  await user.save();
  if (validCoupon) {
    validCoupon.usedCount += 1;
    await validCoupon.save();
  }
  await Cart.findOneAndUpdate({ userId }, { items: [], restaurantId: null, discount: 0, couponCode: null });
  res.status(201).json(formatOrder(order));
});

router.get("/orders/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const order = await Order.findById(raw);
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  res.json(formatOrder(order));
});

router.patch("/orders/:id/status", requireAuth, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { status, estimatedDeliveryTime } = req.body;
  if (!status) {
    res.status(400).json({ error: "status is required" });
    return;
  }
  const order = await Order.findById(raw);
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  const stepIdx = TRACKING_STEPS.findIndex(s => s.step === status);
  if (stepIdx >= 0) {
    for (let i = 0; i <= stepIdx; i++) {
      order.trackingSteps[i].isCompleted = true;
      if (!order.trackingSteps[i].completedAt) {
        order.trackingSteps[i].completedAt = new Date().toISOString();
      }
    }
  }
  order.status = status;
  if (estimatedDeliveryTime) order.estimatedDeliveryTime = estimatedDeliveryTime;
  await order.save();
  res.json(formatOrder(order));
});

router.get("/admin/orders", requireAuth, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { status, page } = req.query as Record<string, string>;
  const query: Record<string, unknown> = {};
  if (status) query.status = status;
  const pageNum = parseInt(page || "1");
  const limit = 20;
  const skip = (pageNum - 1) * limit;
  const orders = await Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
  res.json(orders.map(formatOrder));
});

export default router;
