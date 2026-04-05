import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useListRestaurants, useCreateRestaurant, useUpdateRestaurant, useDeleteRestaurant, useGetRestaurantMenu, useCreateMenuItem, useUpdateMenuItem, useDeleteMenuItem, getListRestaurantsQueryKey, getGetRestaurantMenuQueryKey, } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, Plus, Star, Edit2, Trash2, Utensils, CheckCircle2, XCircle, AlertTriangle, Leaf, Search, Store } from "lucide-react";
const EMPTY_RESTO = {
    name: "", description: "", cuisine: "", address: "", phone: "",
    image: "", deliveryFee: 30, deliveryTime: "30-40 mins", minOrder: 100,
};
const EMPTY_ITEM = { name: "", description: "", price: "", category: "", isVeg: false, image: "" };
function AvailabilityToggle({ isAvailable, onToggle, loading }) {
    return (<button onClick={onToggle} disabled={loading} title={isAvailable ? "Click to mark unavailable" : "Click to mark available"} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all border ${isAvailable
            ? "bg-green-50 text-green-700 border-green-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200 dark:bg-green-900/20 dark:text-green-400"
            : "bg-red-50 text-red-700 border-red-200 hover:bg-green-50 hover:text-green-700 hover:border-green-200 dark:bg-red-900/20 dark:text-red-400"}`}>
      {isAvailable ? <CheckCircle2 className="h-3 w-3"/> : <XCircle className="h-3 w-3"/>}
      {isAvailable ? "Available" : "Unavailable"}
    </button>);
}
function MenuPanel({ restaurant, onClose }) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [showAddItem, setShowAddItem] = useState(false);
    const [itemForm, setItemForm] = useState(EMPTY_ITEM);
    const [deletingId, setDeletingId] = useState(null);
    const [togglingId, setTogglingId] = useState(null);
    const [searchQ, setSearchQ] = useState("");
    const { data: menuItems, isLoading } = useGetRestaurantMenu(restaurant.id, undefined, { query: { queryKey: getGetRestaurantMenuQueryKey(restaurant.id) } });
    const createMutation = useCreateMenuItem();
    const updateMutation = useUpdateMenuItem();
    const deleteMutation = useDeleteMenuItem();
    const handleAddItem = async () => {
        if (!itemForm.name || !itemForm.price || !itemForm.category) {
            toast({ title: "Name, price & category are required", variant: "destructive" });
            return;
        }
        try {
            await createMutation.mutateAsync({
                data: {
                    ...itemForm,
                    price: Number(itemForm.price),
                    restaurantId: restaurant.id,
                    restaurantName: restaurant.name,
                    isAvailable: true,
                }
            });
            queryClient.invalidateQueries({ queryKey: getGetRestaurantMenuQueryKey(restaurant.id) });
            setItemForm(EMPTY_ITEM);
            setShowAddItem(false);
            toast({ title: `"${itemForm.name}" added to menu` });
        }
        catch (e) {
            toast({ title: "Failed to add item", description: e.message, variant: "destructive" });
        }
    };
    const handleToggle = async (item) => {
        setTogglingId(item.id);
        try {
            await updateMutation.mutateAsync({ id: item.id, data: { ...item, isAvailable: !item.isAvailable } });
            queryClient.invalidateQueries({ queryKey: getGetRestaurantMenuQueryKey(restaurant.id) });
            toast({ title: `"${item.name}" marked ${!item.isAvailable ? "available" : "unavailable"}` });
        }
        catch (e) {
            toast({ title: "Update failed", description: e.message, variant: "destructive" });
        }
        finally {
            setTogglingId(null);
        }
    };
    const handleDeleteItem = async (item) => {
        setDeletingId(item.id);
        try {
            await deleteMutation.mutateAsync({ id: item.id });
            queryClient.invalidateQueries({ queryKey: getGetRestaurantMenuQueryKey(restaurant.id) });
            toast({ title: `"${item.name}" removed` });
        }
        catch (e) {
            toast({ title: "Delete failed", description: e.message, variant: "destructive" });
        }
        finally {
            setDeletingId(null);
        }
    };
    const filtered = (menuItems || []).filter(i => i.name.toLowerCase().includes(searchQ.toLowerCase()) ||
        i.category.toLowerCase().includes(searchQ.toLowerCase()));
    const grouped = filtered.reduce((acc, item) => {
        const cat = item.category || "Other";
        if (!acc[cat])
            acc[cat] = [];
        acc[cat].push(item);
        return acc;
    }, {});
    return (<DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Utensils className="h-5 w-5 text-primary"/>
          {restaurant.name}
          <Badge variant="secondary">{menuItems?.length || 0} items</Badge>
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
            <Input placeholder="Search items..." className="pl-9 h-9 text-sm" value={searchQ} onChange={e => setSearchQ(e.target.value)}/>
          </div>
          <Button size="sm" className="h-9 shrink-0" onClick={() => setShowAddItem(v => !v)}>
            <Plus className="h-3.5 w-3.5 mr-1"/> Add Item
          </Button>
        </div>

        {showAddItem && (<div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-3">
            <p className="font-semibold text-sm text-primary flex items-center gap-1.5"><Plus className="h-4 w-4"/> New Menu Item</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="col-span-2">
                <label className="text-xs text-muted-foreground mb-1 block">Item Name *</label>
                <Input className="h-9 text-sm" placeholder="e.g. Veg Noodles" value={itemForm.name} onChange={e => setItemForm(f => ({ ...f, name: e.target.value }))}/>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Category *</label>
                <Input className="h-9 text-sm" placeholder="e.g. Snacks" value={itemForm.category} onChange={e => setItemForm(f => ({ ...f, category: e.target.value }))}/>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Price (₹) *</label>
                <Input className="h-9 text-sm" type="number" placeholder="50" value={itemForm.price} onChange={e => setItemForm(f => ({ ...f, price: e.target.value }))}/>
              </div>
              <div className="col-span-2">
                <label className="text-xs text-muted-foreground mb-1 block">Description</label>
                <Input className="h-9 text-sm" placeholder="Short description..." value={itemForm.description} onChange={e => setItemForm(f => ({ ...f, description: e.target.value }))}/>
              </div>
              <div className="col-span-2">
                <label className="text-xs text-muted-foreground mb-1 block">Image URL (optional)</label>
                <Input className="h-9 text-sm" placeholder="https://..." value={itemForm.image} onChange={e => setItemForm(f => ({ ...f, image: e.target.value }))}/>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={itemForm.isVeg} onChange={e => setItemForm(f => ({ ...f, isVeg: e.target.checked }))} className="accent-green-600 h-4 w-4"/>
                <span className="text-sm flex items-center gap-1 text-green-700 dark:text-green-400 font-medium"><Leaf className="h-3.5 w-3.5"/> Vegetarian</span>
              </label>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => { setShowAddItem(false); setItemForm(EMPTY_ITEM); }}>Cancel</Button>
                <Button size="sm" onClick={handleAddItem} disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Adding..." : "Add to Menu"}
                </Button>
              </div>
            </div>
          </div>)}

        {isLoading ? (<div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-xl"/>)}</div>) : !menuItems?.length ? (<div className="text-center py-10 text-muted-foreground">
            <Utensils className="h-10 w-10 mx-auto mb-3 opacity-30"/>
            <p className="font-medium">No menu items yet</p>
            <p className="text-sm">Click "Add Item" to create your first dish</p>
          </div>) : !filtered.length ? (<p className="text-center py-6 text-sm text-muted-foreground">No items match your search</p>) : (<div className="space-y-5">
            {Object.entries(grouped).map(([category, items]) => (<div key={category}>
                <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 px-1 flex items-center gap-2">
                  {category}
                  <span className="h-px flex-1 bg-border"/>
                </p>
                <div className="space-y-2">
                  {items.map(item => (<div key={item.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${item.isAvailable
                        ? "bg-card border-border/50 hover:border-border"
                        : "bg-muted/40 border-dashed border-border/40 opacity-75"}`}>
                      {item.image ? (<div className="w-11 h-11 rounded-lg overflow-hidden bg-muted shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover"/>
                        </div>) : (<div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 text-xl ${item.isVeg ? "bg-green-50 dark:bg-green-900/20" : "bg-orange-50 dark:bg-orange-900/20"}`}>
                          {item.isVeg ? "🥗" : "🍗"}
                        </div>)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {item.isVeg && (<div className="flex items-center shrink-0">
                              <div className="w-3.5 h-3.5 rounded-sm border-2 border-green-600 flex items-center justify-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-600"/>
                              </div>
                            </div>)}
                          <p className="font-medium text-sm truncate">{item.name}</p>
                          {item.isBestseller && <Badge className="text-[9px] px-1.5 py-0 h-4 bg-amber-500 hover:bg-amber-500">★ BEST</Badge>}
                          {!item.isAvailable && <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 text-muted-foreground border-dashed">OUT OF STOCK</Badge>}
                        </div>
                        <p className="text-primary font-bold text-sm mt-0.5">₹{item.price}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <AvailabilityToggle isAvailable={item.isAvailable} onToggle={() => handleToggle(item)} loading={togglingId === item.id}/>
                        <button onClick={() => handleDeleteItem(item)} disabled={deletingId === item.id} className="h-7 w-7 rounded-lg flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors" title="Remove item">
                          <Trash2 className="h-3.5 w-3.5"/>
                        </button>
                      </div>
                    </div>))}
                </div>
              </div>))}
          </div>)}
      </div>
    </DialogContent>);
}
export default function AdminRestaurants() {
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [showDialog, setShowDialog] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(EMPTY_RESTO);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [menuPanel, setMenuPanel] = useState(null);
    const [search, setSearch] = useState("");
    const { data: restaurants, isLoading } = useListRestaurants(undefined, {
        query: { queryKey: getListRestaurantsQueryKey() }
    });
    const createMutation = useCreateRestaurant();
    const updateMutation = useUpdateRestaurant();
    const deleteMutation = useDeleteRestaurant();
    const handleOpen = (restaurant = null) => {
        if (restaurant) {
            setEditingId(restaurant.id);
            setForm({
                name: restaurant.name, description: restaurant.description || "",
                cuisine: restaurant.cuisine, address: restaurant.address || "",
                phone: restaurant.phone || "", image: restaurant.image || "",
                deliveryFee: restaurant.deliveryFee, deliveryTime: restaurant.deliveryTime,
                minOrder: restaurant.minOrder,
            });
        }
        else {
            setEditingId(null);
            setForm(EMPTY_RESTO);
        }
        setShowDialog(true);
    };
    const handleSave = async () => {
        if (!form.name || !form.cuisine || !form.address) {
            toast({ title: "Name, cuisine & address are required", variant: "destructive" });
            return;
        }
        try {
            if (editingId) {
                await updateMutation.mutateAsync({ id: editingId, data: form });
                toast({ title: "Restaurant updated" });
            }
            else {
                await createMutation.mutateAsync({ data: form });
                toast({ title: `"${form.name}" added!` });
            }
            queryClient.invalidateQueries({ queryKey: getListRestaurantsQueryKey() });
            setShowDialog(false);
        }
        catch (e) {
            toast({ title: "Failed to save", description: e.message, variant: "destructive" });
        }
    };
    const handleDelete = async () => {
        if (!deleteConfirm)
            return;
        try {
            await deleteMutation.mutateAsync({ id: deleteConfirm.id });
            queryClient.invalidateQueries({ queryKey: getListRestaurantsQueryKey() });
            toast({ title: `"${deleteConfirm.name}" removed` });
            setDeleteConfirm(null);
        }
        catch (e) {
            toast({ title: "Failed to delete", description: e.message, variant: "destructive" });
        }
    };
    const handleToggleOpen = async (restaurant) => {
        try {
            await updateMutation.mutateAsync({ id: restaurant.id, data: { isOpen: !restaurant.isOpen } });
            queryClient.invalidateQueries({ queryKey: getListRestaurantsQueryKey() });
            toast({ title: `"${restaurant.name}" is now ${!restaurant.isOpen ? "open" : "closed"}` });
        }
        catch (e) {
            toast({ title: "Failed to update", description: e.message, variant: "destructive" });
        }
    };
    const filtered = (restaurants || []).filter(r => r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.cuisine.toLowerCase().includes(search.toLowerCase()));
    if (user?.role !== "admin")
        return (<div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Access Denied</div>);
    return (<div className="container mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Link href="/admin">
          <Button variant="ghost" size="icon"><ChevronLeft className="h-5 w-5"/></Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold">Manage Restaurants</h1>
          <p className="text-muted-foreground text-sm">{restaurants?.length || 0} restaurants · tap "Manage Menu" to add or remove items</p>
        </div>
        <Button onClick={() => handleOpen()} className="shrink-0">
          <Plus className="h-4 w-4 mr-2"/> Add Restaurant
        </Button>
      </div>

      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
        <Input placeholder="Search restaurants or cuisines..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)}/>
      </div>

      {isLoading ? (<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-48 rounded-2xl"/>)}
        </div>) : !filtered.length ? (<div className="text-center py-20 text-muted-foreground">
          <Store className="h-12 w-12 mx-auto mb-3 opacity-30"/>
          <p className="font-medium">No restaurants found</p>
          {search && <p className="text-sm">Try a different search term</p>}
        </div>) : (<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(resto => (<Card key={resto.id} className={`border-border/50 overflow-hidden hover:shadow-lg transition-all group ${!resto.isOpen ? "opacity-70" : ""}`}>
              <div className="relative h-32 bg-gradient-to-br from-primary/10 to-secondary/10 overflow-hidden">
                {resto.image ? (<img src={resto.image} alt={resto.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>) : (<div className="w-full h-full flex items-center justify-center text-5xl">🏪</div>)}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"/>
                <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between">
                  <div>
                    <p className="font-bold text-white leading-tight">{resto.name}</p>
                    <p className="text-white/70 text-xs">{resto.cuisine}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-1 bg-black/30 backdrop-blur-sm rounded-lg px-2 py-0.5">
                      <Star className="h-3 w-3 text-amber-400 fill-amber-400"/>
                      <span className="text-white text-xs font-bold">{resto.rating?.toFixed(1) || "4.0"}</span>
                    </div>
                    <button onClick={() => handleToggleOpen(resto)} title={resto.isOpen ? "Click to close" : "Click to open"} className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-lg backdrop-blur-sm transition-all ${resto.isOpen ? "bg-green-500/80 text-white hover:bg-red-500/80" : "bg-red-500/80 text-white hover:bg-green-500/80"}`}>
                      {resto.isOpen ? <><CheckCircle2 className="h-3 w-3"/> Open</> : <><XCircle className="h-3 w-3"/> Closed</>}
                    </button>
                  </div>
                </div>
              </div>

              <CardContent className="p-3 space-y-2.5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                  <span>₹{resto.deliveryFee} delivery</span>
                  <span className="text-border">|</span>
                  <span>{resto.deliveryTime}</span>
                  <span className="text-border">|</span>
                  <span>Min ₹{resto.minOrder}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 h-8 text-xs border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground" onClick={() => setMenuPanel(resto)}>
                    <Utensils className="h-3.5 w-3.5 mr-1.5"/> Manage Menu
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-border/50 hover:border-primary/40" onClick={() => handleOpen(resto)} title="Edit restaurant">
                    <Edit2 className="h-3.5 w-3.5"/>
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground hover:border-destructive" onClick={() => setDeleteConfirm(resto)} title="Delete restaurant">
                    <Trash2 className="h-3.5 w-3.5"/>
                  </Button>
                </div>
              </CardContent>
            </Card>))}
        </div>)}

      {/* Add / Edit Restaurant Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Store className="h-5 w-5 text-primary"/>
              {editingId ? "Edit Restaurant" : "Add New Restaurant"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-1">
            {[
            { label: "Restaurant Name *", field: "name", placeholder: "e.g. Ball Canteen", span: 2 },
            { label: "Cuisine *", field: "cuisine", placeholder: "e.g. South Indian" },
            { label: "Delivery Time", field: "deliveryTime", placeholder: "30-40 mins" },
            { label: "Delivery Fee (₹)", field: "deliveryFee", placeholder: "30", num: true },
            { label: "Min Order (₹)", field: "minOrder", placeholder: "100", num: true },
            { label: "Phone", field: "phone", placeholder: "+91 98765 43210" },
            { label: "Address *", field: "address", placeholder: "Full address", span: 2 },
            { label: "Image URL", field: "image", placeholder: "https://...", span: 2 },
            { label: "Description", field: "description", placeholder: "Short description...", span: 2 },
        ].map(({ label, field, placeholder, num, span }) => (<div key={field} className={span === 2 ? "col-span-2" : ""}>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">{label}</label>
                <Input type={num ? "number" : "text"} placeholder={placeholder} className="h-9 text-sm" value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: num ? Number(e.target.value) : e.target.value }))}/>
              </div>))}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
              {(createMutation.isPending || updateMutation.isPending) ? "Saving..." : editingId ? "Save Changes" : "Add Restaurant"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5"/> Remove Restaurant?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will permanently remove <strong className="text-foreground">"{deleteConfirm?.name}"</strong> and all its menu items. This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Removing..." : "Remove Restaurant"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Menu Management Panel */}
      <Dialog open={!!menuPanel} onOpenChange={() => setMenuPanel(null)}>
        {menuPanel && <MenuPanel restaurant={menuPanel} onClose={() => setMenuPanel(null)}/>}
      </Dialog>
    </div>);
}
