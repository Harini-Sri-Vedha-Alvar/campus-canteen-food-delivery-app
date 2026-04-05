import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import { useUpdateUserProfile, useGetUserCoins, getGetUserCoinsQueryKey, useListOrders, getListOrdersQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { User as UserIcon, Coins, Package, MapPin, Mail, Phone } from "lucide-react";
export default function Profile() {
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(user?.name || "");
    const [phone, setPhone] = useState(user?.phone || "");
    const [address, setAddress] = useState(user?.address || "");
    const { data: coinsData } = useGetUserCoins({ query: { enabled: !!user, queryKey: getGetUserCoinsQueryKey() } });
    const { data: orders, isLoading: ordersLoading } = useListOrders({ query: { enabled: !!user, queryKey: getListOrdersQueryKey() } });
    const updateProfileMutation = useUpdateUserProfile();
    const handleSave = async () => {
        try {
            await updateProfileMutation.mutateAsync({ data: { name, phone, address } });
            toast({ title: "Profile updated successfully" });
            setEditing(false);
        }
        catch (error) {
            toast({ title: "Failed to update profile", description: error.message, variant: "destructive" });
        }
    };
    if (!user) {
        return (<div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Please login to view your profile</p>
        <Link href="/login"><Button className="mt-4">Login</Button></Link>
      </div>);
    }
    const totalOrders = orders?.length || 0;
    const deliveredOrders = orders?.filter(o => o.status === "delivered").length || 0;
    return (<div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="border-border/50 bg-primary/5 border-primary/20">
          <CardContent className="p-4 text-center">
            <Coins className="h-8 w-8 text-amber-500 mx-auto mb-2"/>
            <p className="text-2xl font-bold text-amber-600">{coinsData?.coins || user.coins || 0}</p>
            <p className="text-sm text-muted-foreground">FoodRush Coins</p>
            <p className="text-xs text-amber-600 mt-1">Worth ₹{coinsData?.equivalentValue || 0}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <Package className="h-8 w-8 text-primary mx-auto mb-2"/>
            <p className="text-2xl font-bold">{totalOrders}</p>
            <p className="text-sm text-muted-foreground">Total Orders</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <UserIcon className="h-8 w-8 text-green-600 mx-auto mb-2"/>
            <p className="text-2xl font-bold text-green-600">{deliveredOrders}</p>
            <p className="text-sm text-muted-foreground">Delivered</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50 mb-6">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">Personal Information</CardTitle>
          {!editing ? (<Button variant="outline" size="sm" onClick={() => setEditing(true)} data-testid="button-edit-profile">
              Edit
            </Button>) : (<div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
              <Button size="sm" onClick={handleSave} disabled={updateProfileMutation.isPending} data-testid="button-save-profile">
                Save
              </Button>
            </div>)}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground shrink-0"/>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">Email</p>
              <p className="text-sm font-medium">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <UserIcon className="h-4 w-4 text-muted-foreground shrink-0"/>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">Name</p>
              {editing ? (<Input value={name} onChange={e => setName(e.target.value)} className="h-8 text-sm" data-testid="input-name"/>) : (<p className="text-sm font-medium">{user.name}</p>)}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-muted-foreground shrink-0"/>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">Phone</p>
              {editing ? (<Input value={phone} onChange={e => setPhone(e.target.value)} className="h-8 text-sm" placeholder="+91 XXXXX XXXXX" data-testid="input-phone"/>) : (<p className="text-sm font-medium">{user.phone || "Not provided"}</p>)}
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-1"/>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">Default Address</p>
              {editing ? (<Input value={address} onChange={e => setAddress(e.target.value)} className="h-8 text-sm" placeholder="Enter your address" data-testid="input-address"/>) : (<p className="text-sm font-medium">{user.address || "Not provided"}</p>)}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-4 w-4 shrink-0"/>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Role</p>
              <Badge variant={user.role === "admin" ? "default" : "secondary"} className="text-xs capitalize">{user.role}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Recent Orders</CardTitle>
            <Link href="/orders" className="text-primary text-sm hover:underline">View all</Link>
          </div>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (<div className="space-y-3">
              {[1, 2].map(i => <Skeleton key={i} className="h-16 rounded-lg"/>)}
            </div>) : orders?.length === 0 ? (<p className="text-sm text-muted-foreground text-center py-4">No orders yet</p>) : (<div className="space-y-3">
              {orders?.slice(0, 3).map(order => (<Link key={order.id} href={`/orders/${order.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                    <div>
                      <p className="font-medium text-sm">{order.restaurantName}</p>
                      <p className="text-xs text-muted-foreground">₹{order.total} • {new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs capitalize">{order.status.replace("_", " ")}</Badge>
                  </div>
                </Link>))}
            </div>)}
        </CardContent>
      </Card>
    </div>);
}
