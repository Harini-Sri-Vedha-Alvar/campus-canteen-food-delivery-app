import { Router } from "express";
import { Restaurant } from "../models/Restaurant";
import { MenuItem } from "../models/MenuItem";
const router = Router();
router.get("/restaurants", async (req, res) => {
    const { cuisine, search, rating, sort } = req.query;
    const query = {};
    if (cuisine)
        query.cuisine = { $regex: cuisine, $options: "i" };
    if (search)
        query.name = { $regex: search, $options: "i" };
    if (rating)
        query.rating = { $gte: parseFloat(rating) };
    let sortOption = { createdAt: -1 };
    if (sort === "rating")
        sortOption = { rating: -1 };
    if (sort === "deliveryFee")
        sortOption = { deliveryFee: 1 };
    if (sort === "deliveryTime")
        sortOption = { deliveryTime: 1 };
    const restaurants = await Restaurant.find(query).sort(sortOption);
    res.json(restaurants.map(formatRestaurant));
});
router.get("/restaurants/:id", async (req, res) => {
    const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const restaurant = await Restaurant.findById(raw);
    if (!restaurant) {
        res.status(404).json({ error: "Restaurant not found" });
        return;
    }
    res.json(formatRestaurant(restaurant));
});
router.get("/restaurants/:id/menu", async (req, res) => {
    const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { category } = req.query;
    const query = { restaurantId: raw };
    if (category)
        query.category = category;
    const items = await MenuItem.find(query);
    res.json(items.map(formatMenuItem));
});
router.put("/restaurants/:restaurantId/menu/:itemId", async (req, res) => {
    const { restaurantId, itemId } = req.params;
    const { name, description, price, category, image } = req.body;
    
    const item = await MenuItem.findById(itemId);
    if (!item || item.restaurantId !== restaurantId) {
        return res.status(404).json({ error: "Menu item not found" });
    }
    
    if (name) item.name = name;
    if (description) item.description = description;
    if (price) item.price = price;
    if (category) item.category = category;
    if (image) item.image = image;
    
    await item.save();
    res.json(formatMenuItem(item));
});
function formatRestaurant(r) {
    return {
        id: r._id.toString(),
        name: r.name,
        description: r.description,
        cuisine: r.cuisine,
        image: r.image,
        rating: r.rating,
        totalRatings: r.totalRatings,
        deliveryTime: r.deliveryTime,
        deliveryFee: r.deliveryFee,
        minOrder: r.minOrder,
        address: r.address,
        isOpen: r.isOpen,
        featured: r.featured,
        tags: r.tags,
        createdAt: r.createdAt?.toISOString() || new Date().toISOString(),
    };
}
function formatMenuItem(m) {
    return {
        id: m._id.toString(),
        restaurantId: m.restaurantId.toString(),
        restaurantName: m.restaurantName,
        name: m.name,
        description: m.description,
        price: m.price,
        category: m.category,
        image: m.image,
        rating: m.rating,
        totalRatings: m.totalRatings,
        isVeg: m.isVeg,
        isAvailable: m.isAvailable,
        isBestseller: m.isBestseller,
        tags: m.tags,
        suggestedWith: m.suggestedWith,
    };
}
export { formatRestaurant, formatMenuItem };
export default router;
