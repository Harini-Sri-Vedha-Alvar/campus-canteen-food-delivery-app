import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useListRestaurants, useCreateRestaurant, useUpdateRestaurant, getListRestaurantsQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, Plus, Star, Edit2 } from "lucide-react";

const EMPTY_FORM = {
  name: "", description: "", cuisine: "", address: "", phone: "",
  image: "", deliveryFee: 30, deliveryTime: "30-40 mins", minOrder: 100,
};

export default function AdminRestaurants() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<typeof EMPTY_FORM>(EMPTY_FORM);

  const { data: restaurants, isLoading } = useListRestaurants(undefined, {
    query: { queryKey: getListRestaurantsQueryKey() }
  });
  const createMutation = useCreateRestaurant();
  const updateMutation = useUpdateRestaurant();

  const handleOpen = (restaurant?: any) => {
    if (restaurant) {
      setEditingId(restaurant.id);
      setForm({
        name: restaurant.name,
        description: restaurant.description || "",
        cuisine: restaurant.cuisine,
        address: restaurant.address,
        phone: restaurant.phone || "",
        image: restaurant.image || "",
        deliveryFee: restaurant.deliveryFee,
        deliveryTime: restaurant.deliveryTime,
        minOrder: restaurant.minOrder,
      });
    } else {
      setEditingId(null);
      setForm(EMPTY_FORM);
    }
    setShowDialog(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ restaurantId: editingId, data: form });
        toast({ title: "Restaurant updated" });
      } else {
        await createMutation.mutateAsync({ data: form });
        toast({ title: "Restaurant created" });
      }
      queryClient.invalidateQueries({ queryKey: getListRestaurantsQueryKey() });
      setShowDialog(false);
    } catch (error: any) {
      toast({ title: "Failed to save restaurant", description: error.message, variant: "destructive" });
    }
  };

  if (user?.role !== "admin") {
    return <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Access Denied</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin">
            <Button variant="ghost" size="icon"><ChevronLeft className="h-5 w-5" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Restaurants</h1>
            <p className="text-muted-foreground text-sm">{restaurants?.length || 0} restaurants</p>
          </div>
        </div>
        <Button onClick={() => handleOpen()} data-testid="button-add-restaurant">
          <Plus className="h-4 w-4 mr-2" /> Add Restaurant
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-36 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {restaurants?.map(r => (
            <Card key={r.id} className="border-border/50" data-testid={`card-admin-restaurant-${r.id}`}>
              <CardContent className="p-4 flex items-start gap-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
                  {r.image ? (
                    <img src={r.image} alt={r.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center text-2xl">
                      {r.cuisine?.[0]}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold">{r.name}</h3>
                      <p className="text-sm text-muted-foreground">{r.cuisine}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleOpen(r)} data-testid={`button-edit-restaurant-${r.id}`}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />{r.rating}
                    </span>
                    <span>₹{r.deliveryFee} delivery</span>
                    <Badge variant={r.isOpen ? "default" : "secondary"} className="text-xs">
                      {r.isOpen ? "Open" : "Closed"}
                    </Badge>
                    {r.featured && <Badge className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Featured</Badge>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" data-testid="dialog-restaurant-form">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Restaurant" : "Add Restaurant"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Name</label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} data-testid="input-restaurant-name" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Description</label>
              <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Cuisine</label>
              <Input value={form.cuisine} onChange={e => setForm(f => ({ ...f, cuisine: e.target.value }))} placeholder="e.g. Indian, Italian" data-testid="input-restaurant-cuisine" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Address</label>
              <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Phone</label>
              <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Image URL</label>
              <Input value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-sm font-medium mb-1 block">Delivery Fee</label>
                <Input type="number" value={form.deliveryFee} onChange={e => setForm(f => ({ ...f, deliveryFee: +e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Min Order</label>
                <Input type="number" value={form.minOrder} onChange={e => setForm(f => ({ ...f, minOrder: +e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Delivery Time</label>
                <Input value={form.deliveryTime} onChange={e => setForm(f => ({ ...f, deliveryTime: e.target.value }))} placeholder="30-40 mins" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-save-restaurant-form">
              {editingId ? "Save Changes" : "Create Restaurant"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
