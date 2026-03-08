import { useRestaurants } from "@/hooks/use-restaurants";
import { RestaurantCard } from "@/components/RestaurantCard";
import { Input } from "@/components/ui-custom/Input";
import { Button } from "@/components/ui-custom/Button";
import { Search, MapPin, Sparkles } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
function Home() {
  const { data: restaurants, isLoading } = useRestaurants();
  const [search, setSearch] = useState("");
  const filtered = restaurants?.filter(
    (r) => r.name.toLowerCase().includes(search.toLowerCase()) || r.cuisine.toLowerCase().includes(search.toLowerCase())
  ) || [];
  return <div className="min-h-screen pb-20">
      {
    /* Hero Section */
  }
      <section className="relative pt-20 pb-28 px-4 overflow-hidden">
        {
    /* Abstract background shapes */
  }
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-secondary/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
        
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-border/50 text-sm font-bold text-primary mb-6"
  >
            <Sparkles className="w-4 h-4" /> The fastest delivery in town
          </motion.div>
          
          <motion.h1
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}
    className="text-5xl sm:text-6xl md:text-7xl font-display font-black leading-[1.1] tracking-tight text-foreground mb-6"
  >
            Craving something <span className="text-primary inline-block transform -rotate-2">delicious?</span>
          </motion.h1>
          
          <motion.p
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
    className="text-lg md:text-xl text-muted-foreground font-medium max-w-2xl mx-auto mb-10"
  >
            Get your favorite meals from top-rated restaurants delivered hot and fresh straight to your door.
          </motion.p>

          <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3 }}
    className="max-w-2xl mx-auto bg-white p-2 sm:p-3 rounded-2xl shadow-bold-lg flex flex-col sm:flex-row gap-3 border-2 border-border/50"
  >
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
    className="h-14 pl-12 border-none bg-transparent shadow-none focus-visible:ring-0 text-lg"
    placeholder="Search burgers, pizza, sushi..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />
            </div>
            <div className="hidden sm:block w-px bg-border/50 my-2" />
            <div className="flex-1 relative hidden sm:block">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
    className="h-14 pl-12 border-none bg-transparent shadow-none focus-visible:ring-0 text-lg"
    placeholder="San Francisco, CA"
    disabled
  />
            </div>
            <Button size="lg" className="h-14 px-8 text-lg w-full sm:w-auto">Find Food</Button>
          </motion.div>
        </div>
      </section>

      {
    /* Restaurant List Section */
  }
      <section className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-display font-bold">Trending Near You</h2>
        </div>

        {isLoading ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="h-72 bg-muted rounded-3xl animate-pulse" />)}
          </div> : filtered.length === 0 ? <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-border">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold mb-2">No restaurants found</h3>
            <p className="text-muted-foreground">Try tweaking your search query.</p>
          </div> : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((restaurant, i) => <RestaurantCard key={restaurant.id} restaurant={restaurant} index={i} />)}
          </div>}
      </section>
    </div>;
}
export {
  Home as default
};
