import { storage } from "./storage.js";
import { api } from "../shared/routes.js";
import { z } from "zod";
import { setupAuth, hashPassword } from "./auth.js";
import passport from "passport";

const requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ message: "Unauthorized" });
};

const requireAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === "admin") return next();
  res.status(403).json({ message: "Forbidden: Admin access required" });
};

export async function registerRoutes(httpServer, app) {
  setupAuth(app);

  // AUTH ROUTES
  app.post(api.auth.register.path, async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByEmail(req.body.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const hashedPassword = await hashPassword(req.body.password);
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
        role: "user",
      });

      req.login(user, (err) => {
        if (err) return next(err);
        const { password, ...safeUser } = user;
        res.status(201).json(safeUser);
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      next(err);
    }
  });

  app.post(api.auth.login.path, passport.authenticate("local"), (req, res) => {
    const { password, ...safeUser } = req.user;
    res.status(200).json(safeUser);
  });

  app.post(api.auth.logout.path, (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.status(200).json({ message: "Logged out" });
    });
  });

  app.get(api.auth.me.path, (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not logged in" });
    const { password, ...safeUser } = req.user;
    res.status(200).json(safeUser);
  });

  // RESTAURANTS
  app.get(api.restaurants.list.path, async (req, res) => {
    const restaurants = await storage.getRestaurants();
    res.json(restaurants);
  });

  app.get(api.restaurants.get.path, async (req, res) => {
    const restaurant = await storage.getRestaurant(Number(req.params.id));
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });
    res.json(restaurant);
  });

  app.post(api.restaurants.create.path, requireAdmin, async (req, res) => {
    try {
      const data = api.restaurants.create.input.parse(req.body);
      const restaurant = await storage.createRestaurant(data);
      res.status(201).json(restaurant);
    } catch (err) {
      res.status(400).json({ message: "Validation error" });
    }
  });

  app.put(api.restaurants.update.path, requireAdmin, async (req, res) => {
    const data = api.restaurants.update.input.parse(req.body);
    const restaurant = await storage.updateRestaurant(Number(req.params.id), data);
    res.json(restaurant);
  });

  app.delete(api.restaurants.delete.path, requireAdmin, async (req, res) => {
    await storage.deleteRestaurant(Number(req.params.id));
    res.status(204).end();
  });

  // MENU ITEMS
  app.get(api.menuItems.listByRestaurant.path, async (req, res) => {
    const items = await storage.getMenuItems(Number(req.params.id));
    res.json(items);
  });

  app.post(api.menuItems.create.path, requireAdmin, async (req, res) => {
    try {
      const data = api.menuItems.create.input.parse(req.body);
      const item = await storage.createMenuItem({ ...data, restaurantId: Number(req.params.id) });
      res.status(201).json(item);
    } catch (err) {
      res.status(400).json({ message: "Validation error" });
    }
  });

  app.put(api.menuItems.update.path, requireAdmin, async (req, res) => {
    const data = api.menuItems.update.input.parse(req.body);
    const item = await storage.updateMenuItem(Number(req.params.id), data);
    res.json(item);
  });

  app.delete(api.menuItems.delete.path, requireAdmin, async (req, res) => {
    await storage.deleteMenuItem(Number(req.params.id));
    res.status(204).end();
  });

  // CART
  app.get(api.cart.list.path, requireAuth, async (req, res) => {
    const items = await storage.getCartItems(req.user.id);
    res.json(items);
  });

  app.post(api.cart.add.path, requireAuth, async (req, res) => {
    const data = api.cart.add.input.parse(req.body);
    const item = await storage.addCartItem({ ...data, userId: req.user.id });
    res.status(201).json(item);
  });

  app.put(api.cart.update.path, requireAuth, async (req, res) => {
    const item = await storage.getCartItem(Number(req.params.id));
    if (!item || item.userId !== req.user.id) {
      return res.status(404).json({ message: "Not found" });
    }
    const data = api.cart.update.input.parse(req.body);
    const updated = await storage.updateCartItem(Number(req.params.id), data.quantity);
    res.json(updated);
  });

  app.delete(api.cart.delete.path, requireAuth, async (req, res) => {
    const item = await storage.getCartItem(Number(req.params.id));
    if (!item || item.userId !== req.user.id) {
      return res.status(404).json({ message: "Not found" });
    }
    await storage.deleteCartItem(Number(req.params.id));
    res.status(204).end();
  });

  app.delete(api.cart.clear.path, requireAuth, async (req, res) => {
    await storage.clearCart(req.user.id);
    res.status(204).end();
  });

  // ORDERS
  app.get(api.orders.list.path, requireAuth, async (req, res) => {
    const orders = req.user.role === "admin" 
      ? await storage.getOrders() 
      : await storage.getOrders(req.user.id);
    res.json(orders);
  });

  app.post(api.orders.create.path, requireAuth, async (req, res) => {
    const cartItems = await storage.getCartItems(req.user.id);
    if (!cartItems.length) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const items = cartItems.map(c => ({
      menuItemId: c.menuItem.id,
      name: c.menuItem.name,
      quantity: c.quantity,
      price: c.menuItem.price
    }));

    const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const order = await storage.createOrder({
      userId: req.user.id,
      items,
      totalPrice,
      status: "pending",
    });

    await storage.clearCart(req.user.id);

    res.status(201).json(order);
  });

  app.patch(api.orders.updateStatus.path, requireAdmin, async (req, res) => {
    const data = api.orders.updateStatus.input.parse(req.body);
    const order = await storage.updateOrderStatus(Number(req.params.id), data.status);
    res.json(order);
  });

  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const adminExists = await storage.getUserByEmail("admin@admin.com");
  if (!adminExists) {
    const hashedPassword = await hashPassword("admin123");
    await storage.createUser({
      email: "admin@admin.com",
      password: hashedPassword,
      name: "Admin User",
      role: "admin",
      address: "Admin HQ",
    });
  }

  const userExists = await storage.getUserByEmail("user@user.com");
  if (!userExists) {
    const hashedPassword = await hashPassword("user123");
    await storage.createUser({
      email: "user@user.com",
      password: hashedPassword,
      name: "Normal User",
      role: "user",
      address: "123 Main St",
    });
  }

  const existingRestaurants = await storage.getRestaurants();
  if (existingRestaurants.length === 0) {
    const r1 = await storage.createRestaurant({
      name: "Pizza Palace",
      location: "Downtown",
      cuisine: "Italian",
    });
    
    await storage.createMenuItem({
      restaurantId: r1.id,
      name: "Margherita Pizza",
      description: "Classic tomato and cheese",
      price: 1500,
      imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002",
    });
    
    await storage.createMenuItem({
      restaurantId: r1.id,
      name: "Pepperoni Pizza",
      description: "Pepperoni and cheese",
      price: 1800,
      imageUrl: "https://images.unsplash.com/photo-1628840042765-356cda07504e",
    });

    const r2 = await storage.createRestaurant({
      name: "Burger Barn",
      location: "Uptown",
      cuisine: "American",
    });

    await storage.createMenuItem({
      restaurantId: r2.id,
      name: "Classic Cheeseburger",
      description: "Beef patty with cheddar cheese",
      price: 1200,
      imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd",
    });
  }
}
