import { useOrders } from "@/hooks/use-orders";
import { formatPrice } from "@/lib/format";
import { format } from "date-fns";
import { ReceiptText, Package, CheckCircle2, Clock } from "lucide-react";
import { motion } from "framer-motion";

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case 'pending': return <Clock className="w-5 h-5 text-secondary" />;
    case 'preparing': return <Package className="w-5 h-5 text-accent" />;
    case 'delivering': return <Package className="w-5 h-5 text-primary" />;
    case 'delivered': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    default: return <Clock className="w-5 h-5" />;
  }
};

export default function Orders() {
  const { data: orders = [], isLoading } = useOrders();

  if (isLoading) {
    return <div className="container mx-auto p-8 font-display text-xl">Loading orders...</div>;
  }

  return (
    <div className="min-h-screen bg-muted/20 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-primary/10 p-3 rounded-2xl">
            <ReceiptText className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-display font-bold text-foreground">My Orders</h1>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-3xl border-2 border-border shadow-sm">
            <ReceiptText className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-2xl font-display font-bold mb-2">No orders yet</h3>
            <p className="text-muted-foreground text-lg">Looks like you haven't ordered anything. Time to get hungry!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={order.id} 
                className="bg-card border-2 border-border rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/50 pb-4 mb-4">
                  <div>
                    <p className="text-sm font-bold text-muted-foreground mb-1">ORDER #{order.id.toString().padStart(5, '0')}</p>
                    <p className="font-medium">{format(new Date(order.createdAt!), 'PPP at p')}</p>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-xl">
                    <StatusIcon status={order.status} />
                    <span className="font-bold uppercase tracking-wider text-sm">{order.status}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {(order.items as any[]).map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center text-sm sm:text-base">
                      <div className="flex items-center gap-3">
                        <span className="bg-secondary/20 text-secondary-foreground font-bold w-8 h-8 rounded-lg flex items-center justify-center">
                          {item.quantity}x
                        </span>
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <span className="font-bold text-muted-foreground">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-border/50">
                  <span className="font-medium text-muted-foreground">Total Paid</span>
                  <span className="text-2xl font-display font-black text-primary">{formatPrice(order.totalPrice)}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
