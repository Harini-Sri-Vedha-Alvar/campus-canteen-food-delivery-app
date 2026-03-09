import { Link } from "wouter";
import { MapPin, Utensils } from "lucide-react";
import { type Restaurant } from "@shared/schema";
import { motion } from "framer-motion";

export function RestaurantCard({ restaurant, index }: { restaurant: Restaurant, index: number }) {
  {/* landing page restaurant generic ambient food scene */}
  const defaultImage = `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop&q=80`;
  
  return (
    <Link href={`/restaurant/${restaurant.id}`}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1, duration: 0.4 }}
        className="group cursor-pointer h-full flex flex-col bg-card rounded-3xl overflow-hidden border-2 border-border shadow-sm hover:shadow-bold hover:-translate-y-1 transition-all duration-300"
      >
        <div className="relative h-48 sm:h-56 overflow-hidden">
          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10" />
          <img 
            src={defaultImage} 
            alt={restaurant.name} 
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
            <Utensils className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-bold text-foreground">{restaurant.cuisine}</span>
          </div>
        </div>
        
        <div className="p-5 flex flex-col flex-grow">
          <h3 className="text-xl font-display font-bold group-hover:text-primary transition-colors line-clamp-1">{restaurant.name}</h3>
          
          <div className="mt-auto pt-4 flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm font-medium truncate">{restaurant.location}</span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
