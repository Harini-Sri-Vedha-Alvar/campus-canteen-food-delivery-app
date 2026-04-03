import { connectMongoDB } from "./mongodb";
import { Restaurant } from "../models/Restaurant";
import { MenuItem } from "../models/MenuItem";
import { User } from "../models/User";
import { Coupon } from "../models/Coupon";
import { logger } from "./logger";

export async function seedDatabase() {
  try {
    const existingRestaurants = await Restaurant.countDocuments();
    if (existingRestaurants > 0) {
      logger.info("Database already seeded, skipping");
      return;
    }
    logger.info("Seeding database...");
    const adminUser = new User({
      name: "Admin",
      email: "admin@foodrush.com",
      password: "admin123",
      role: "admin",
      coins: 0,
    });
    await adminUser.save();
    const testUser = new User({
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
      role: "user",
      coins: 150,
      phone: "+91 9876543210",
      address: "123, MG Road, Bangalore",
    });
    await testUser.save();
    const restaurants = await Restaurant.insertMany([
      {
        name: "Biryani House",
        description: "Authentic Hyderabadi dum biryani and kebabs",
        cuisine: "Indian",
        image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800",
        rating: 4.5,
        totalRatings: 342,
        deliveryTime: "35-45 min",
        deliveryFee: 30,
        minOrder: 150,
        address: "12, Brigade Road, Bangalore",
        isOpen: true,
        featured: true,
        tags: ["biryani", "kebab", "halal", "spicy"],
      },
      {
        name: "Pizza Paradise",
        description: "Wood-fired artisan pizzas with fresh toppings",
        cuisine: "Italian",
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800",
        rating: 4.3,
        totalRatings: 218,
        deliveryTime: "25-35 min",
        deliveryFee: 40,
        minOrder: 200,
        address: "5, Koramangala, Bangalore",
        isOpen: true,
        featured: true,
        tags: ["pizza", "pasta", "italian", "vegetarian"],
      },
      {
        name: "Burger Street",
        description: "Gourmet burgers made with premium beef and fresh buns",
        cuisine: "American",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800",
        rating: 4.2,
        totalRatings: 189,
        deliveryTime: "20-30 min",
        deliveryFee: 25,
        minOrder: 100,
        address: "78, HSR Layout, Bangalore",
        isOpen: true,
        featured: false,
        tags: ["burger", "fries", "shakes", "american"],
      },
      {
        name: "South Spice",
        description: "Authentic South Indian cuisine - dosas, idlis, and more",
        cuisine: "South Indian",
        image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=800",
        rating: 4.6,
        totalRatings: 456,
        deliveryTime: "25-35 min",
        deliveryFee: 20,
        minOrder: 100,
        address: "34, Jayanagar, Bangalore",
        isOpen: true,
        featured: true,
        tags: ["dosa", "idli", "south indian", "vegetarian", "veg"],
      },
      {
        name: "Dragon Palace",
        description: "Authentic Chinese and Pan-Asian cuisine",
        cuisine: "Chinese",
        image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800",
        rating: 4.1,
        totalRatings: 167,
        deliveryTime: "30-40 min",
        deliveryFee: 35,
        minOrder: 150,
        address: "56, Whitefield, Bangalore",
        isOpen: true,
        featured: false,
        tags: ["chinese", "noodles", "dimsum", "fried rice"],
      },
      {
        name: "The Healthy Bowl",
        description: "Nutritious salads, bowls, and smoothies",
        cuisine: "Healthy",
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800",
        rating: 4.4,
        totalRatings: 134,
        deliveryTime: "20-25 min",
        deliveryFee: 30,
        minOrder: 150,
        address: "89, Indiranagar, Bangalore",
        isOpen: true,
        featured: false,
        tags: ["healthy", "salad", "vegan", "keto", "vegetarian"],
      },
    ]);

    const biryanHouse = restaurants[0];
    const pizzaParadise = restaurants[1];
    const burgerStreet = restaurants[2];
    const southSpice = restaurants[3];
    const dragonPalace = restaurants[4];
    const healthyBowl = restaurants[5];

    await MenuItem.insertMany([
      // Biryani House
      {
        restaurantId: biryanHouse._id, restaurantName: biryanHouse.name,
        name: "Chicken Biryani", description: "Aromatic long-grain basmati rice cooked with tender chicken", price: 259, category: "Biryani", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500", rating: 4.7, totalRatings: 230, isVeg: false, isAvailable: true, isBestseller: true, tags: ["biryani", "chicken", "rice"], suggestedWith: ["cold drink", "raita", "cola", "thumps up"],
      },
      {
        restaurantId: biryanHouse._id, restaurantName: biryanHouse.name,
        name: "Veg Biryani", description: "Fragrant basmati rice with fresh vegetables", price: 199, category: "Biryani", image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=500", rating: 4.4, totalRatings: 145, isVeg: true, isAvailable: true, isBestseller: false, tags: ["biryani", "veg", "rice"], suggestedWith: ["cold drink", "raita", "cola", "thumps up"],
      },
      {
        restaurantId: biryanHouse._id, restaurantName: biryanHouse.name,
        name: "Mutton Biryani", description: "Slow-cooked dum biryani with tender mutton", price: 349, category: "Biryani", image: "https://images.unsplash.com/photo-1555126634-323283e090fa?w=500", rating: 4.8, totalRatings: 198, isVeg: false, isAvailable: true, isBestseller: true, tags: ["biryani", "mutton", "rice", "premium"], suggestedWith: ["cold drink", "cola", "thumps up", "raita"],
      },
      {
        restaurantId: biryanHouse._id, restaurantName: biryanHouse.name,
        name: "Seekh Kebab", description: "Minced meat kebabs grilled to perfection", price: 179, category: "Starters", image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500", rating: 4.5, totalRatings: 89, isVeg: false, isAvailable: true, isBestseller: false, tags: ["kebab", "starter", "grilled"], suggestedWith: ["mint chutney", "naan"],
      },
      {
        restaurantId: biryanHouse._id, restaurantName: biryanHouse.name,
        name: "Raita", description: "Fresh yogurt with cucumber and mint", price: 49, category: "Sides", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500", rating: 4.3, totalRatings: 45, isVeg: true, isAvailable: true, isBestseller: false, tags: ["raita", "sides", "yogurt", "veg"], suggestedWith: ["biryani"],
      },
      // Pizza Paradise
      {
        restaurantId: pizzaParadise._id, restaurantName: pizzaParadise.name,
        name: "Margherita Pizza", description: "Classic tomato sauce with fresh mozzarella and basil", price: 299, category: "Pizza", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500", rating: 4.4, totalRatings: 156, isVeg: true, isAvailable: true, isBestseller: true, tags: ["pizza", "vegetarian", "classic"], suggestedWith: ["garlic bread", "cola", "coke"],
      },
      {
        restaurantId: pizzaParadise._id, restaurantName: pizzaParadise.name,
        name: "Pepperoni Pizza", description: "Loaded with spicy pepperoni and cheese", price: 399, category: "Pizza", image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500", rating: 4.6, totalRatings: 178, isVeg: false, isAvailable: true, isBestseller: true, tags: ["pizza", "pepperoni", "spicy"], suggestedWith: ["cola", "coke", "garlic bread", "cold drink"],
      },
      {
        restaurantId: pizzaParadise._id, restaurantName: pizzaParadise.name,
        name: "Garlic Bread", description: "Toasted bread with garlic butter and herbs", price: 99, category: "Sides", image: "https://images.unsplash.com/photo-1585325701165-61e46c9f4dd7?w=500", rating: 4.2, totalRatings: 89, isVeg: true, isAvailable: true, isBestseller: false, tags: ["bread", "garlic", "sides", "vegetarian"], suggestedWith: ["pizza", "pasta"],
      },
      {
        restaurantId: pizzaParadise._id, restaurantName: pizzaParadise.name,
        name: "Pasta Arrabiata", description: "Penne pasta in spicy tomato sauce", price: 249, category: "Pasta", image: "https://images.unsplash.com/photo-1553621042-f6e147245754?w=500", rating: 4.3, totalRatings: 67, isVeg: true, isAvailable: true, isBestseller: false, tags: ["pasta", "italian", "spicy", "veg"], suggestedWith: ["garlic bread", "tiramisu"],
      },
      // Burger Street
      {
        restaurantId: burgerStreet._id, restaurantName: burgerStreet.name,
        name: "Classic Beef Burger", description: "Juicy beef patty with lettuce, tomato and special sauce", price: 199, category: "Burgers", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500", rating: 4.3, totalRatings: 145, isVeg: false, isAvailable: true, isBestseller: true, tags: ["burger", "beef", "american"], suggestedWith: ["fries", "shake", "cola", "cold drink"],
      },
      {
        restaurantId: burgerStreet._id, restaurantName: burgerStreet.name,
        name: "Crispy Chicken Burger", description: "Crispy fried chicken with coleslaw and mayo", price: 179, category: "Burgers", image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=500", rating: 4.4, totalRatings: 167, isVeg: false, isAvailable: true, isBestseller: true, tags: ["burger", "chicken", "crispy"], suggestedWith: ["fries", "cola", "cold drink"],
      },
      {
        restaurantId: burgerStreet._id, restaurantName: burgerStreet.name,
        name: "Veg Burger", description: "Crispy veggie patty with fresh vegetables", price: 149, category: "Burgers", image: "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=500", rating: 4.0, totalRatings: 78, isVeg: true, isAvailable: true, isBestseller: false, tags: ["burger", "vegetarian", "veg"], suggestedWith: ["fries", "cola"],
      },
      {
        restaurantId: burgerStreet._id, restaurantName: burgerStreet.name,
        name: "French Fries", description: "Golden crispy fries with sea salt", price: 79, category: "Sides", image: "https://images.unsplash.com/photo-1573080496219-bb964216ab17?w=500", rating: 4.2, totalRatings: 234, isVeg: true, isAvailable: true, isBestseller: false, tags: ["fries", "sides", "veg"], suggestedWith: ["burger", "cola", "shake"],
      },
      {
        restaurantId: burgerStreet._id, restaurantName: burgerStreet.name,
        name: "Chocolate Milkshake", description: "Thick creamy chocolate milkshake", price: 129, category: "Beverages", image: "https://images.unsplash.com/photo-1568901839119-631418a3910d?w=500", rating: 4.5, totalRatings: 112, isVeg: true, isAvailable: true, isBestseller: false, tags: ["shake", "chocolate", "beverage", "cold drink", "cola"], suggestedWith: ["burger", "fries"],
      },
      // South Spice
      {
        restaurantId: southSpice._id, restaurantName: southSpice.name,
        name: "Masala Dosa", description: "Crispy dosa with spiced potato filling and chutneys", price: 89, category: "Dosa", image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=500", rating: 4.7, totalRatings: 289, isVeg: true, isAvailable: true, isBestseller: true, tags: ["dosa", "south indian", "veg", "breakfast"], suggestedWith: ["filter coffee", "sambar", "coconut chutney"],
      },
      {
        restaurantId: southSpice._id, restaurantName: southSpice.name,
        name: "Idli Sambar (3 pcs)", description: "Soft steamed rice cakes with lentil soup", price: 69, category: "Breakfast", image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500", rating: 4.5, totalRatings: 234, isVeg: true, isAvailable: true, isBestseller: true, tags: ["idli", "sambar", "south indian", "veg"], suggestedWith: ["filter coffee", "coconut chutney"],
      },
      {
        restaurantId: southSpice._id, restaurantName: southSpice.name,
        name: "Filter Coffee", description: "Traditional South Indian filter coffee", price: 49, category: "Beverages", image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500", rating: 4.8, totalRatings: 156, isVeg: true, isAvailable: true, isBestseller: false, tags: ["coffee", "beverage", "filter coffee"], suggestedWith: ["dosa", "idli", "breakfast"],
      },
      // Dragon Palace
      {
        restaurantId: dragonPalace._id, restaurantName: dragonPalace.name,
        name: "Chicken Fried Rice", description: "Wok-tossed rice with chicken and vegetables", price: 189, category: "Rice", image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500", rating: 4.2, totalRatings: 134, isVeg: false, isAvailable: true, isBestseller: true, tags: ["fried rice", "chinese", "chicken"], suggestedWith: ["manchurian", "spring rolls", "cola", "cold drink"],
      },
      {
        restaurantId: dragonPalace._id, restaurantName: dragonPalace.name,
        name: "Veg Spring Rolls (6 pcs)", description: "Crispy rolls with vegetable filling", price: 129, category: "Starters", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500", rating: 4.1, totalRatings: 89, isVeg: true, isAvailable: true, isBestseller: false, tags: ["spring rolls", "chinese", "veg", "starter"], suggestedWith: ["fried rice", "noodles", "cola"],
      },
      {
        restaurantId: dragonPalace._id, restaurantName: dragonPalace.name,
        name: "Chicken Manchurian", description: "Crispy chicken in sweet and spicy manchurian sauce", price: 229, category: "Starters", image: "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=500", rating: 4.4, totalRatings: 112, isVeg: false, isAvailable: true, isBestseller: true, tags: ["manchurian", "chinese", "chicken", "spicy"], suggestedWith: ["fried rice", "noodles", "cola", "cold drink"],
      },
      // Healthy Bowl
      {
        restaurantId: healthyBowl._id, restaurantName: healthyBowl.name,
        name: "Acai Smoothie Bowl", description: "Creamy acai base with fresh fruits and granola", price: 279, category: "Bowls", image: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=500", rating: 4.5, totalRatings: 78, isVeg: true, isAvailable: true, isBestseller: true, tags: ["smoothie bowl", "healthy", "vegan", "acai"], suggestedWith: ["green smoothie", "protein bar"],
      },
      {
        restaurantId: healthyBowl._id, restaurantName: healthyBowl.name,
        name: "Quinoa Buddha Bowl", description: "Quinoa with roasted vegetables and tahini dressing", price: 299, category: "Bowls", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500", rating: 4.4, totalRatings: 67, isVeg: true, isAvailable: true, isBestseller: false, tags: ["quinoa", "healthy", "vegan", "bowl"], suggestedWith: ["green smoothie", "chia pudding"],
      },
    ]);

    await Coupon.insertMany([
      { code: "WELCOME50", description: "Welcome offer - 50% off up to ₹100", discountType: "percentage", discountValue: 50, minOrderAmount: 200, maxDiscount: 100, isActive: true, usageLimit: null },
      { code: "FLAT40", description: "Flat ₹40 off on orders above ₹300", discountType: "flat", discountValue: 40, minOrderAmount: 300, maxDiscount: null, isActive: true },
      { code: "NEWUSER", description: "New user special - 30% off on first order", discountType: "percentage", discountValue: 30, minOrderAmount: 150, maxDiscount: 80, isActive: true },
      { code: "WEEKEND20", description: "Weekend special - 20% off", discountType: "percentage", discountValue: 20, minOrderAmount: 200, maxDiscount: 60, isActive: true },
    ]);

    logger.info("Database seeded successfully");
  } catch (err) {
    logger.error({ err }, "Error seeding database");
  }
}
