import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useGetAdminOrders, useUpdateOrderStatus, getGetAdminOrdersQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, Search } from "lucide-react";

const ORDER_STATUSES = ["placed", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"];

const STATUS_COLOR: Record<string, string> = {
  placed: "bg-blue-100 text-blue-700",
  confirmed: "bg-indigo-100 text-indigo-700",
  preparing: "bg-amber-100 text-amber-700",
  out_for_delivery: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function AdminOrders() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");

  const params: Record<string, string> = {};
  if (filterStatus && filterStatus !== "all") params.status = filterStatus;
  if (search) params.search = search;

  const { data: orders, isLoading } = useGetAdminOrders(
    Object.keys(params).length > 0 ? params : undefined,
    { query: { queryKey: getGetAdminOrdersQueryKey(Object.keys(params).length > 0 ? params : undefined) } }
  );

  const updateStatusMutation = useUpdateOrderStatus();

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateStatusMutation.mutateAsync({ orderId, data: { status: newStatus } });
      queryClient.invalidateQueries({ queryKey: getGetAdminOrdersQueryKey() });
      toast({ title: "Order status updated" });
    } catch (error: any) {
      toast({ title: "Failed to update status", description: error.message, variant: "destructive" });
    }
  };

  if (user?.role !== "admin") {
    return <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Access Denied</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin">
          <Button variant="ghost" size="icon"><ChevronLeft className="h-5 w-5" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Manage Orders</h1>
          <p className="text-muted-foreground text-sm">{orders?.length || 0} orders total</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            className="pl-10"
            value={search}
            onChange={e => setSearch(e.target.value)}
            data-testid="input-search-orders"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48" data-testid="select-status-filter">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {ORDER_STATUSES.map(s => (
              <SelectItem key={s} value={s} className="capitalize">{s.replace("_", " ")}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : !orders?.length ? (
        <div className="text-center py-20 text-muted-foreground">No orders found</div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <Card key={order.id} className="border-border/50" data-testid={`card-admin-order-${order.id}`}>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{order.restaurantName}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[order.status] || "bg-muted text-muted-foreground"}`}>
                        {order.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">Customer: {order.userName} • {order.userEmail}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.items.map((i: any) => `${i.name} x${i.quantity}`).join(", ")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      #{order.id.slice(-8).toUpperCase()} • {new Date(order.createdAt).toLocaleString()} •
                      <span className="capitalize ml-1">{order.paymentMethod === "cod" ? "COD" : "Online"}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <p className="font-bold text-lg">₹{order.total}</p>
                    <Select
                      value={order.status}
                      onValueChange={val => handleStatusChange(order.id, val)}
                      disabled={order.status === "delivered" || order.status === "cancelled"}
                    >
                      <SelectTrigger className="w-44" data-testid={`select-order-status-${order.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ORDER_STATUSES.map(s => (
                          <SelectItem key={s} value={s} className="capitalize">{s.replace("_", " ")}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
