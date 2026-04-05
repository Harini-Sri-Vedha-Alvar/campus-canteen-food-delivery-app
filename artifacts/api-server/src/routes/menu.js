import { Router } from "express";
import { MenuItem } from "../models/MenuItem";
import { Restaurant } from "../models/Restaurant";
import { requireAuth, requireAdmin } from "../lib/auth";
import { formatMenuItem } from "./restaurants";
const router = Router();
router.get("/menu", async (_req, res) => {
    const items = await MenuItem.find();
    res.json(items.map(formatMenuItem));
});
router.post("/menu", requireAuth, requireAdmin, async (req, res) => {
    const { restaurantId, name, description, price, category, image, isVeg, isAvailable, isBestseller, tags, suggestedWith } = req.body;
    if (!restaurantId || !name || price === undefined || !category) {
        res.status(400).json({ error: "restaurantId, name, price, and category are required" });
        return;
    }
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
        res.status(404).json({ error: "Restaurant not found" });
        return;
    }
    const item = new MenuItem({
        restaurantId,
        restaurantName: restaurant.name,
        name,
        description,
        price,
        category,
        image,
        isVeg: isVeg ?? false,
        isAvailable: isAvailable ?? true,
        isBestseller: isBestseller ?? false,
        tags: tags || [],
        suggestedWith: suggestedWith || [],
    });
    await item.save();
    res.status(201).json(formatMenuItem(item));
});
router.put("/menu/:id", requireAuth, requireAdmin, async (req, res) => {
    const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const item = await MenuItem.findByIdAndUpdate(raw, req.body, { new: true });
    if (!item) {
        res.status(404).json({ error: "Menu item not found" });
        return;
    }
    res.json(formatMenuItem(item));
});
router.delete("/menu/:id", requireAuth, requireAdmin, async (req, res) => {
    const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const item = await MenuItem.findByIdAndDelete(raw);
    if (!item) {
        res.status(404).json({ error: "Menu item not found" });
        return;
    }
    res.sendStatus(204);
});
router.get("/suggestions", async (req, res) => {
    const { itemIds } = req.query;
    if (!itemIds) {
        res.json([]);
        return;
    }
    const ids = itemIds.split(",").filter(Boolean);
    const cartItems = await MenuItem.find({ _id: { $in: ids } });
    const suggestedTagsSet = new Set();
    const cartNames = new Set(cartItems.map(i => i.name.toLowerCase()));
    for (const item of cartItems) {
        for (const s of item.suggestedWith) {
            suggestedTagsSet.add(s.toLowerCase());
        }
        for (const t of item.tags) {
            suggestedTagsSet.add(t.toLowerCase());
        }
    }
    if (suggestedTagsSet.size === 0) {
        const random = await MenuItem.find({ _id: { $nin: ids } }).limit(4);
        res.json(random.map(formatMenuItem));
        return;
    }
    const suggestedItems = await MenuItem.find({
        _id: { $nin: ids },
        $or: [
            { tags: { $in: Array.from(suggestedTagsSet) } },
            { name: { $in: Array.from(suggestedTagsSet).map(s => new RegExp(s, "i")) } },
        ],
    }).limit(6);
    res.json(suggestedItems.map(formatMenuItem));
});
export default router;
