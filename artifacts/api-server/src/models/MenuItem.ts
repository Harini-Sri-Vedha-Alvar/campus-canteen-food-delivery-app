import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", required: true },
  restaurantName: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, default: null },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  image: { type: String, default: null },
  rating: { type: Number, default: 4.0 },
  totalRatings: { type: Number, default: 0 },
  isVeg: { type: Boolean, default: false },
  isAvailable: { type: Boolean, default: true },
  isBestseller: { type: Boolean, default: false },
  tags: [{ type: String }],
  suggestedWith: [{ type: String }],
}, { timestamps: true });

export const MenuItem = mongoose.model("MenuItem", menuItemSchema);
