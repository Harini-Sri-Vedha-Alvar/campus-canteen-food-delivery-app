import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("user"), // 'user' | 'admin'
  address: text("address").notNull(),
});

export const restaurants = pgTable("restaurants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  cuisine: text("cuisine").notNull(),
});

export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  restaurantId: integer("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // stored in cents
  imageUrl: text("image_url").notNull(),
});

export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  menuItemId: integer("menu_item_id").notNull().references(() => menuItems.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(1),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  items: jsonb("items").notNull(), // Array of { menuItemId, name, quantity, price }
  totalPrice: integer("total_price").notNull(),
  status: text("status").notNull().default("pending"), 
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertRestaurantSchema = createInsertSchema(restaurants).omit({ id: true });
export const insertMenuItemSchema = createInsertSchema(menuItems).omit({ id: true });
export const insertCartItemSchema = createInsertSchema(cartItems).omit({ id: true, userId: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true });

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Restaurant = typeof restaurants.$inferSelect;
export type InsertRestaurant = z.infer<typeof insertRestaurantSchema>;

export type MenuItem = typeof menuItems.$inferSelect;
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
