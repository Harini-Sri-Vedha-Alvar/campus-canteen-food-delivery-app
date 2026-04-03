import { useState } from "react";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useGetOrder, useCreateReview, getGetOrderQueryKey, getListOrdersQueryKey } from "@workspace/api-client-react";
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
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewed, setReviewed] = useState(false);

  const { data: order, isLoading } = useGetOrder(id!, {
    query: { enabled: !!id, queryKey: getGetOrderQueryKey(id!), refetchInterval: 15000 }
  });

  const reviewMutation = useCreateReview();

  const handleReview = async () => {
    if (!rating || !comment.trim()) {
      toast({ title: "Please provide a rating and comment", variant: "destructive" });
      return;
    }
    try {
      await reviewMutation.mutateAsync({
        data: {
          restaurantId: order!.restaurantId,
          orderId: id!,
          rating,
          comment,
        }
      });
      setReviewed(true);
      toast({ title: "Review submitted!", description: "Thank you for your feedback." });
      queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
    } catch (error: any) {
      toast({ title: "Failed to submit review", description: error.message, variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
        Order not found
        <div className="mt-4"><Link href="/orders"><Button variant="outline">Back to Orders</Button></Link></div>
      </div>
    );
  }

  const currentStepIdx = TRACKING_STEPS.findIndex(s => s.step === order.status);
  const isCancelled = order.status === "cancelled";
  const isDelivered = order.status === "delivered";

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{order.restaurantName}</h1>
          <p className="text-muted-foreground text-sm">Order #{order.id.slice(-8).toUpperCase()}</p>
        </div>
        <Badge className={`text-sm px-3 py-1 ${
          isCancelled ? "bg-red-100 text-red-700" :
          isDelivered ? "bg-green-100 text-green-700" :
          "bg-primary/10 text-primary"
        }`}>
          {TRACKING_STEPS.find(s => s.step === order.status)?.label || order.status}
        </Badge>
      </div>

      {!isCancelled && (
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
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
                      <div className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                        isCompleted
                          ? "bg-primary border-primary text-primary-foreground"
                          : isActive
                          ? "border-primary bg-primary/10 text-primary animate-pulse"
                          : "border-border bg-background text-muted-foreground"
                      }`}>
                        {isCompleted ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          <span className="text-lg">{step.icon}</span>
                        )}
                      </div>
                      <p className={`mt-2 text-xs text-center font-medium ${
                        isCompleted ? "text-primary" : isActive ? "text-foreground" : "text-muted-foreground"
                      }`}>
                        {step.label}
                      </p>
                      {order.trackingSteps?.[idx]?.completedAt && (
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.trackingSteps[idx].completedAt!).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Order Items</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border">
              {order.items.map(item => (
                <div key={item.menuItemId} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    {item.image && (
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-semibold">₹{item.price * item.quantity}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4 space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span><span>₹{order.subtotal}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery Fee</span><span>₹{order.deliveryFee}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount {order.couponCode ? `(${order.couponCode})` : ""}</span>
                  <span>-₹{order.discount}</span>
                </div>
              )}
              {order.coinsUsed > 0 && (
                <div className="flex justify-between text-amber-600">
                  <span>Coins Used ({order.coinsUsed})</span>
                  <span>-₹{Math.floor(order.coinsUsed / 50) * 5}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-base">
                <span>Total</span><span>₹{order.total}</span>
              </div>
              {order.coinsEarned > 0 && (
                <div className="flex items-center gap-1 text-amber-600 text-xs font-medium">
                  <Coins className="h-3.5 w-3.5" />
                  +{order.coinsEarned} coins earned
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="border-border/50">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Delivery Address</p>
                  <p className="text-sm text-muted-foreground">{order.deliveryAddress}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary shrink-0" />
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

          {isDelivered && !reviewed && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-500" />
                  Rate Your Experience
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="transition-transform hover:scale-110"
                      data-testid={`star-${star}`}
                    >
                      <Star className={`h-8 w-8 ${star <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
                    </button>
                  ))}
                </div>
                <Textarea
                  placeholder="Tell us about your experience..."
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  rows={3}
                  data-testid="textarea-review"
                />
                <Button
                  onClick={handleReview}
                  disabled={reviewMutation.isPending || rating === 0}
                  className="w-full"
                  data-testid="button-submit-review"
                >
                  Submit Review
                </Button>
              </CardContent>
            </Card>
          )}

          {reviewed && (
            <Card className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
              <CardContent className="p-4 text-center text-green-700 dark:text-green-400">
                <Check className="h-8 w-8 mx-auto mb-2" />
                <p className="font-semibold">Review submitted!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
