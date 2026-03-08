import { useCart, useUpdateCartItem, useDeleteCartItem } from "@/hooks/use-cart";
import { useCreateOrder } from "@/hooks/use-orders";
import { useAuth } from "@/hooks/use-auth";
import { formatPrice } from "@/lib/format";
import { Button } from "./ui-custom/Button";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useLocation } from "wouter";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
function CartDrawer() {
  const { data: cart = [], isLoading } = useCart();
  const { data: user } = useAuth();
  const updateItem = useUpdateCartItem();
  const deleteItem = useDeleteCartItem();
  const createOrder = useCreateOrder();
  const [, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const totalCents = cart.reduce((acc, item) => acc + item.menuItem.price * item.quantity, 0);
  const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const handleCheckout = async () => {
    if (!user) {
      setIsOpen(false);
      setLocation("/login");
      return;
    }
    try {
      await createOrder.mutateAsync();
      setIsOpen(false);
      setLocation("/orders");
    } catch (err) {
      console.error(err);
    }
  };
  return <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative group overflow-hidden border-2 border-primary/20 bg-primary/5 hover:bg-primary/10">
          <ShoppingBag className="w-5 h-5 mr-2 text-primary" />
          <span className="font-bold text-primary">Cart</span>
          {itemCount > 0 && <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {itemCount}
            </span>}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0 border-l-0 shadow-2xl">
        <SheetHeader className="p-6 border-b border-border/50 bg-muted/30">
          <SheetTitle className="text-2xl font-display flex items-center gap-2">
            <ShoppingBag className="text-primary w-6 h-6" /> Your Order
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isLoading ? <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-muted rounded-xl" />)}
            </div> : cart.length === 0 ? <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center">
                <ShoppingBag className="w-10 h-10 opacity-50" />
              </div>
              <p className="font-medium text-lg">Your cart is feeling light.</p>
              <Button variant="outline" onClick={() => setIsOpen(false)}>Browse Restaurants</Button>
            </div> : <AnimatePresence>
              {cart.map((item) => <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, x: -50 }}
    key={item.id}
    className="flex gap-4 p-4 rounded-2xl bg-card border border-border shadow-sm group"
  >
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                    <img src={item.menuItem.imageUrl} alt={item.menuItem.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold leading-tight">{item.menuItem.name}</h4>
                      <p className="font-semibold text-primary">{formatPrice(item.menuItem.price * item.quantity)}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                        <button
    disabled={updateItem.isPending || item.quantity <= 1}
    onClick={() => updateItem.mutate({ id: item.id, quantity: item.quantity - 1 })}
    className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-background disabled:opacity-50 transition-colors"
  >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                        <button
    disabled={updateItem.isPending}
    onClick={() => updateItem.mutate({ id: item.id, quantity: item.quantity + 1 })}
    className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-background transition-colors"
  >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button
    onClick={() => deleteItem.mutate(item.id)}
    className="text-muted-foreground hover:text-destructive p-2 rounded-full hover:bg-destructive/10 transition-colors"
  >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>)}
            </AnimatePresence>}
        </div>

        {cart.length > 0 && <div className="p-6 border-t border-border/50 bg-background shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-10 relative">
            <div className="flex justify-between items-center mb-6">
              <span className="text-muted-foreground font-medium">Subtotal</span>
              <span className="text-2xl font-display font-bold">{formatPrice(totalCents)}</span>
            </div>
            <Button
    className="w-full text-lg h-14 rounded-2xl"
    onClick={handleCheckout}
    disabled={createOrder.isPending}
  >
              {createOrder.isPending ? "Processing..." : "Checkout Order"}
            </Button>
          </div>}
      </SheetContent>
    </Sheet>;
}
export {
  CartDrawer
};
