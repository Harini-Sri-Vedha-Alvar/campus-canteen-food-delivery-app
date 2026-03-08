import { db } from "./db.js";
import { eq, and } from "drizzle-orm";
import {
  users, restaurants, menuItems, cartItems, orders,
} from "../shared/schema.js";

export class DatabaseStorage {
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getRestaurants() {
    return db.select().from(restaurants);
  }

  async getRestaurant(id) {
    const [restaurant] = await db.select().from(restaurants).where(eq(restaurants.id, id));
    return restaurant;
  }

  async createRestaurant(restaurant) {
    const [newRestaurant] = await db.insert(restaurants).values(restaurant).returning();
    return newRestaurant;
  }

  async updateRestaurant(id, update) {
    const [updated] = await db.update(restaurants).set(update).where(eq(restaurants.id, id)).returning();
    return updated;
  }

  async deleteRestaurant(id) {
    await db.delete(restaurants).where(eq(restaurants.id, id));
  }

  async getMenuItems(restaurantId) {
    return db.select().from(menuItems).where(eq(menuItems.restaurantId, restaurantId));
  }

  async getMenuItem(id) {
    const [item] = await db.select().from(menuItems).where(eq(menuItems.id, id));
    return item;
  }

  async createMenuItem(menuItem) {
    const [newItem] = await db.insert(menuItems).values(menuItem).returning();
    return newItem;
  }

  async updateMenuItem(id, update) {
    const [updated] = await db.update(menuItems).set(update).where(eq(menuItems.id, id)).returning();
    return updated;
  }

  async deleteMenuItem(id) {
    await db.delete(menuItems).where(eq(menuItems.id, id));
  }

  async getCartItems(userId) {
    const rows = await db
      .select({
        cartItem: cartItems,
        menuItem: menuItems,
      })
      .from(cartItems)
      .innerJoin(menuItems, eq(cartItems.menuItemId, menuItems.id))
      .where(eq(cartItems.userId, userId));
      
    return rows.map(r => ({
      ...r.cartItem,
      menuItem: r.menuItem
    }));
  }

  async getCartItem(id) {
    const [item] = await db.select().from(cartItems).where(eq(cartItems.id, id));
    return item;
  }

  async addCartItem(item) {
    const [existing] = await db.select().from(cartItems).where(
      and(eq(cartItems.userId, item.userId), eq(cartItems.menuItemId, item.menuItemId))
    );
    
    if (existing) {
      const [updated] = await db.update(cartItems)
        .set({ quantity: existing.quantity + item.quantity })
        .where(eq(cartItems.id, existing.id))
        .returning();
      return updated;
    }

    const [newItem] = await db.insert(cartItems).values(item).returning();
    return newItem;
  }

  async updateCartItem(id, quantity) {
    const [updated] = await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, id)).returning();
    return updated;
  }

  async deleteCartItem(id) {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(userId) {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  async getOrders(userId) {
    if (userId) {
      return db.select().from(orders).where(eq(orders.userId, userId));
    }
    return db.select().from(orders);
  }

  async getOrder(id) {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async createOrder(order) {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async updateOrderStatus(id, status) {
    const [updated] = await db.update(orders).set({ status }).where(eq(orders.id, id)).returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
