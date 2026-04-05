import { Router } from "express";
import { Cart } from "../models/Cart";
import { MenuItem } from "../models/MenuItem";
import { Restaurant } from "../models/Restaurant";
import { requireAuth } from "../lib/auth";
const router = Router();
function computeCartTotals(cart, deliveryFee) {
    const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const total = Math.max(0, subtotal + deliveryFee - cart.discount);
    return { subtotal, deliveryFee, total };
}
function formatCart(cart, deliveryFee) {
    const { subtotal, total } = computeCartTotals(cart, deliveryFee);
    return {
        id: cart._id.toString(),
        userId: cart.userId.toString(),
        restaurantId: cart.restaurantId,
        items: cart.items.map((item) => ({
            id: item._id.toString(),
            menuItemId: item.menuItemId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
            restaurantId: item.restaurantId,
        })),
        subtotal,
        deliveryFee,
        total,
        couponCode: cart.couponCode,
        discount: cart.discount,
    };
}
router.get("/cart", requireAuth, async (req, res) => {
    const userId = req.user.userId;
    let cart = await Cart.findOne({ userId });
    if (!cart) {
        cart = new Cart({ userId, items: [], restaurantId: null, discount: 0 });
        await cart.save();
    }
    let deliveryFee = 0;
    if (cart.restaurantId) {
        const restaurant = await Restaurant.findById(cart.restaurantId);
        deliveryFee = restaurant?.deliveryFee || 0;
    }
    res.json(formatCart(cart, deliveryFee));
});
router.post("/cart", requireAuth, async (req, res) => {
    const userId = req.user.userId;
    const { menuItemId, quantity } = req.body;
    if (!menuItemId || quantity === undefined) {
        res.status(400).json({ error: "menuItemId and quantity are required" });
        return;
    }
    const menuItem = await MenuItem.findById(menuItemId);
    if (!menuItem) {
        res.status(404).json({ error: "Menu item not found" });
        return;
    }
    let cart = await Cart.findOne({ userId });
    if (!cart) {
        cart = new Cart({ userId, items: [], restaurantId: null, discount: 0 });
    }
    const restaurantId = menuItem.restaurantId.toString();
    if (cart.restaurantId && cart.restaurantId !== restaurantId && cart.items.length > 0) {
        cart.items = [];
        cart.discount = 0;
        cart.couponCode = null;
    }
    cart.restaurantId = restaurantId;
    const existingIdx = cart.items.findIndex((i) => i.menuItemId === menuItemId);
    if (existingIdx >= 0) {
        cart.items[existingIdx].quantity += quantity;
        if (cart.items[existingIdx].quantity <= 0) {
            cart.items.splice(existingIdx, 1);
        }
    }
    else if (quantity > 0) {
        cart.items.push({
            menuItemId,
            name: menuItem.name,
            price: menuItem.price,
            quantity,
            image: menuItem.image,
            restaurantId,
        });
    }
    if (cart.items.length === 0) {
        cart.restaurantId = null;
    }
    await cart.save();
    const restaurant = await Restaurant.findById(cart.restaurantId);
    const deliveryFee = restaurant?.deliveryFee || 0;
    res.json(formatCart(cart, deliveryFee));
});
router.patch("/cart/:itemId", requireAuth, async (req, res) => {
    const userId = req.user.userId;
    const { itemId } = req.params;
    const { quantity } = req.body;
    const cart = await Cart.findOne({ userId });
    if (!cart) {
        res.status(404).json({ error: "Cart not found" });
        return;
    }
    const idx = cart.items.findIndex((i) => i._id.toString() === itemId);
    if (idx < 0) {
        res.status(404).json({ error: "Item not in cart" });
        return;
    }
    if (quantity <= 0) {
        cart.items.splice(idx, 1);
    }
    else {
        cart.items[idx].quantity = quantity;
    }
    if (cart.items.length === 0) {
        cart.restaurantId = null;
    }
    await cart.save();
    const restaurant = await Restaurant.findById(cart.restaurantId);
    const deliveryFee = restaurant?.deliveryFee || 0;
    res.json(formatCart(cart, deliveryFee));
});
router.delete("/cart/:itemId", requireAuth, async (req, res) => {
    const userId = req.user.userId;
    const { itemId } = req.params;
    const cart = await Cart.findOne({ userId });
    if (!cart) {
        res.status(404).json({ error: "Cart not found" });
        return;
    }
    const idx = cart.items.findIndex((i) => i._id.toString() === itemId);
    if (idx >= 0)
        cart.items.splice(idx, 1);
    if (cart.items.length === 0) {
        cart.restaurantId = null;
        cart.discount = 0;
        cart.couponCode = null;
    }
    await cart.save();
    const restaurant = await Restaurant.findById(cart.restaurantId);
    const deliveryFee = restaurant?.deliveryFee || 0;
    res.json(formatCart(cart, deliveryFee));
});
router.delete("/cart", requireAuth, async (req, res) => {
    const userId = req.user.userId;
    await Cart.findOneAndUpdate({ userId }, { items: [], restaurantId: null, discount: 0, couponCode: null });
    res.json({ message: "Cart cleared" });
});
export default router;
