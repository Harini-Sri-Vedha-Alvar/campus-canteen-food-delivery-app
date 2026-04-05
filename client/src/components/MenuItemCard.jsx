import { useAddToCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/format";
import { Plus } from "lucide-react";
import { Button } from "./ui-custom/Button";
import { motion } from "framer-motion";
function MenuItemCard({ item, index }) {
  const addToCart = useAddToCart();
  return <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.05 }}
    className="flex gap-4 p-4 rounded-3xl bg-card border-2 border-border hover:border-primary/30 shadow-sm hover:shadow-bold transition-all duration-300 group"
  >
      <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden flex-shrink-0 relative">
        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors z-10" />
        <img
    src={item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop"}
    alt={item.name}
    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
  />
      </div>
      
      <div className="flex flex-col flex-1 py-1">
        <div className="flex justify-between items-start gap-2">
          <h4 className="font-display font-bold text-lg leading-tight">{item.name}</h4>
          <span className="font-bold text-primary whitespace-nowrap bg-primary/10 px-2.5 py-1 rounded-lg">
            {formatPrice(item.price)}
          </span>
        </div>
        
        <p className="text-sm text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
          {item.description}
        </p>
        
        <div className="mt-auto pt-3 flex justify-end">
          <Button
    size="sm"
    className="rounded-full px-4"
    disabled={addToCart.isPending}
    onClick={() => addToCart.mutate({ menuItemId: item.id, quantity: 1 })}
  >
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>
      </div>
    </motion.div>;
}
export {
  MenuItemCard
};
