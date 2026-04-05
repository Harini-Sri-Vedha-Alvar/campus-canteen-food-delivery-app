import { Router } from "express";
import { Review } from "../models/Review";
import { MenuItem } from "../models/MenuItem";
import { Restaurant } from "../models/Restaurant";
import { requireAuth } from "../lib/auth";
const router = Router();
function formatReview(r) {
    return {
        id: r._id.toString(),
        userId: r.userId.toString(),
        userName: r.userName,
        userAvatar: r.userAvatar,
        menuItemId: r.menuItemId,
        restaurantId: r.restaurantId,
        orderId: r.orderId.toString(),
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt?.toISOString() || new Date().toISOString(),
    };
}
router.get("/reviews", async (req, res) => {
    const { menuItemId, restaurantId } = req.query;
    const query = {};
    if (menuItemId)
        query.menuItemId = menuItemId;
    if (restaurantId)
        query.restaurantId = restaurantId;
    const reviews = await Review.find(query).sort({ createdAt: -1 });
    res.json(reviews.map(formatReview));
});
router.post("/reviews", requireAuth, async (req, res) => {
    const userId = req.user.userId;
    const { menuItemId, restaurantId, orderId, rating, comment } = req.body;
    if (!orderId || !rating || comment == null) {
        res.status(400).json({ error: "orderId, rating, and comment are required" });
        return;
    }
    const user = await Review.findOne({ userId, orderId });
    if (user) {
        res.status(400).json({ error: "You already reviewed this order" });
        return;
    }
    const { User } = await import("../models/User");
    const userDoc = await User.findById(userId);
    const review = new Review({
        userId,
        userName: userDoc?.name || "User",
        userAvatar: userDoc?.avatar,
        menuItemId: menuItemId || null,
        restaurantId: restaurantId || null,
        orderId,
        rating,
        comment,
    });
    await review.save();
    if (menuItemId) {
        const item = await MenuItem.findById(menuItemId);
        if (item) {
            const allReviews = await Review.find({ menuItemId });
            const avgRating = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
            await MenuItem.findByIdAndUpdate(menuItemId, { rating: Math.round(avgRating * 10) / 10, totalRatings: allReviews.length });
        }
    }
    if (restaurantId) {
        const allReviews = await Review.find({ restaurantId });
        const avgRating = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
        await Restaurant.findByIdAndUpdate(restaurantId, { rating: Math.round(avgRating * 10) / 10, totalRatings: allReviews.length });
    }
    res.status(201).json(formatReview(review));
});
export default router;
