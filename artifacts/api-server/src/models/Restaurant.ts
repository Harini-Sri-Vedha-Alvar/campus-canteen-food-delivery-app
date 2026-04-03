import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: null },
  cuisine: { type: String, required: true },
  image: { type: String, default: null },
  rating: { type: Number, default: 4.0 },
  totalRatings: { type: Number, default: 0 },
  deliveryTime: { type: String, required: true },
  deliveryFee: { type: Number, required: true },
  minOrder: { type: Number, required: true },
  address: { type: String, required: true },
  isOpen: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  tags: [{ type: String }],
}, { timestamps: true });

export const Restaurant = mongoose.model("Restaurant", restaurantSchema);
