import mongoose from "mongoose";
const trackingStepSchema = new mongoose.Schema({
    step: { type: String, required: true },
    label: { type: String, required: true },
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: String, default: null },
});
const orderItemSchema = new mongoose.Schema({
    menuItemId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    image: { type: String, default: null },
    rating: { type: Number, min: 1, max: 5, default: null },
    review: { type: String, default: null },
});
const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    restaurantId: { type: String, required: true },
    restaurantName: { type: String, required: true },
    items: [orderItemSchema],
    status: {
        type: String,
        enum: ["placed", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"],
        default: "placed",
    },
    paymentMethod: { type: String, enum: ["online", "cod"], required: true },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    couponCode: { type: String, default: null },
    coinsUsed: { type: Number, default: 0 },
    coinsEarned: { type: Number, default: 0 },
    deliveryAddress: { type: String, required: true },
    estimatedDeliveryTime: { type: String, default: null },
    trackingSteps: [trackingStepSchema],
    restaurantRating: { type: Number, min: 1, max: 5, default: null },
    restaurantReview: { type: String, default: null },
}, { timestamps: true });
export const Order = mongoose.model("Order", orderSchema);
