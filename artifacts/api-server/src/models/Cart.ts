import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  menuItemId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String, default: null },
  restaurantId: { type: String, required: true },
});

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  restaurantId: { type: String, default: null },
  items: [cartItemSchema],
  couponCode: { type: String, default: null },
  discount: { type: Number, default: 0 },
}, { timestamps: true });

export const Cart = mongoose.model("Cart", cartSchema);
