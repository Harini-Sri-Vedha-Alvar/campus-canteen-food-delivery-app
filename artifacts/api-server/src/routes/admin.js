import { Router } from "express";
import { Restaurant } from "../models/Restaurant";
import { Order } from "../models/Order";
import { User } from "../models/User";
import { requireAuth, requireAdmin } from "../lib/auth";
import { formatRestaurant } from "./restaurants";
const router = Router();
router.post("/admin/restaurants", requireAuth, requireAdmin, async (req, res) => {
    const { name, description, cuisine, image, deliveryTime, deliveryFee, minOrder, address, isOpen, featured, tags } = req.body;
    if (!name || !cuisine || !deliveryTime || deliveryFee === undefined || minOrder === undefined || !address) {
        res.status(400).json({ error: "Missing required fields" });
        return;
    }
    const restaurant = new Restaurant({ name, description, cuisine, image, deliveryTime, deliveryFee, minOrder, address, isOpen: isOpen ?? true, featured: featured ?? false, tags: tags || [] });
    await restaurant.save();
    res.status(201).json(formatRestaurant(restaurant));
});
router.put("/admin/restaurants/:id", requireAuth, requireAdmin, async (req, res) => {
    const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const restaurant = await Restaurant.findByIdAndUpdate(raw, req.body, { new: true });
    if (!restaurant) {
        res.status(404).json({ error: "Restaurant not found" });
        return;
    }
    res.json(formatRestaurant(restaurant));
});
router.delete("/admin/restaurants/:id", requireAuth, requireAdmin, async (req, res) => {
    const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const restaurant = await Restaurant.findByIdAndDelete(raw);
    if (!restaurant) {
        res.status(404).json({ error: "Restaurant not found" });
        return;
    }
    res.sendStatus(204);
});
router.get("/admin/revenue", requireAuth, requireAdmin, async (_req, res) => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const [allOrders, todayOrders, weekOrders, monthOrders] = await Promise.all([
        Order.find({ status: "delivered" }),
        Order.find({ status: "delivered", createdAt: { $gte: todayStart } }),
        Order.find({ status: "delivered", createdAt: { $gte: weekStart } }),
        Order.find({ status: "delivered", createdAt: { $gte: monthStart } }),
    ]);
    const totalOrders = await Order.countDocuments();
    const completedOrders = allOrders.length;
    const cancelledOrders = await Order.countDocuments({ status: "cancelled" });
    const totalRevenue = allOrders.reduce((s, o) => s + o.total, 0);
    const todayRevenue = todayOrders.reduce((s, o) => s + o.total, 0);
    const weekRevenue = weekOrders.reduce((s, o) => s + o.total, 0);
    const monthRevenue = monthOrders.reduce((s, o) => s + o.total, 0);
    const avgOrderValue = completedOrders > 0 ? totalRevenue / completedOrders : 0;
    const restaurantRevMap = {};
    for (const o of allOrders) {
        if (!restaurantRevMap[o.restaurantId]) {
            restaurantRevMap[o.restaurantId] = { restaurantId: o.restaurantId, restaurantName: o.restaurantName, revenue: 0, orders: 0 };
        }
        restaurantRevMap[o.restaurantId].revenue += o.total;
        restaurantRevMap[o.restaurantId].orders += 1;
    }
    const topRestaurants = Object.values(restaurantRevMap)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)
        .map(r => ({ ...r, name: r.restaurantName }));
    const revenueByDayMap = {};
    for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const key = d.toISOString().slice(0, 10);
        revenueByDayMap[key] = { date: key, revenue: 0, orders: 0 };
    }
    for (const o of weekOrders) {
        const key = new Date(o.createdAt).toISOString().slice(0, 10);
        if (revenueByDayMap[key]) {
            revenueByDayMap[key].revenue += o.total;
            revenueByDayMap[key].orders += 1;
        }
    }
    res.json({
        totalRevenue,
        todayRevenue,
        weekRevenue,
        monthRevenue,
        totalOrders,
        completedOrders,
        cancelledOrders,
        averageOrderValue: Math.round(avgOrderValue * 100) / 100,
        topRestaurants,
        revenueByDay: Object.values(revenueByDayMap),
        dailyRevenue: Object.values(revenueByDayMap),
    });
});
router.get("/admin/stats", requireAuth, requireAdmin, async (_req, res) => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const [totalUsers, totalRestaurants, totalOrders, pendingOrders, activeOrders, deliveredOrders, todayOrders, recentOrders] = await Promise.all([
        User.countDocuments({ role: "user" }),
        Restaurant.countDocuments(),
        Order.countDocuments(),
        Order.countDocuments({ status: "placed" }),
        Order.countDocuments({ status: { $in: ["confirmed", "preparing", "out_for_delivery"] } }),
        Order.find({ status: "delivered" }),
        Order.find({ createdAt: { $gte: todayStart } }),
        Order.find().sort({ createdAt: -1 }).limit(10),
    ]);
    const totalRevenue = deliveredOrders.reduce((s, o) => s + o.total, 0);
    const todayRevenue = todayOrders.filter((o) => o.status === "delivered").reduce((s, o) => s + o.total, 0);
    res.json({
        totalUsers,
        totalRestaurants,
        totalOrders,
        pendingOrders,
        activeOrders,
        totalRevenue,
        todayOrders: todayOrders.length,
        todayRevenue,
        recentOrders: recentOrders.map((o) => ({
            id: o._id.toString(),
            restaurantName: o.restaurantName,
            userName: o.userName,
            userEmail: o.userEmail,
            total: o.total,
            status: o.status,
            createdAt: o.createdAt?.toISOString() || new Date().toISOString(),
        })),
    });
});
export default router;
