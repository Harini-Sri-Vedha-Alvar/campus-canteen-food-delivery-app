import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useListRestaurants, useUpdateMenuItem, useGetRestaurantMenu } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Edit, Save, X, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function AdminMenu() {
    const { user } = useAuth();
    const { data: restaurants, isLoading } = useListRestaurants();
    const updateMenuItem = useUpdateMenuItem();
    const [editingItem, setEditingItem] = useState(null);
    const [restaurantsWithMenus, setRestaurantsWithMenus] = useState([]);
    const [editForm, setEditForm] = useState({
        name: "",
        price: "",
        image: "",
        description: ""
    });

    // Fetch menus for all restaurants
    useEffect(() => {
        if (restaurants && restaurants.length > 0) {
            const fetchMenus = async () => {
                const updatedRestaurants = await Promise.all(
                    restaurants.map(async (restaurant) => {
                        try {
                            const menu = await fetch(`/api/restaurants/${restaurant.id}/menu`)
                                .then(res => res.json())
                                .catch(() => []);
                            return { ...restaurant, menu: menu || [] };
                        } catch (error) {
                            console.error(`Error fetching menu for ${restaurant.id}:`, error);
                            return { ...restaurant, menu: [] };
                        }
                    })
                );
                setRestaurantsWithMenus(updatedRestaurants);
            };
            fetchMenus();
        }
    }, [restaurants]);

    if (user?.role !== "admin") {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <p className="text-xl font-bold mb-2">Access Denied</p>
                <p className="text-muted-foreground">You need admin privileges to access this page</p>
                <Link href="/"><Button variant="outline" className="mt-4">Go Home</Button></Link>
            </div>
        );
    }

    const handleEdit = (restaurantId, item) => {
        setEditingItem({ restaurantId, itemId: item.id });
        setEditForm({
            name: item.name,
            price: item.price.toString(),
            image: item.image || "",
            description: item.description || ""
        });
    };

    const handleSave = async () => {
        if (!editingItem) return;

        try {
            await updateMenuItem.mutateAsync({
                restaurantId: editingItem.restaurantId,
                itemId: editingItem.itemId,
                data: {
                    name: editForm.name,
                    price: parseFloat(editForm.price),
                    image: editForm.image || null,
                    description: editForm.description || null
                }
            });

            toast.success("Menu item updated successfully!");
            setEditingItem(null);
            setEditForm({ name: "", price: "", image: "", description: "" });
        } catch (error) {
            toast.error("Failed to update menu item");
            console.error("Update error:", error);
        }
    };

    const handleCancel = () => {
        setEditingItem(null);
        setEditForm({ name: "", price: "", image: "", description: "" });
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/admin">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">Menu Management</h1>
                    <p className="text-muted-foreground text-sm">Edit menu items across all restaurants</p>
                </div>
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <Card key={i} className="animate-pulse">
                            <CardHeader>
                                <div className="h-6 bg-muted rounded w-1/3"></div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="h-4 bg-muted rounded w-full"></div>
                                    <div className="h-4 bg-muted rounded w-3/4"></div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="space-y-6">
                    {restaurantsWithMenus?.map(restaurant => (
                        <Card key={restaurant.id} className="border-border/50">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>{restaurant.name}</span>
                                    <span className="text-sm font-normal text-muted-foreground">
                                        {restaurant.menu?.length || 0} items
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {restaurant.menu?.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {restaurant.menu.map(item => (
                                            <Card key={item.id} className="border-border/30">
                                                <CardContent className="p-4">
                                                    {item.image && (
                                                        <img
                                                            src={item.image}
                                                            alt={item.name}
                                                            className="w-full h-32 object-cover rounded-lg mb-3"
                                                        />
                                                    )}
                                                    <div className="space-y-2">
                                                        <h4 className="font-semibold">{item.name}</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            ₹{item.price}
                                                        </p>
                                                        {item.description && (
                                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                                {item.description}
                                                            </p>
                                                        )}
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleEdit(restaurant.id, item)}
                                                            className="w-full mt-2"
                                                        >
                                                            <Edit className="h-3 w-3 mr-1" />
                                                            Edit
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground text-center py-8">
                                        No menu items found for this restaurant
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Edit Dialog */}
            <Dialog open={!!editingItem} onOpenChange={() => handleCancel()}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Menu Item</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={editForm.name}
                                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Item name"
                            />
                        </div>
                        <div>
                            <Label htmlFor="price">Price (₹)</Label>
                            <Input
                                id="price"
                                type="number"
                                step="0.01"
                                value={editForm.price}
                                onChange={(e) => setEditForm(prev => ({ ...prev, price: e.target.value }))}
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <Label htmlFor="image">Image URL</Label>
                            <Input
                                id="image"
                                value={editForm.image}
                                onChange={(e) => setEditForm(prev => ({ ...prev, image: e.target.value }))}
                                placeholder="https://..."
                            />
                        </div>
                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={editForm.description}
                                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Item description"
                                rows={3}
                            />
                        </div>
                        <div className="flex gap-2 pt-4">
                            <Button onClick={handleSave} disabled={updateMenuItem.isPending} className="flex-1">
                                <Save className="h-4 w-4 mr-2" />
                                {updateMenuItem.isPending ? "Saving..." : "Save Changes"}
                            </Button>
                            <Button variant="outline" onClick={handleCancel}>
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}