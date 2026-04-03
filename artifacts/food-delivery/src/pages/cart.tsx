import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetCart, useUpdateCartItem, useRemoveCartItem, useClearCart, useCreateOrder, useValidateCoupon, useGetUserCoins, useGetSuggestions, useAddToCart,
  getGetCartQueryKey, getGetUserCoinsQueryKey, getGetSuggestionsQueryKey, getListOrdersQueryKey
} from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { ShoppingCart, Plus, Minus, Trash2, Tag, Coins, CreditCard, Banknote, ChevronRight, Star } from "lucide-react";

export default function Cart() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [useCoins, setUseCoins] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("online");
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || "");
  const [placing, setPlacing] = useState(false);

  const { data: cart, isLoading } = useGetCart({
    query: { enabled: !!user, queryKey: getGetCartQueryKey() }
  });
  const { data: coinsData } = useGetUserCoins({
    query: { enabled: !!user, queryKey: getGetUserCoinsQueryKey() }
  });

  const cartItemIds = cart?.items?.map(i => i.menuItemId).join(",") || "";
  const { data: suggestions } = useGetSuggestions(
    cartItemIds ? { itemIds: cartItemIds } : undefined,
    { query: { enabled: !!cartItemIds && cartItemIds.length > 0, queryKey: getGetSuggestionsQueryKey(cartItemIds ? { itemIds: cartItemIds } : undefined) } }
  );

  const updateItemMutation = useUpdateCartItem();
  const removeItemMutation = useRemoveCartItem();
  const clearCartMutation = useClearCart();
  const validateCouponMutation = useValidateCoupon();
  const createOrderMutation = useCreateOrder();
  const addToCartMutation = useAddToCart();

  const handleQuantityChange = async (itemId: string, qty: number) => {
    try {
      await updateItemMutation.mutateAsync({ itemId, data: { quantity: qty } });
      queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
    } catch (error: any) {
      toast({ title: "Failed to update", description: error.message, variant: "destructive" });
    }
  };

  const handleRemove = async (itemId: string) => {
    try {
      await removeItemMutation.mutateAsync({ itemId });
      queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
    } catch (error: any) {
      toast({ title: "Failed to remove", description: error.message, variant: "destructive" });
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const coupon = await validateCouponMutation.mutateAsync({
        data: { code: couponCode.trim(), orderAmount: cart?.subtotal || 0 }
      });
      setAppliedCoupon(coupon);
      toast({ title: "Coupon applied!", description: coupon.description });
    } catch (error: any) {
      toast({ title: "Invalid coupon", description: error.message || "Coupon not valid", variant: "destructive" });
    }
  };

  const coinsDiscount = useCoins && coinsData ? Math.floor((coinsData.coins / 50)) * 5 : 0;
  const couponDiscount = appliedCoupon ? (
    appliedCoupon.discountType === "percentage"
      ? Math.min((cart?.subtotal || 0) * appliedCoupon.discountValue / 100, appliedCoupon.maxDiscount || Infinity)
      : appliedCoupon.discountValue
  ) : 0;
  const totalDiscount = coinsDiscount + couponDiscount;
  const finalTotal = Math.max(0, (cart?.subtotal || 0) + (cart?.deliveryFee || 0) - totalDiscount);

  const handlePlaceOrder = async () => {
    if (!cart?.items?.length) return;
    if (!deliveryAddress.trim()) {
      toast({ title: "Please enter a delivery address", variant: "destructive" });
      return;
    }
    setPlacing(true);
    try {
      const order = await createOrderMutation.mutateAsync({
        data: {
          restaurantId: cart.restaurantId!,
          items: cart.items.map(i => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
          paymentMethod,
          deliveryAddress,
          couponCode: appliedCoupon?.code,
          useCoins,
        }
      });
      queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
      queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
      toast({ title: "Order placed!", description: `Your order #${order.id.slice(-6)} has been placed.` });
      setLocation(`/orders/${order.id}`);
    } catch (error: any) {
      toast({ title: "Failed to place order", description: error.message, variant: "destructive" });
    } finally {
      setPlacing(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-40" />
        <h2 className="text-2xl font-bold mb-2">Login to view your cart</h2>
        <Link href="/login"><Button className="mt-4">Login</Button></Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!cart?.items?.length) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-40" />
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6">Add some delicious items from our restaurants</p>
        <Link href="/restaurants"><Button>Browse Restaurants</Button></Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-border/50">
            <CardContent className="p-0 divide-y divide-border">
              {cart.items.map(item => (
                <div key={item.id} className="flex items-center gap-4 p-4" data-testid={`cart-item-${item.id}`}>
                  {item.image && (
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{item.name}</p>
                    <p className="text-primary font-bold">₹{item.price * item.quantity}</p>
                    <p className="text-xs text-muted-foreground">₹{item.price} each</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1 bg-primary/10 rounded-lg border border-primary/20">
                      <button
                        className="h-8 w-8 flex items-center justify-center text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        onClick={() => item.quantity <= 1 ? handleRemove(item.id) : handleQuantityChange(item.id, item.quantity - 1)}
                        data-testid={`button-decrease-cart-${item.id}`}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="font-bold min-w-[1.5rem] text-center text-sm">{item.quantity}</span>
                      <button
                        className="h-8 w-8 flex items-center justify-center text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        data-testid={`button-increase-cart-${item.id}`}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button
                      className="text-destructive hover:text-destructive/80 p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                      onClick={() => handleRemove(item.id)}
                      data-testid={`button-remove-cart-${item.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {suggestions && suggestions.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 text-muted-foreground text-sm uppercase tracking-wide">People also order</h3>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {suggestions.slice(0, 4).map(item => (
                  <Card key={item.id} className="shrink-0 w-40 border-border/50 hover:border-primary/30 transition-colors">
                    <div className="h-24 overflow-hidden rounded-t-lg bg-muted">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-primary/10" />
                      )}
                    </div>
                    <CardContent className="p-2">
                      <p className="font-medium text-xs truncate">{item.name}</p>
                      <p className="text-primary font-bold text-sm">₹{item.price}</p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-1 h-7 text-xs border-primary/30 text-primary"
                        onClick={async () => {
                          try {
                            await addToCartMutation.mutateAsync({ data: { menuItemId: item.id, quantity: 1 } });
                            queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
                            toast({ title: `${item.name} added to cart` });
                          } catch (e: any) {
                            toast({ title: e.message, variant: "destructive" });
                          }
                        }}
                      >
                        Add
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Delivery Address</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Enter delivery address..."
                value={deliveryAddress}
                onChange={e => setDeliveryAddress(e.target.value)}
                data-testid="input-delivery-address"
              />
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" />
                Coupon Code
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter coupon code..."
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  data-testid="input-coupon"
                />
                <Button
                  variant="outline"
                  onClick={handleApplyCoupon}
                  disabled={validateCouponMutation.isPending}
                  data-testid="button-apply-coupon"
                >
                  Apply
                </Button>
              </div>
              {appliedCoupon && (
                <div className="flex items-center justify-between mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <span className="text-green-700 dark:text-green-400 text-sm font-medium">{appliedCoupon.code}</span>
                  <button onClick={() => { setAppliedCoupon(null); setCouponCode(""); }} className="text-red-500 text-xs hover:underline">Remove</button>
                </div>
              )}
            </CardContent>
          </Card>

          {coinsData && coinsData.coins > 0 && (
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coins className="h-4 w-4 text-amber-500" />
                    <div>
                      <p className="text-sm font-semibold">Use {coinsData.coins} Coins</p>
                      <p className="text-xs text-muted-foreground">Worth ₹{coinsData.equivalentValue}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setUseCoins(!useCoins)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${useCoins ? "bg-primary" : "bg-muted"}`}
                    data-testid="toggle-use-coins"
                  >
                    <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${useCoins ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <button
                onClick={() => setPaymentMethod("online")}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${paymentMethod === "online" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}
                data-testid="button-pay-online"
              >
                <CreditCard className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <p className="font-medium text-sm">Pay Online</p>
                  <p className="text-xs text-muted-foreground">UPI, Card, Net Banking</p>
                </div>
              </button>
              <button
                onClick={() => setPaymentMethod("cod")}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${paymentMethod === "cod" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}
                data-testid="button-pay-cod"
              >
                <Banknote className="h-5 w-5 text-green-600" />
                <div className="text-left">
                  <p className="font-medium text-sm">Cash on Delivery</p>
                  <p className="text-xs text-muted-foreground">Pay when you receive</p>
                </div>
              </button>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Bill Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Item Total</span>
                <span>₹{cart.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span>₹{cart.deliveryFee}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Coupon Discount ({appliedCoupon?.code})</span>
                  <span>-₹{couponDiscount.toFixed(0)}</span>
                </div>
              )}
              {coinsDiscount > 0 && useCoins && (
                <div className="flex justify-between text-amber-600">
                  <span>Coins Discount</span>
                  <span>-₹{coinsDiscount}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <span>₹{finalTotal.toFixed(0)}</span>
              </div>
              <p className="text-xs text-green-600 font-medium">
                You will earn {cart.subtotal >= 200 ? 50 : 10} coins on this order
              </p>
            </CardContent>
          </Card>

          <Button
            className="w-full h-12 text-base font-semibold"
            onClick={handlePlaceOrder}
            disabled={placing || !deliveryAddress.trim()}
            data-testid="button-place-order"
          >
            {placing ? "Placing Order..." : `Place Order • ₹${finalTotal.toFixed(0)}`}
            <ChevronRight className="h-5 w-5 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
