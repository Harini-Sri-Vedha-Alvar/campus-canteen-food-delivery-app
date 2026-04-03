import { useState } from "react";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useGetRestaurant, useGetRestaurantMenu, useListReviews, useAddToCart, getGetCartQueryKey, getGetRestaurantQueryKey, getGetRestaurantMenuQueryKey, getListReviewsQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Star, Clock, MapPin, Plus, Minus, Leaf, Award } from "lucide-react";

export default function RestaurantPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [cartItems, setCartItems] = useState<Record<string, number>>({});

  const { data: restaurant, isLoading: restaurantLoading } = useGetRestaurant(id!, {
    query: { enabled: !!id, queryKey: getGetRestaurantQueryKey(id!) }
  });

  const { data: menu, isLoading: menuLoading } = useGetRestaurantMenu(id!, undefined, {
    query: { enabled: !!id, queryKey: getGetRestaurantMenuQueryKey(id!, undefined) }
  });

  const { data: reviews } = useListReviews({ restaurantId: id }, {
    query: { enabled: !!id, queryKey: getListReviewsQueryKey({ restaurantId: id }) }
  });

  const addToCartMutation = useAddToCart();

  const categories = menu ? [...new Set(menu.map(item => item.category))] : [];

  const filteredMenu = activeCategory
    ? menu?.filter(item => item.category === activeCategory)
    : menu;

  const handleAddToCart = async (menuItemId: string, delta: number) => {
    if (!user) {
      toast({ title: "Please login to add items to cart", variant: "destructive" });
      return;
    }
    const newQty = (cartItems[menuItemId] || 0) + delta;
    setCartItems(prev => ({ ...prev, [menuItemId]: Math.max(0, newQty) }));
    try {
      await addToCartMutation.mutateAsync({ data: { menuItemId, quantity: delta } });
      queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
    } catch (error: any) {
      toast({ title: "Failed to update cart", description: error.message, variant: "destructive" });
      setCartItems(prev => ({ ...prev, [menuItemId]: Math.max(0, (prev[menuItemId] || 0) - delta) }));
    }
  };

  if (restaurantLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-64 w-full rounded-xl mb-6" />
        <Skeleton className="h-8 w-1/3 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Restaurant not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="relative h-56 md:h-72 rounded-2xl overflow-hidden mb-6 bg-muted">
        {restaurant.image ? (
          <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/10 text-6xl">
            {restaurant.cuisine?.[0]}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h1 className="text-3xl font-bold">{restaurant.name}</h1>
          <p className="text-white/80 mt-1">{restaurant.description}</p>
          <div className="flex flex-wrap gap-4 mt-3 text-sm">
            <span className="flex items-center gap-1.5">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              {restaurant.rating} ({restaurant.totalRatings} ratings)
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {restaurant.deliveryTime}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {restaurant.address}
            </span>
          </div>
        </div>
        {!restaurant.isOpen && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
            <Badge className="text-xl px-6 py-3 bg-destructive text-destructive-foreground">Currently Closed</Badge>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-56 shrink-0">
          <div className="sticky top-20">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Menu Categories</p>
            <div className="space-y-1">
              <button
                onClick={() => setActiveCategory("")}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${!activeCategory ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted"}`}
              >
                All Items
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${activeCategory === cat ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted"}`}
                  data-testid={`category-${cat}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div className="flex-1 space-y-3">
          {menuLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
            </div>
          ) : filteredMenu?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No items in this category</div>
          ) : (
            filteredMenu?.map(item => {
              const qty = cartItems[item.id] || 0;
              return (
                <Card key={item.id} className="border-border/50 hover:border-primary/20 transition-colors" data-testid={`card-menuitem-${item.id}`}>
                  <CardContent className="p-4 flex gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-2 mb-1">
                        {item.isVeg ? (
                          <span className="mt-0.5 shrink-0 h-4 w-4 rounded border-2 border-green-600 flex items-center justify-center">
                            <span className="h-2 w-2 rounded-full bg-green-600"></span>
                          </span>
                        ) : (
                          <span className="mt-0.5 shrink-0 h-4 w-4 rounded border-2 border-red-600 flex items-center justify-center">
                            <span className="h-2 w-2 rounded-full bg-red-600"></span>
                          </span>
                        )}
                        <h3 className="font-semibold text-base leading-tight">{item.name}</h3>
                        {item.isBestseller && (
                          <Badge className="shrink-0 text-xs bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800 gap-1">
                            <Award className="h-3 w-3" /> Bestseller
                          </Badge>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-sm text-muted-foreground mb-2 ml-6">{item.description}</p>
                      )}
                      <div className="flex items-center gap-3 ml-6">
                        <span className="font-bold text-base">₹{item.price}</span>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          {item.rating}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      {item.image && (
                        <div className="w-24 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      {!item.isAvailable ? (
                        <Badge variant="outline" className="text-xs">Not Available</Badge>
                      ) : qty === 0 ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-24 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                          onClick={() => handleAddToCart(item.id, 1)}
                          data-testid={`button-add-${item.id}`}
                        >
                          <Plus className="h-4 w-4 mr-1" /> Add
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2 bg-primary rounded-lg overflow-hidden">
                          <button
                            className="h-8 w-8 flex items-center justify-center text-primary-foreground hover:bg-primary/80 transition-colors"
                            onClick={() => handleAddToCart(item.id, -1)}
                            data-testid={`button-decrease-${item.id}`}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="text-primary-foreground font-bold min-w-[1.5rem] text-center">{qty}</span>
                          <button
                            className="h-8 w-8 flex items-center justify-center text-primary-foreground hover:bg-primary/80 transition-colors"
                            onClick={() => handleAddToCart(item.id, 1)}
                            data-testid={`button-increase-${item.id}`}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}

          {reviews && reviews.length > 0 && (
            <div className="mt-8">
              <Separator className="mb-6" />
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                Customer Reviews
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reviews.slice(0, 6).map(review => (
                  <Card key={review.id} className="border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-sm">{review.userName}</span>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`h-3.5 w-3.5 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-muted"}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                      <p className="text-xs text-muted-foreground mt-2">{new Date(review.createdAt).toLocaleDateString()}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
