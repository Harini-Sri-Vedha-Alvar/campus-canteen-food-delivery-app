import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useGetCart, useUpdateCartItem, useRemoveCartItem, useCreateOrder, useValidateCoupon, useGetUserCoins, useGetSuggestions, useAddToCart, getGetCartQueryKey, getGetUserCoinsQueryKey, getGetSuggestionsQueryKey, getListOrdersQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { ShoppingCart, Plus, Minus, Trash2, Tag, Coins, CreditCard, Banknote, ChevronRight, MapPin, Check, X, Smartphone, Scan, AlertCircle, Lock } from "lucide-react";
const PAYMENT_METHODS = [
    { id: "card", label: "Credit / Debit Card", icon: CreditCard, desc: "Visa, Mastercard, Rupay" },
    { id: "upi", label: "UPI Payment", icon: Smartphone, desc: "Google Pay, PhonePe, Paytm" },
    { id: "cod", label: "Cash on Delivery", icon: Banknote, desc: "Pay when you receive" },
];
const SAMPLE_COUPONS = ["WELCOME50", "FLAT40", "NEWUSER", "WEEKEND20"];
function UPIQRCode({ upiId }) {
    return (<div className="flex flex-col items-center gap-3 p-4 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl border border-primary/20">
      <div className="relative w-36 h-36 bg-white rounded-xl p-2 shadow-md">
        <div className="w-full h-full grid grid-cols-7 grid-rows-7 gap-0.5">
          {Array.from({ length: 49 }).map((_, i) => {
            const corners = [0, 1, 2, 3, 4, 5, 6, 7, 13, 14, 20, 21, 27, 28, 34, 35, 41, 42, 43, 44, 45, 46, 47, 48];
            const inner = [8, 9, 10, 11, 12, 15, 19, 22, 26, 29, 33, 36, 37, 38, 39, 40];
            const dot = [16, 17, 18, 23, 24, 25, 30, 31, 32];
            const filled = Math.random() > 0.45;
            const isCornerFrame = corners.includes(i);
            const isInnerFrame = inner.includes(i);
            const isDot = dot.includes(i);
            return (<div key={i} className={`rounded-sm ${isCornerFrame ? "bg-gray-900" :
                    isInnerFrame ? "bg-white" :
                        isDot ? "bg-gray-900" :
                            filled ? "bg-gray-800" : "bg-white"}`}/>);
        })}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white rounded-md p-1">
            <div className="h-6 w-6 bg-primary rounded-sm flex items-center justify-center">
              <Scan className="h-4 w-4 text-white"/>
            </div>
          </div>
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs font-medium text-muted-foreground">Scan with any UPI app</p>
        <p className="text-sm font-bold text-primary mt-1">{upiId || "foodrush@upi"}</p>
      </div>
      <Separator className="w-full"/>
      <div className="w-full">
        <p className="text-xs text-muted-foreground mb-2 text-center">Or pay using UPI ID</p>
        <div className="flex gap-2">
          <Input placeholder="yourname@upi" className="h-9 text-sm" defaultValue=""/>
          <Button size="sm" className="h-9 shrink-0">Verify</Button>
        </div>
      </div>
      <div className="flex gap-2">
        {["gpay", "phonepe", "paytm", "bhim"].map(app => (<div key={app} className="h-10 w-10 rounded-xl bg-white shadow border border-border/50 flex items-center justify-center cursor-pointer hover:shadow-md transition-shadow">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">{app.slice(0, 2)}</span>
          </div>))}
      </div>
    </div>);
}
function CardPaymentForm({ onCardChange }) {
    const [card, setCard] = useState({ number: "", name: "", expiry: "", cvv: "" });
    const [cardType, setCardType] = useState("");
    const formatCardNumber = (val) => {
        const num = val.replace(/\D/g, "").slice(0, 16);
        const parts = num.match(/.{1,4}/g) || [];
        return parts.join(" ");
    };
    const formatExpiry = (val) => {
        const num = val.replace(/\D/g, "").slice(0, 4);
        if (num.length >= 2)
            return `${num.slice(0, 2)}/${num.slice(2)}`;
        return num;
    };
    const detectCardType = (num) => {
        const n = num.replace(/\s/g, "");
        if (n.startsWith("4"))
            return "VISA";
        if (/^5[1-5]/.test(n))
            return "MC";
        if (n.startsWith("6"))
            return "RUPAY";
        return "";
    };
    const update = (field, val) => {
        const updated = { ...card, [field]: val };
        setCard(updated);
        onCardChange && onCardChange(updated);
        if (field === "number")
            setCardType(detectCardType(val));
    };
    return (<div className="space-y-3">
      <div className="relative h-40 bg-gradient-to-br from-primary via-primary/80 to-secondary rounded-2xl p-5 text-white overflow-hidden shadow-lg">
        <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10"/>
        <div className="absolute -right-2 top-8 w-20 h-20 rounded-full bg-white/5"/>
        <div className="absolute top-4 right-4 text-xs font-bold opacity-80">{cardType || "CARD"}</div>
        <div className="mt-4">
          <p className="font-mono text-lg tracking-widest opacity-90">
            {card.number || "•••• •••• •••• ••••"}
          </p>
        </div>
        <div className="flex justify-between mt-4">
          <div>
            <p className="text-[10px] opacity-60 uppercase">Card Holder</p>
            <p className="text-sm font-medium">{card.name || "Your Name"}</p>
          </div>
          <div>
            <p className="text-[10px] opacity-60 uppercase">Expires</p>
            <p className="text-sm font-medium">{card.expiry || "MM/YY"}</p>
          </div>
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Card Number</label>
        <Input placeholder="1234 5678 9012 3456" className="h-10 font-mono tracking-wider" value={card.number} onChange={e => update("number", formatCardNumber(e.target.value))} maxLength={19}/>
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Name on Card</label>
        <Input placeholder="Rahul Sharma" className="h-10" value={card.name} onChange={e => update("name", e.target.value.toUpperCase())}/>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Expiry Date</label>
          <Input placeholder="MM/YY" className="h-10" value={card.expiry} onChange={e => update("expiry", formatExpiry(e.target.value))} maxLength={5}/>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">CVV</label>
          <Input type="password" placeholder="•••" className="h-10" value={card.cvv} onChange={e => update("cvv", e.target.value.replace(/\D/g, "").slice(0, 4))} maxLength={4}/>
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-2">
        <Lock className="h-3.5 w-3.5 text-green-600 shrink-0"/>
        Your card details are encrypted and secure
      </div>
    </div>);
}
export default function Cart() {
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [, setLocation] = useLocation();
    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [useCoins, setUseCoins] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("card");
    const [cardData, setCardData] = useState({});
    const [deliveryAddress, setDeliveryAddress] = useState(user?.address || "");
    const [addressConfirmed, setAddressConfirmed] = useState(false);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [placing, setPlacing] = useState(false);
    const [couponLoading, setCouponLoading] = useState(false);
    const { data: cart, isLoading } = useGetCart({ query: { enabled: !!user, queryKey: getGetCartQueryKey() } });
    const { data: coinsData } = useGetUserCoins({ query: { enabled: !!user, queryKey: getGetUserCoinsQueryKey() } });
    const cartItemIds = cart?.items?.map(i => i.menuItemId).join(",") || "";
    const { data: suggestions } = useGetSuggestions(cartItemIds ? { itemIds: cartItemIds } : undefined, { query: { enabled: !!cartItemIds, queryKey: getGetSuggestionsQueryKey(cartItemIds ? { itemIds: cartItemIds } : undefined) } });
    const updateItemMutation = useUpdateCartItem();
    const removeItemMutation = useRemoveCartItem();
    const validateCouponMutation = useValidateCoupon();
    const createOrderMutation = useCreateOrder();
    const addToCartMutation = useAddToCart();
    useEffect(() => {
        if (user?.address && !deliveryAddress)
            setDeliveryAddress(user.address);
    }, [user]);
    const handleQuantityChange = async (itemId, qty) => {
        try {
            await updateItemMutation.mutateAsync({ itemId, data: { quantity: qty } });
            queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        }
        catch (error) {
            toast({ title: "Failed to update", description: error.message, variant: "destructive" });
        }
    };
    const handleRemove = async (itemId) => {
        try {
            await removeItemMutation.mutateAsync({ itemId });
            queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        }
        catch (error) {
            toast({ title: "Failed to remove", description: error.message, variant: "destructive" });
        }
    };
    const handleApplyCoupon = async () => {
        if (!couponCode.trim())
            return;
        setCouponLoading(true);
        try {
            const coupon = await validateCouponMutation.mutateAsync({
                data: { code: couponCode.trim().toUpperCase(), orderAmount: cart?.subtotal || 0 }
            });
            setAppliedCoupon(coupon);
            toast({ title: "Coupon applied! 🎉", description: `${coupon.description || coupon.code} — you saved ₹${Math.round(couponDiscount(coupon))}` });
        }
        catch (error) {
            toast({ title: "Invalid coupon", description: error.message || "This coupon is not valid", variant: "destructive" });
        }
        finally {
            setCouponLoading(false);
        }
    };
    const couponDiscount = (c = appliedCoupon) => {
        if (!c)
            return 0;
        if (c.discountType === "percentage") {
            const disc = (cart?.subtotal || 0) * c.discountValue / 100;
            return c.maxDiscount ? Math.min(disc, c.maxDiscount) : disc;
        }
        return c.discountValue || 0;
    };
    const coinsDiscount = useCoins && coinsData ? Math.floor(coinsData.coins / 50) * 5 : 0;
    const totalDiscount = couponDiscount() + coinsDiscount;
    const finalTotal = Math.max(0, (cart?.subtotal || 0) + (cart?.deliveryFee || 0) - totalDiscount);
    const coinsToEarn = (cart?.subtotal || 0) >= 200 ? 50 : 10;
    const handlePlaceOrder = async () => {
        if (!cart?.items?.length)
            return;
        if (!addressConfirmed || !deliveryAddress.trim()) {
            setShowAddressModal(true);
            return;
        }
        if (paymentMethod === "card") {
            if (!cardData.number || cardData.number.replace(/\s/g, "").length < 16) {
                toast({ title: "Invalid card", description: "Please enter a valid 16-digit card number", variant: "destructive" });
                return;
            }
            if (!cardData.cvv || cardData.cvv.length < 3) {
                toast({ title: "Invalid CVV", description: "Please enter your card CVV", variant: "destructive" });
                return;
            }
        }
        setPlacing(true);
        try {
            const order = await createOrderMutation.mutateAsync({
                data: {
                    restaurantId: cart.restaurantId,
                    items: cart.items.map(i => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
                    paymentMethod: paymentMethod === "cod" ? "cod" : "online",
                    deliveryAddress,
                    couponCode: appliedCoupon?.code,
                    useCoins,
                }
            });
            queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
            queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
            toast({ title: "Order placed! 🎉", description: `Order #${order.id.slice(-6).toUpperCase()} is confirmed.` });
            setLocation(`/orders/${order.id}`);
        }
        catch (error) {
            toast({ title: "Failed to place order", description: error.message, variant: "destructive" });
        }
        finally {
            setPlacing(false);
        }
    };
    if (!user) {
        return (<div className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-sm mx-auto">
          <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="h-12 w-12 text-primary opacity-60"/>
          </div>
          <h2 className="text-2xl font-bold mb-2">Sign in to view cart</h2>
          <p className="text-muted-foreground mb-6">Your saved items will appear here after login</p>
          <Link href="/login"><Button size="lg" className="w-full">Sign In</Button></Link>
        </div>
      </div>);
    }
    if (isLoading) {
        return (<div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-6"/>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-xl"/>)}</div>
          <Skeleton className="h-96 rounded-xl"/>
        </div>
      </div>);
    }
    if (!cart?.items?.length) {
        return (<div className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-sm mx-auto">
          <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="h-12 w-12 text-primary opacity-60"/>
          </div>
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Add delicious items from our restaurants</p>
          <Link href="/restaurants"><Button size="lg" className="w-full">Browse Restaurants</Button></Link>
        </div>
      </div>);
    }
    return (<div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Your Cart</h1>
        <Badge variant="secondary" className="text-sm">{cart.items.length} item{cart.items.length !== 1 ? "s" : ""}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-5">
          <Card className="border-border/50 overflow-hidden">
            <CardHeader className="pb-2 bg-muted/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Order Items</CardTitle>
                <p className="text-sm text-muted-foreground">{cart.items.length} items from {cart.restaurantId ? "restaurant" : "—"}</p>
              </div>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-border/50">
              {cart.items.map(item => (<div key={item.id} className="flex items-center gap-4 p-4 hover:bg-muted/20 transition-colors">
                  {item.image ? (<div className="w-16 h-16 rounded-xl overflow-hidden bg-muted shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover"/>
                    </div>) : (<div className="w-16 h-16 rounded-xl bg-primary/10 shrink-0 flex items-center justify-center text-2xl">🍽️</div>)}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">₹{item.price} each</p>
                    <p className="font-bold text-primary">₹{item.price * item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1 bg-primary rounded-lg overflow-hidden">
                      <button className="h-8 w-8 flex items-center justify-center text-primary-foreground hover:bg-black/10 transition-colors" onClick={() => item.quantity <= 1 ? handleRemove(item.id) : handleQuantityChange(item.id, item.quantity - 1)}>
                        <Minus className="h-3.5 w-3.5"/>
                      </button>
                      <span className="text-primary-foreground font-bold min-w-[1.5rem] text-center text-sm">{item.quantity}</span>
                      <button className="h-8 w-8 flex items-center justify-center text-primary-foreground hover:bg-black/10 transition-colors" onClick={() => handleQuantityChange(item.id, item.quantity + 1)}>
                        <Plus className="h-3.5 w-3.5"/>
                      </button>
                    </div>
                    <button className="h-8 w-8 rounded-lg flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors" onClick={() => handleRemove(item.id)}>
                      <Trash2 className="h-4 w-4"/>
                    </button>
                  </div>
                </div>))}
            </CardContent>
          </Card>

          {suggestions && suggestions.length > 0 && (<div>
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">People also order with this</p>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {suggestions.slice(0, 5).map(item => (<Card key={item.id} className="shrink-0 w-36 border-border/50 hover:border-primary/30 transition-colors cursor-pointer group">
                    <div className="h-20 overflow-hidden rounded-t-lg bg-muted">
                      {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform"/> : <div className="w-full h-full bg-primary/10 flex items-center justify-center text-xl">🍽️</div>}
                    </div>
                    <CardContent className="p-2">
                      <p className="font-medium text-xs truncate">{item.name}</p>
                      <p className="text-primary font-bold text-sm">₹{item.price}</p>
                      <Button size="sm" variant="outline" className="w-full mt-1 h-7 text-xs border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground" onClick={async () => {
                    try {
                        await addToCartMutation.mutateAsync({ data: { menuItemId: item.id, quantity: 1 } });
                        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
                        toast({ title: `Added ${item.name}` });
                    }
                    catch (e) {
                        toast({ title: e.message, variant: "destructive" });
                    }
                }}>+ Add</Button>
                    </CardContent>
                  </Card>))}
              </div>
            </div>)}

          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary"/> Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className={`relative rounded-xl border-2 transition-all ${addressConfirmed ? "border-green-500 bg-green-50 dark:bg-green-900/10" : "border-border"}`}>
                <textarea placeholder="Enter your complete delivery address with landmark..." className="w-full bg-transparent p-3 text-sm resize-none focus:outline-none min-h-[72px] pr-10" value={deliveryAddress} onChange={e => { setDeliveryAddress(e.target.value); setAddressConfirmed(false); }} rows={3}/>
                {addressConfirmed && (<div className="absolute top-3 right-3">
                    <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                      <Check className="h-3 w-3 text-white"/>
                    </div>
                  </div>)}
              </div>
              {deliveryAddress.trim() && !addressConfirmed && (<Button variant="outline" className="w-full border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground" onClick={() => {
                if (deliveryAddress.trim().length < 10) {
                    toast({ title: "Address too short", description: "Please enter a complete address", variant: "destructive" });
                    return;
                }
                setAddressConfirmed(true);
                toast({ title: "Address confirmed ✓" });
            }}>
                  <Check className="h-4 w-4 mr-2"/> Confirm This Address
                </Button>)}
              {addressConfirmed && (<div className="flex items-center justify-between text-sm">
                  <span className="text-green-600 font-medium flex items-center gap-1">
                    <Check className="h-4 w-4"/> Address confirmed
                  </span>
                  <button className="text-muted-foreground hover:text-foreground text-xs underline" onClick={() => setAddressConfirmed(false)}>Change</button>
                </div>)}
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary"/> Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 gap-2">
                {PAYMENT_METHODS.map(method => (<button key={method.id} onClick={() => setPaymentMethod(method.id)} className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-left ${paymentMethod === method.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30 hover:bg-muted/30"}`}>
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${paymentMethod === method.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      <method.icon className="h-5 w-5"/>
                    </div>
                    <div className="flex-1">
                      <p className={`font-semibold text-sm ${paymentMethod === method.id ? "text-primary" : ""}`}>{method.label}</p>
                      <p className="text-xs text-muted-foreground">{method.desc}</p>
                    </div>
                    <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === method.id ? "border-primary" : "border-muted-foreground/30"}`}>
                      {paymentMethod === method.id && <div className="h-2.5 w-2.5 rounded-full bg-primary"/>}
                    </div>
                  </button>))}
              </div>

              {paymentMethod === "card" && (<div className="mt-2">
                  <CardPaymentForm onCardChange={setCardData}/>
                </div>)}

              {paymentMethod === "upi" && (<div className="mt-2">
                  <UPIQRCode upiId="foodrush@ybl"/>
                </div>)}

              {paymentMethod === "cod" && (<div className="mt-2 flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                  <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5"/>
                  <div className="text-sm">
                    <p className="font-semibold text-amber-800 dark:text-amber-400">Cash on Delivery</p>
                    <p className="text-amber-700 dark:text-amber-500 text-xs mt-1">Keep exact change ready of ₹{finalTotal.toFixed(0)}. Our delivery partner will collect payment.</p>
                  </div>
                </div>)}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary"/> Coupon Code
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!appliedCoupon ? (<>
                  <div className="flex gap-2">
                    <Input placeholder="Enter coupon code" className="h-10 uppercase font-mono tracking-wider" value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} onKeyDown={e => e.key === "Enter" && handleApplyCoupon()}/>
                    <Button onClick={handleApplyCoupon} disabled={couponLoading || !couponCode.trim()} className="h-10 shrink-0">
                      {couponLoading ? "..." : "Apply"}
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {SAMPLE_COUPONS.map(c => (<button key={c} onClick={() => { setCouponCode(c); }} className="text-xs font-mono px-2.5 py-1 rounded-lg border border-dashed border-primary/40 text-primary hover:bg-primary/10 transition-colors">
                        {c}
                      </button>))}
                  </div>
                </>) : (<div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-800 flex items-center justify-center">
                      <Tag className="h-4 w-4 text-green-600"/>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-green-700 dark:text-green-400 font-mono">{appliedCoupon.code}</p>
                      <p className="text-xs text-green-600 dark:text-green-500">Saving ₹{Math.round(couponDiscount())}</p>
                    </div>
                  </div>
                  <button onClick={() => { setAppliedCoupon(null); setCouponCode(""); toast({ title: "Coupon removed" }); }} className="h-7 w-7 rounded-lg flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors">
                    <X className="h-4 w-4"/>
                  </button>
                </div>)}
            </CardContent>
          </Card>

          {coinsData && coinsData.coins > 0 && (<Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-800 flex items-center justify-center">
                      <Coins className="h-5 w-5 text-amber-600"/>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{coinsData.coins} FoodRush Coins</p>
                      <p className="text-xs text-muted-foreground">Worth ₹{coinsData.equivalentValue} discount</p>
                    </div>
                  </div>
                  <button onClick={() => setUseCoins(!useCoins)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${useCoins ? "bg-amber-500" : "bg-muted"}`}>
                    <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${useCoins ? "translate-x-6" : "translate-x-1"}`}/>
                  </button>
                </div>
              </CardContent>
            </Card>)}

          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Bill Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Item Total</span>
                <span className="font-medium">₹{cart.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span className="font-medium">₹{cart.deliveryFee}</span>
              </div>
              {couponDiscount() > 0 && (<div className="flex justify-between text-green-600">
                  <span className="flex items-center gap-1">
                    <Tag className="h-3.5 w-3.5"/> {appliedCoupon?.code}
                  </span>
                  <span className="font-semibold">-₹{Math.round(couponDiscount())}</span>
                </div>)}
              {coinsDiscount > 0 && useCoins && (<div className="flex justify-between text-amber-600">
                  <span className="flex items-center gap-1">
                    <Coins className="h-3.5 w-3.5"/> Coins Discount
                  </span>
                  <span className="font-semibold">-₹{coinsDiscount}</span>
                </div>)}
              <Separator />
              <div className="flex justify-between font-bold text-base">
                <span>Total to Pay</span>
                <span className="text-primary">₹{finalTotal.toFixed(0)}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2 text-xs text-amber-700 dark:text-amber-400 font-medium">
                <Coins className="h-3.5 w-3.5 shrink-0"/>
                You'll earn <strong className="mx-0.5">{coinsToEarn} coins</strong> after delivery!
              </div>
            </CardContent>
          </Card>

          {!addressConfirmed && deliveryAddress.trim() === "" && (<div className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 border border-amber-200 dark:border-amber-800">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5"/>
              Please enter and confirm your delivery address before placing order
            </div>)}

          <Button className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/20" onClick={handlePlaceOrder} disabled={placing || !cart?.items?.length} data-testid="button-place-order">
            {placing ? (<span className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                Processing...
              </span>) : (<span className="flex items-center gap-2">
                {paymentMethod === "cod" ? <Banknote className="h-5 w-5"/> : <Lock className="h-5 w-5"/>}
                {paymentMethod === "cod" ? "Place Order (COD)" : `Pay ₹${finalTotal.toFixed(0)}`}
                <ChevronRight className="h-4 w-4"/>
              </span>)}
          </Button>

          <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
            <Lock className="h-3 w-3"/> Secure & encrypted checkout
          </p>
        </div>
      </div>

      <Dialog open={showAddressModal} onOpenChange={setShowAddressModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary"/> Confirm Delivery Address
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Please enter and confirm your delivery address to proceed.</p>
            <textarea className="w-full rounded-xl border-2 border-border p-3 text-sm focus:outline-none focus:border-primary min-h-[80px] bg-background resize-none" placeholder="Enter complete address with flat/house no, street, area, city..." value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} rows={3}/>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAddressModal(false)}>Cancel</Button>
            <Button onClick={() => {
            if (deliveryAddress.trim().length < 10) {
                toast({ title: "Address too short", variant: "destructive" });
                return;
            }
            setAddressConfirmed(true);
            setShowAddressModal(false);
            toast({ title: "Address confirmed ✓" });
        }}>
              Confirm Address
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>);
}
