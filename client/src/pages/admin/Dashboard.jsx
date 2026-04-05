import AdminLayout from "./AdminLayout";
import { useOrders } from "@/hooks/use-orders";
import { useRestaurants } from "@/hooks/use-restaurants";
import { formatPrice } from "@/lib/format";
import { TrendingUp, Users, Store, Receipt } from "lucide-react";
function AdminDashboard() {
  const { data: orders = [] } = useOrders();
  const { data: restaurants = [] } = useRestaurants();
  const totalRevenue = orders.reduce((acc, order) => acc + order.totalPrice, 0);
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const stats = [
    { label: "Total Revenue", value: formatPrice(totalRevenue), icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Total Orders", value: orders.length, icon: Receipt, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Pending Orders", value: pendingOrders, icon: Users, color: "text-orange-500", bg: "bg-orange-500/10" },
    { label: "Restaurants", value: restaurants.length, icon: Store, color: "text-accent", bg: "bg-accent/10" }
  ];
  return <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-display font-black mb-8 text-foreground">Dashboard</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, i) => {
    const Icon = stat.icon;
    return <div key={i} className="bg-card p-6 rounded-3xl border-2 border-border shadow-sm flex items-center gap-4">
                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                  <Icon className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm font-bold text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-display font-black">{stat.value}</p>
                </div>
              </div>;
  })}
        </div>

        <div className="bg-card border-2 border-border rounded-3xl p-8 shadow-sm">
          <h2 className="text-2xl font-display font-bold mb-6">Recent Orders Overview</h2>
          <div className="space-y-4">
            {orders.slice(0, 5).map((order) => <div key={order.id} className="flex justify-between items-center p-4 border border-border rounded-xl hover:bg-muted/50 transition-colors">
                <div>
                  <p className="font-bold">Order #{order.id}</p>
                  <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase
                    ${order.status === "pending" ? "bg-orange-100 text-orange-700" : order.status === "delivered" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                    {order.status}
                  </span>
                  <span className="font-bold font-display">{formatPrice(order.totalPrice)}</span>
                </div>
              </div>)}
            {orders.length === 0 && <p className="text-muted-foreground text-center py-8">No orders to display.</p>}
          </div>
        </div>
      </div>
    </AdminLayout>;
}
export {
  AdminDashboard as default
};
