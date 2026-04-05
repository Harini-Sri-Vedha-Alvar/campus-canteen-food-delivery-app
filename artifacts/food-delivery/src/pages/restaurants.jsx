import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useListRestaurants, getListRestaurantsQueryKey } from "@workspace/api-client-react";
import { Search, Star, Clock, SlidersHorizontal } from "lucide-react";
const CUISINES = ["All", "Indian", "Italian", "American", "South Indian", "Chinese", "Healthy"];
const SORT_OPTIONS = [
    { value: "default", label: "Recommended" },
    { value: "rating", label: "Rating (High to Low)" },
    { value: "deliveryFee", label: "Delivery Fee (Low)" },
    { value: "deliveryTime", label: "Delivery Time (Fast)" },
];
export default function Restaurants() {
    const [search, setSearch] = useState("");
    const [cuisine, setCuisine] = useState("");
    const [sort, setSort] = useState("default");
    const [minRating, setMinRating] = useState("");
    const params = {};
    if (search)
        params.search = search;
    if (cuisine && cuisine !== "All")
        params.cuisine = cuisine;
    if (sort !== "default")
        params.sort = sort;
    if (minRating)
        params.rating = minRating;
    const { data: restaurants, isLoading } = useListRestaurants(Object.keys(params).length > 0 ? params : undefined, { query: { queryKey: getListRestaurantsQueryKey(Object.keys(params).length > 0 ? params : undefined) } });
    return (<div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Restaurants</h1>
      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="lg:w-64 shrink-0">
          <div className="bg-card border border-border rounded-xl p-4 space-y-5 sticky top-20">
            <div>
              <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                <SlidersHorizontal className="h-4 w-4"/>
                Filters
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                <Input placeholder="Search restaurants..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} data-testid="input-search-restaurants"/>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold mb-2">Cuisine</p>
              <div className="space-y-1">
                {CUISINES.map(c => (<button key={c} onClick={() => setCuisine(c === "All" ? "" : c)} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${(cuisine === c || (c === "All" && !cuisine))
                ? "bg-primary text-primary-foreground font-medium"
                : "hover:bg-muted text-foreground"}`} data-testid={`filter-cuisine-${c}`}>
                    {c}
                  </button>))}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold mb-2">Minimum Rating</p>
              <div className="space-y-1">
                {["", "4.5", "4.0", "3.5"].map(r => (<button key={r} onClick={() => setMinRating(r)} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${minRating === r ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted"}`}>
                    {r ? (<>
                        <Star className="h-3.5 w-3.5"/>
                        {r}+
                      </>) : "Any rating"}
                  </button>))}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold mb-2">Sort By</p>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger data-testid="select-sort">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map(opt => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </aside>
        <div className="flex-1">
          {isLoading ? (<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-64 rounded-xl"/>)}
            </div>) : restaurants?.length === 0 ? (<div className="text-center py-20 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-30"/>
              <p className="font-medium text-lg">No restaurants found</p>
              <p className="text-sm">Adjust your filters and try again</p>
            </div>) : (<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {restaurants?.map(r => (<Link key={r.id} href={`/restaurant/${r.id}`}>
                  <Card className="overflow-hidden hover:shadow-md transition-all group cursor-pointer border-border/50 hover:border-primary/30" data-testid={`card-restaurant-${r.id}`}>
                    <div className="relative h-44 overflow-hidden bg-muted">
                      {r.image ? (<img src={r.image} alt={r.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>) : (<div className="w-full h-full flex items-center justify-center bg-primary/10">
                          <span className="text-4xl">{r.cuisine?.[0]}</span>
                        </div>)}
                      {!r.isOpen && (<div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                          <Badge variant="secondary" className="text-base">Closed</Badge>
                        </div>)}
                      {r.featured && (<Badge className="absolute top-2 left-2 bg-primary text-xs">Featured</Badge>)}
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-base">{r.name}</h3>
                          <p className="text-muted-foreground text-sm">{r.cuisine}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400"/>
                          <span className="font-semibold">{r.rating}</span>
                          <span className="text-xs text-muted-foreground">({r.totalRatings})</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5"/>
                          {r.deliveryTime}
                        </div>
                        <span>₹{r.deliveryFee} delivery</span>
                        <span>₹{r.minOrder} min order</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>))}
            </div>)}
        </div>
      </div>
    </div>);
}
