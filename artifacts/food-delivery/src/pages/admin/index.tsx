import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetAdminStats, getGetAdminStatsQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { BarChart3, Package, Store, Users, ChevronRight, TrendingUp, DollarSign } from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useGetAdminStats({
    query: { queryKey: getGetAdminStatsQueryKey() }
  });

  if (user?.role !== "admin") {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-xl font-bold mb-2">Access Denied</p>
        <p className="text-muted-foreground">You need admin privileges to access this page</p>
        <Link href="/"><Button variant="outline" className="mt-4">Go Home</Button></Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm">Welcome back, {user.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {isLoading ? (
          [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)
        ) : (
          <>
            <Card className="border-border/50 bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <DollarSign className="h-8 w-8 text-primary mb-2" />
                <p className="text-2xl font-bold">₹{stats?.totalRevenue?.toLocaleString() || 0}</p>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4">
                <Package className="h-8 w-8 text-blue-600 mb-2" />
                <p className="text-2xl font-bold">{stats?.totalOrders || 0}</p>
                <p className="text-sm text-muted-foreground">Total Orders</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4">
                <Store className="h-8 w-8 text-green-600 mb-2" />
                <p className="text-2xl font-bold">{stats?.totalRestaurants || 0}</p>
                <p className="text-sm text-muted-foreground">Restaurants</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4">
                <Users className="h-8 w-8 text-purple-600 mb-2" />
                <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[
          { title: "Manage Orders", desc: "View and update all orders", href: "/admin/orders", icon: Package, color: "text-blue-600" },
          { title: "Restaurants", desc: "Add and manage restaurants", href: "/admin/restaurants", icon: Store, color: "text-green-600" },
          { title: "Revenue", desc: "Track revenue and analytics", href: "/admin/revenue", icon: BarChart3, color: "text-primary" },
        ].map(item => (
          <Link key={item.href} href={item.href}>
            <Card className="hover:shadow-md transition-all cursor-pointer border-border/50 hover:border-primary/20">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <item.icon className={`h-8 w-8 ${item.color}`} />
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {stats?.recentOrders?.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Recent Orders
            </CardTitle>
            <Link href="/admin/orders" className="text-primary text-sm hover:underline">View all</Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentOrders.slice(0, 5).map((order: any) => (
                <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-sm">{order.restaurantName}</p>
                    <p className="text-xs text-muted-foreground">{order.userName} • {new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">₹{order.total}</p>
                    <span className={`text-xs font-medium capitalize ${
                      order.status === "delivered" ? "text-green-600" :
                      order.status === "cancelled" ? "text-red-600" :
                      "text-amber-600"
                    }`}>{order.status.replace("_", " ")}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
