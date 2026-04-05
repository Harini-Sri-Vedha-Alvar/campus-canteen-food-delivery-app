import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useListOrders, getListOrdersQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Package, Clock, ChevronRight } from "lucide-react";
const STATUS_CONFIG = {
    placed: { label: "Order Placed", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    confirmed: { label: "Confirmed", color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" },
    preparing: { label: "Preparing", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
    out_for_delivery: { label: "Out for Delivery", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
    delivered: { label: "Delivered", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
    cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};
export default function Orders() {
    const { user } = useAuth();
    const { data: orders, isLoading } = useListOrders({
        query: { enabled: !!user, queryKey: getListOrdersQueryKey() }
    });
    if (!user) {
        return (<div className="container mx-auto px-4 py-20 text-center">
        <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-40"/>
        <h2 className="text-2xl font-bold mb-2">Login to view your orders</h2>
        <Link href="/login"><Button className="mt-4">Login</Button></Link>
      </div>);
    }
    if (isLoading) {
        return (<div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-6"/>
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-36 rounded-xl"/>)}
        </div>
      </div>);
    }
    return (<div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Orders</h1>
      {!orders?.length ? (<div className="text-center py-20">
          <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-40"/>
          <p className="text-xl font-semibold mb-2">No orders yet</p>
          <p className="text-muted-foreground mb-6">Your order history will appear here</p>
          <Link href="/restaurants"><Button>Order Now</Button></Link>
        </div>) : (<div className="space-y-4">
          {orders.map(order => {
                const statusConfig = STATUS_CONFIG[order.status] || { label: order.status, color: "bg-muted text-muted-foreground" };
                return (<Link key={order.id} href={`/orders/${order.id}`}>
                <Card className="hover:shadow-md transition-all cursor-pointer border-border/50 hover:border-primary/20" data-testid={`card-order-${order.id}`}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-base">{order.restaurantName}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {order.items.map(i => `${i.name} x${i.quantity}`).join(", ")}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="font-semibold text-foreground">₹{order.total}</span>
                          <span>•</span>
                          <span className="capitalize">{order.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}</span>
                          <span>•</span>
                          <Clock className="h-3 w-3"/>
                          <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                        {order.coinsEarned > 0 && (<p className="text-xs text-amber-600 font-medium">+{order.coinsEarned} coins earned</p>)}
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 mt-1"/>
                    </div>
                  </CardContent>
                </Card>
              </Link>);
            })}
        </div>)}
    </div>);
}
