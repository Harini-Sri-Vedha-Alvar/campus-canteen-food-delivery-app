import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetRevenue, getGetRevenueQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { ChevronLeft, TrendingUp, Package, DollarSign } from "lucide-react";

export default function AdminRevenue() {
  const { user } = useAuth();
  const { data: revenue, isLoading } = useGetRevenue({
    query: { queryKey: getGetRevenueQueryKey() }
  });

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
          <h1 className="text-2xl font-bold">Revenue Analytics</h1>
          <p className="text-muted-foreground text-sm">Financial overview and trends</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">{[1,2,3].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
          <Skeleton className="h-96 rounded-xl" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-5">
                <DollarSign className="h-8 w-8 text-primary mb-2" />
                <p className="text-3xl font-bold">₹{revenue?.totalRevenue?.toLocaleString() || 0}</p>
                <p className="text-muted-foreground text-sm">Total Revenue</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-5">
                <Package className="h-8 w-8 text-blue-600 mb-2" />
                <p className="text-3xl font-bold">{revenue?.totalOrders || 0}</p>
                <p className="text-muted-foreground text-sm">Total Orders</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-5">
                <TrendingUp className="h-8 w-8 text-green-600 mb-2" />
                <p className="text-3xl font-bold">₹{revenue?.averageOrderValue?.toFixed(0) || 0}</p>
                <p className="text-muted-foreground text-sm">Avg Order Value</p>
              </CardContent>
            </Card>
          </div>

          {(revenue?.revenueByDay || revenue?.dailyRevenue)?.length > 0 && (
            <Card className="border-border/50 mb-6">
              <CardHeader><CardTitle className="text-base">Daily Revenue (Last 7 Days)</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-end gap-1 h-48 overflow-x-auto pb-2">
                  {(revenue.revenueByDay || revenue.dailyRevenue).map(day => {
                    const all = revenue.revenueByDay || revenue.dailyRevenue;
                    const maxRev = Math.max(...all.map(d => d.revenue));
                    const heightPct = maxRev > 0 ? (day.revenue / maxRev) * 100 : 0;
                    return (
                      <div key={day.date} className="flex flex-col items-center gap-1 flex-1 min-w-8" title={`₹${day.revenue}`}>
                        <span className="text-xs text-muted-foreground">₹{day.revenue > 999 ? `${(day.revenue/1000).toFixed(1)}k` : day.revenue}</span>
                        <div className="w-full bg-primary/80 rounded-t-sm min-h-1 hover:bg-primary transition-colors" style={{ height: `${Math.max(4, heightPct)}%` }} />
                        <span className="text-[10px] text-muted-foreground">{day.date?.slice(5)}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {revenue?.topRestaurants?.length > 0 && (
            <Card className="border-border/50">
              <CardHeader><CardTitle className="text-base">Top Restaurants by Revenue</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {revenue.topRestaurants.map((r, idx) => {
                    const maxRev = Math.max(...revenue.topRestaurants.map(x => x.revenue));
                    const pct = maxRev > 0 ? (r.revenue / maxRev) * 100 : 0;
                    return (
                      <div key={r.restaurantId || idx} className="flex items-center gap-3">
                        <span className="text-sm font-bold text-muted-foreground w-5">{idx + 1}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-sm">{r.name || r.restaurantName}</p>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span>{r.orders} orders</span>
                              <span className="font-bold text-foreground">₹{r.revenue?.toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
