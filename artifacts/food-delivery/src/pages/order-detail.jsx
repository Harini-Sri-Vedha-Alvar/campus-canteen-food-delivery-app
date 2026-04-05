import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useGetOrder, useRateOrder, getGetOrderQueryKey, getListOrdersQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Check, Clock, MapPin, CreditCard, Star, Coins } from "lucide-react";
const TRACKING_STEPS = [
    { step: "placed", label: "Order Placed", icon: "📋" },
    { step: "confirmed", label: "Order Confirmed", icon: "✅" },
    { step: "preparing", label: "Preparing Your Food", icon: "👨‍🍳" },
    { step: "out_for_delivery", label: "Out for Delivery", icon: "🛵" },
    { step: "delivered", label: "Delivered", icon: "🎉" },
];
export default function OrderDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [restaurantRating, setRestaurantRating] = useState(0);
    const [restaurantReview, setRestaurantReview] = useState("");
    const [itemRatings, setItemRatings] = useState([]);
    const [rated, setRated] = useState(false);
    const { data: order, isLoading } = useGetOrder(id, {
        query: { enabled: !!id, queryKey: getGetOrderQueryKey(id), refetchInterval: 15000 }
    });
    const rateOrderMutation = useRateOrder();

    // Check if order has been rated
    const hasBeenRated = order ? (order.restaurantRating !== null || order.items.some(item => item.rating !== null)) : false;

    // Initialize ratings if order has been rated
    useEffect(() => {
        if (order && hasBeenRated) {
            setRated(true);
            if (order.restaurantRating) {
                setRestaurantRating(order.restaurantRating);
                setRestaurantReview(order.restaurantReview || "");
            }
            const existingItemRatings = order.items
                .filter(item => item.rating !== null)
                .map(item => ({
                    menuItemId: item.menuItemId,
                    rating: item.rating,
                    review: item.review || ""
                }));
            setItemRatings(existingItemRatings);
        }
    }, [order, hasBeenRated]);

    const currentStepIdx = order ? TRACKING_STEPS.findIndex(s => s.step === order.status) : -1;
    const isCancelled = order ? order.status === "cancelled" : false;
    const isDelivered = order ? order.status === "delivered" : false;

    const handleRateOrder = async () => {
        if (!restaurantRating) {
            toast({ title: "Please provide a restaurant rating", variant: "destructive" });
            return;
        }

        try {
            await rateOrderMutation.mutateAsync({
                id: id,
                data: {
                    restaurantRating,
                    restaurantReview: restaurantReview.trim() || null,
                    itemRatings: itemRatings.filter(r => r.rating > 0)
                }
            });

            setRated(true);
            toast({ title: "Rating submitted!", description: "Thank you for your feedback." });
            queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
        } catch (error) {
            toast({ title: "Failed to submit rating", description: error.message, variant: "destructive" });
        }
    };

    if (isLoading) {
        return (<div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-64 mb-6"/>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-xl"/>
          <Skeleton className="h-64 rounded-xl"/>
        </div>
      </div>);
    }
    if (!order) {
        return (
            <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
                Order not found
                <div className="mt-4">
                    <Link href="/orders">
                        <Button variant="outline">Back to Orders</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="relative container mx-auto px-4 py-8 max-w-4xl">
            {/* Background gradient */}
            <div className="absolute inset-0 overflow-hidden rounded-[2rem] bg-[radial-gradient(circle_at_top_left,_rgba(15,77,146,0.18),transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(25,92,47,0.16),transparent_22%),linear-gradient(135deg,#0f4d92,#163b44_45%,#195c2f)]" />

            {/* Floating food animation */}
            <div className="pointer-events-none absolute inset-0 opacity-60">
                <span className="food-slide text-[4rem] opacity-40" style={{ top: "10%", left: "-12%" }}>🍕</span>
                <span className="food-slide delay-2000 text-[3.2rem] opacity-35" style={{ top: "35%", left: "-18%" }}>🍔</span>
                <span className="food-slide delay-4000 text-[3.6rem] opacity-30" style={{ top: "60%", left: "-10%" }}>🥗</span>
            </div>

            {/* Main card wrapper */}
            <div className="relative rounded-[2rem] border border-white/10 bg-slate-950/88 p-6 shadow-[0_40px_120px_rgba(15,77,146,0.28)] backdrop-blur-xl">
                {/* Header section */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6 fade-slide-up">
                    <div>
                        <h1 className="text-3xl font-semibold text-white drop-shadow-md">{order.restaurantName}</h1>
                        <p className="text-sm text-slate-200/80">Order #{order.id.slice(-8).toUpperCase()}</p>
                    </div>
                    <Badge className={`text-sm px-3 py-1 font-semibold ${isCancelled ? "bg-red-100/90 text-red-900" : isDelivered ? "bg-emerald-100/90 text-emerald-900" : "bg-white/10 text-white border border-white/20 shadow-sm"}`}>
                        {TRACKING_STEPS.find(s => s.step === order.status)?.label || order.status}
                    </Badge>
                </div>
                {!isCancelled && (
                    <Card className="mb-6 border-white/15 bg-white/10 text-white shadow-[0_20px_50px_rgba(15,77,146,0.15)] backdrop-blur-xl">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2 text-white">
                                <Clock className="h-5 w-5 text-emerald-300" />
                                Live Order Tracking
                                {order.estimatedDeliveryTime && !isDelivered && (
                                    <span className="text-sm font-normal text-muted-foreground">
                                        • ETA: {new Date(order.estimatedDeliveryTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                    </span>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="relative">
                                <div className="flex items-start justify-between relative">
                                    {TRACKING_STEPS.map((step, idx) => {
                                        const isCompleted = order.trackingSteps?.[idx]?.isCompleted;
                                        const isActive = idx === currentStepIdx && !isDelivered;
                                        return (
                                            <div key={step.step} className="flex flex-col items-center flex-1">
                                                <div className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${isCompleted
                                                    ? "bg-primary border-primary text-primary-foreground"
                                                    : isActive
                                                        ? "border-primary bg-primary/10 text-primary animate-pulse"
                                                        : "border-border bg-background text-muted-foreground"}`}>
                                                    {isCompleted ? (<Check className="h-5 w-5" />) : (<span className="text-lg">{step.icon}</span>)}
                                                </div>
                                                <p className={`mt-2 text-xs text-center font-medium ${isCompleted ? "text-primary" : isActive ? "text-foreground" : "text-muted-foreground"}`}>
                                                    {step.label}
                                                </p>
                                                {order.trackingSteps?.[idx]?.completedAt && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {new Date(order.trackingSteps[idx].completedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                    </p>
                                                )}
                                                {idx < TRACKING_STEPS.length - 1 && (
                                                    <div className={`absolute top-5 left-1/2 w-full h-0.5 ${isCompleted ? "bg-primary" : "bg-border"}`} style={{ width: `calc(100% - 2.5rem)`, left: `calc(50% + 1.25rem)` }} />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card className="border-white/10 bg-white/10 text-white shadow-lg backdrop-blur-xl fade-slide-up">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-white">Order Items</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-white/10">
              {order.items.map(item => (<div key={item.menuItemId} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    {item.image && (<div className="w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover"/>
                      </div>)}
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-semibold">₹{item.price * item.quantity}</p>
                </div>))}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/10 text-white shadow-lg backdrop-blur-xl fade-slide-up">
            <CardContent className="p-4 space-y-2 text-sm text-slate-100">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span><span>₹{order.subtotal}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery Fee</span><span>₹{order.deliveryFee}</span>
              </div>
              {order.discount > 0 && (<div className="flex justify-between text-green-600">
                  <span>Discount {order.couponCode ? `(${order.couponCode})` : ""}</span>
                  <span>-₹{order.discount}</span>
                </div>)}
              {order.coinsUsed > 0 && (<div className="flex justify-between text-amber-600">
                  <span>Coins Used ({order.coinsUsed})</span>
                  <span>-₹{Math.floor(order.coinsUsed / 50) * 5}</span>
                </div>)}
              <Separator />
              <div className="flex justify-between font-bold text-base">
                <span>Total</span><span>₹{order.total}</span>
              </div>
              {order.coinsEarned > 0 && (<div className="flex items-center gap-1 text-amber-600 text-xs font-medium">
                  <Coins className="h-3.5 w-3.5"/>
                  +{order.coinsEarned} coins earned
                </div>)}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="border-white/10 bg-white/10 text-white shadow-lg backdrop-blur-xl fade-slide-up">
            <CardContent className="p-4 space-y-3 text-slate-100">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0"/>
                <div>
                  <p className="text-sm font-medium">Delivery Address</p>
                  <p className="text-sm text-muted-foreground">{order.deliveryAddress}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary shrink-0"/>
                <div>
                  <p className="text-sm font-medium">Payment</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {order.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}
                    {" • "}
                    <span className={order.paymentStatus === "paid" ? "text-green-600" : "text-amber-600"}>
                      {order.paymentStatus === "paid" ? "Paid" : "Pending"}
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {isDelivered && !hasBeenRated && (<Card className="border-emerald-300/20 bg-emerald-950/20 text-white shadow-[0_20px_50px_rgba(25,92,47,0.18)] backdrop-blur-xl fade-slide-up">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-white">
                  <Star className="h-4 w-4 text-amber-300"/>
                  Rate Your Order
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Restaurant Rating */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-slate-100">Rate {order.restaurantName}</h4>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button key={star} onClick={() => setRestaurantRating(star)} className="transition-transform hover:scale-110" data-testid={`restaurant-star-${star}`}>
                        <Star className={`h-6 w-6 ${star <= restaurantRating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`}/>
                      </button>
                    ))}
                  </div>
                  <Textarea
                    placeholder="Tell us about your experience with the restaurant..."
                    value={restaurantReview}
                    onChange={e => setRestaurantReview(e.target.value)}
                    className="bg-slate-950/80 text-white placeholder:text-slate-300"
                    rows={2}
                    data-testid="restaurant-review-textarea"
                  />
                </div>

                {/* Item Ratings */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Rate Individual Items</h4>
                  {order.items.map((item, index) => (
                    <div key={item.menuItemId} className="border border-white/10 rounded-2xl p-3 space-y-2 bg-slate-950/60">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{item.name}</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button
                              key={star}
                              onClick={() => {
                                const newRatings = [...itemRatings];
                                const existingIndex = newRatings.findIndex(r => r.menuItemId === item.menuItemId);
                                if (existingIndex >= 0) {
                                  newRatings[existingIndex] = { ...newRatings[existingIndex], rating: star };
                                } else {
                                  newRatings.push({ menuItemId: item.menuItemId, rating: star, review: "" });
                                }
                                setItemRatings(newRatings);
                              }}
                              className="transition-transform hover:scale-110"
                              data-testid={`item-star-${item.menuItemId}-${star}`}
                            >
                              <Star className={`h-5 w-5 ${star <= (itemRatings.find(r => r.menuItemId === item.menuItemId)?.rating || 0) ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`}/>
                            </button>
                          ))}
                        </div>
                      </div>
                      <Textarea
                        placeholder="Comments about this item (optional)..."
                        value={itemRatings.find(r => r.menuItemId === item.menuItemId)?.review || ""}
                        onChange={e => {
                          const newRatings = [...itemRatings];
                          const existingIndex = newRatings.findIndex(r => r.menuItemId === item.menuItemId);
                          if (existingIndex >= 0) {
                            newRatings[existingIndex] = { ...newRatings[existingIndex], review: e.target.value };
                          } else {
                            newRatings.push({ menuItemId: item.menuItemId, rating: 0, review: e.target.value });
                          }
                          setItemRatings(newRatings);
                        }}
                        rows={1}
                        className="text-xs bg-slate-950/80 text-white placeholder:text-slate-300"
                        data-testid={`item-review-textarea-${item.menuItemId}`}
                      />
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleRateOrder}
                  disabled={rateOrderMutation.isPending || restaurantRating === 0}
                  className="w-full"
                  data-testid="button-submit-rating"
                >
                  Submit Rating
                </Button>
              </CardContent>
            </Card>)}

          {hasBeenRated && (<Card className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
              <CardContent className="p-4 text-center text-green-700 dark:text-green-400">
                <Check className="h-8 w-8 mx-auto mb-2"/>
                <p className="font-semibold">Rating submitted!</p>
              </CardContent>
            </Card>)}
        </div>
      </div>
            </div>
    </div>);
}
