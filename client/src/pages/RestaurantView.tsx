import { useParams } from "wouter";
import { useRestaurant } from "@/hooks/use-restaurants";
import { useMenuItems } from "@/hooks/use-menu-items";
import { MenuItemCard } from "@/components/MenuItemCard";
import { MapPin, Utensils, Clock, Star, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function RestaurantView() {
  const { id } = useParams();
  const restId = Number(id);
  
  const { data: restaurant, isLoading: isLoadingRest } = useRestaurant(restId);
  const { data: menuItems = [], isLoading: isLoadingMenu } = useMenuItems(restId);

  {/* landing page restaurant hero specific dish */}
  const defaultHero = `https://images.unsplash.com/photo-1550547660-d9450f859349?w=1600&h=600&fit=crop&q=80`;

  if (isLoadingRest) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!restaurant) {
    return <div className="min-h-screen flex items-center justify-center font-display text-2xl">Restaurant not found.</div>;
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Restaurant Hero */}
      <div className="relative h-64 md:h-80 lg:h-96 w-full">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
        <img src={defaultHero} alt={restaurant.name} className="w-full h-full object-cover" />
        
        <div className="absolute top-6 left-6 z-20">
          <Link href="/">
            <button className="bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-3 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-20 container mx-auto px-4 pb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-end justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                  {restaurant.cuisine}
                </span>
                <span className="bg-white text-foreground text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-current text-secondary" /> 4.8
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-black text-white mb-2 shadow-sm">{restaurant.name}</h1>
              <div className="flex items-center gap-4 text-white/90 font-medium">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {restaurant.location}</span>
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 20-35 min</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Menu Section */}
      <div className="container mx-auto px-4 mt-12 max-w-5xl">
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-border/50">
          <Utensils className="w-8 h-8 text-primary" />
          <h2 className="text-3xl font-display font-bold">Menu</h2>
        </div>

        {isLoadingMenu ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-32 bg-muted rounded-2xl animate-pulse" />)}
          </div>
        ) : menuItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-border">
            <Utensils className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold mb-2">Menu is empty</h3>
            <p className="text-muted-foreground">This restaurant hasn't added any items yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {menuItems.map((item, i) => (
              <MenuItemCard key={item.id} item={item} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
