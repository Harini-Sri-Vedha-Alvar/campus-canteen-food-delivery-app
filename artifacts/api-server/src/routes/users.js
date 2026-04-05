import { Router } from "express";
import { User } from "../models/User";
import { requireAuth } from "../lib/auth";
const router = Router();
router.get("/users/coins", requireAuth, async (req, res) => {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
    }
    res.json({
        coins: user.coins,
        equivalentValue: Math.floor(user.coins / 50) * 5,
    });
});
router.patch("/users/profile", requireAuth, async (req, res) => {
    const userId = req.user.userId;
    const { name, phone, address, avatar } = req.body;
    const user = await User.findByIdAndUpdate(userId, { name, phone, address, avatar }, { new: true });
    if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
    }
    res.json({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        coins: user.coins,
        avatar: user.avatar,
        createdAt: user.createdAt.toISOString(),
    });
});
export default router;
