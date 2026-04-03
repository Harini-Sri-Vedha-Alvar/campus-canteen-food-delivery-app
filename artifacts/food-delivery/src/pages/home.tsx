import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useListRestaurants, getListRestaurantsQueryKey } from "@workspace/api-client-react";
import { Search, Clock, Star, ChevronRight, Flame, Tag } from "lucide-react";

const CUISINES = ["All", "Indian", "Italian", "American", "South Indian", "Chinese", "Healthy"];

export default function Home() {
  const [search, setSearch] = useState("");
  const [cuisine, setCuisine] = useState("");

  const params: Record<string, string> = {};
  if (search) params.search = search;
  if (cuisine && cuisine !== "All") params.cuisine = cuisine;

  const { data: restaurants, isLoading } = useListRestaurants(
    Object.keys(params).length > 0 ? params : undefined,
    { query: { queryKey: getListRestaurantsQueryKey(Object.keys(params).length > 0 ? params : undefined) } }
  );

  const featured = restaurants?.filter(r => r.featured) || [];
  const all = restaurants || [];

  return (
    <div className="w-full">
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-accent/5 to-background py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 text-sm px-4 py-1">
            Fast Delivery in 30 mins
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            Hungry? We've got you <span className="text-primary">covered.</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Order from top restaurants near you. Fresh food, fast delivery, amazing prices.
          </p>
          <div className="flex max-w-md mx-auto gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search restaurants or dishes..."
                className="pl-10 h-12 text-base"
                value={search}
                onChange={e => setSearch(e.target.value)}
                data-testid="input-search"
              />
            </div>
            <Link href="/restaurants">
              <Button size="lg" className="h-12 px-6" data-testid="button-explore">
                Explore
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {CUISINES.map(c => (
            <button
              key={c}
              onClick={() => setCuisine(c === "All" ? "" : c)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                (cuisine === c || (c === "All" && !cuisine))
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-foreground hover:border-primary/50"
              }`}
              data-testid={`filter-cuisine-${c}`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {featured.length > 0 && !search && !cuisine && (
        <section className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Featured Restaurants</h2>
            </div>
            <Link href="/restaurants" className="text-primary text-sm font-medium flex items-center gap-1 hover:underline">
              See all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.slice(0, 3).map(r => (
              <RestaurantCard key={r.id} restaurant={r} />
            ))}
          </div>
        </section>
      )}

      <section className="container mx-auto px-4 py-6 pb-12">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-bold">
            {search || cuisine ? "Search Results" : "All Restaurants"}
          </h2>
          {!isLoading && (
            <Badge variant="outline" className="text-muted-foreground">{all.length} places</Badge>
          )}
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        ) : all.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-40" />
            <p className="text-lg font-medium">No restaurants found</p>
            <p className="text-sm">Try a different search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {all.map(r => (
              <RestaurantCard key={r.id} restaurant={r} />
            ))}
          </div>
        )}
      </section>

      <section className="bg-primary/5 border-y border-primary/10 py-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-6">
            <Tag className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Available Coupons</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { code: "WELCOME50", desc: "50% off up to ₹100 on first order", min: "₹200 min" },
              { code: "FLAT40", desc: "Flat ₹40 off on orders above ₹300", min: "₹300 min" },
              { code: "NEWUSER", desc: "30% off up to ₹80 for new users", min: "₹150 min" },
              { code: "WEEKEND20", desc: "20% off every weekend", min: "₹200 min" },
            ].map(coupon => (
              <div key={coupon.code} className="bg-card border border-dashed border-primary/40 rounded-xl p-4">
                <div className="font-mono font-bold text-primary text-lg">{coupon.code}</div>
                <div className="text-sm text-muted-foreground mt-1">{coupon.desc}</div>
                <div className="text-xs text-muted-foreground mt-2 font-medium">{coupon.min}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function RestaurantCard({ restaurant }: { restaurant: any }) {
  return (
    <Link href={`/restaurant/${restaurant.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group border-border/50 hover:border-primary/30" data-testid={`card-restaurant-${restaurant.id}`}>
        <div className="relative h-44 overflow-hidden bg-muted">
          {restaurant.image ? (
            <img
              src={restaurant.image}
              alt={restaurant.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/10">
              <span className="text-4xl">{restaurant.cuisine?.[0]}</span>
            </div>
          )}
          {!restaurant.isOpen && (
            <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
              <Badge variant="outline" className="text-base font-semibold bg-background">Closed</Badge>
            </div>
          )}
          {restaurant.featured && (
            <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs">
              Featured
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-base truncate">{restaurant.name}</h3>
            <div className="flex items-center gap-1 shrink-0">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="text-sm font-medium">{restaurant.rating}</span>
            </div>
          </div>
          <p className="text-muted-foreground text-sm mt-1">{restaurant.cuisine}</p>
          <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{restaurant.deliveryTime}</span>
            </div>
            <span>•</span>
            <span>₹{restaurant.deliveryFee} delivery</span>
            <span>•</span>
            <span>₹{restaurant.minOrder} min</span>
          </div>
          {restaurant.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {restaurant.tags.slice(0, 3).map((tag: string) => (
                <Badge key={tag} variant="secondary" className="text-xs px-2 py-0 capitalize">{tag}</Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
