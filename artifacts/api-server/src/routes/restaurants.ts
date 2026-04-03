import { Router, type IRouter, type Request, type Response } from "express";
import { Restaurant } from "../models/Restaurant";
import { MenuItem } from "../models/MenuItem";
import { requireAuth, requireAdmin } from "../lib/auth";

const router: IRouter = Router();

router.get("/restaurants", async (req: Request, res: Response): Promise<void> => {
  const { cuisine, search, rating, sort } = req.query as Record<string, string>;
  const query: Record<string, unknown> = {};
  if (cuisine) query.cuisine = { $regex: cuisine, $options: "i" };
  if (search) query.name = { $regex: search, $options: "i" };
  if (rating) query.rating = { $gte: parseFloat(rating) };

  let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
  if (sort === "rating") sortOption = { rating: -1 };
  if (sort === "deliveryFee") sortOption = { deliveryFee: 1 };
  if (sort === "deliveryTime") sortOption = { deliveryTime: 1 };

  const restaurants = await Restaurant.find(query).sort(sortOption);
  res.json(restaurants.map(formatRestaurant));
});

router.get("/restaurants/:id", async (req: Request, res: Response): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const restaurant = await Restaurant.findById(raw);
  if (!restaurant) {
    res.status(404).json({ error: "Restaurant not found" });
    return;
  }
  res.json(formatRestaurant(restaurant));
});

router.get("/restaurants/:id/menu", async (req: Request, res: Response): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { category } = req.query as Record<string, string>;
  const query: Record<string, unknown> = { restaurantId: raw };
  if (category) query.category = category;
  const items = await MenuItem.find(query);
  res.json(items.map(formatMenuItem));
});

function formatRestaurant(r: any) {
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

function formatMenuItem(m: any) {
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
