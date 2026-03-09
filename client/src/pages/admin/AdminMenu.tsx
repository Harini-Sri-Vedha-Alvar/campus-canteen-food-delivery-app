import AdminLayout from "./AdminLayout";
import { useParams, Link } from "wouter";
import { useMenuItems, useCreateMenuItem, useDeleteMenuItem } from "@/hooks/use-menu-items";
import { useRestaurant } from "@/hooks/use-restaurants";
import { Button } from "@/components/ui-custom/Button";
import { Input } from "@/components/ui-custom/Input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { formatPrice } from "@/lib/format";
import { Trash2, Plus, ArrowLeft, Image as ImageIcon } from "lucide-react";
import { useState } from "react";

// Base schema from routes, extended for form coercions
const formSchema = z.object({
  name: z.string().min(1, "Name required"),
  description: z.string().min(1, "Description required"),
  priceDollars: z.coerce.number().min(0.01, "Price must be > 0"), // Accept dollars in form
  imageUrl: z.string().url("Must be valid URL"),
});

export default function AdminMenu() {
  const { id } = useParams();
  const restId = Number(id);
  
  const { data: restaurant } = useRestaurant(restId);
  const { data: menuItems = [] } = useMenuItems(restId);
  
  const createMutation = useCreateMenuItem();
  const deleteMutation = useDeleteMenuItem();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", description: "", priceDollars: 0, imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop" }
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    await createMutation.mutateAsync({
      restaurantId: restId,
      data: {
        name: data.name,
        description: data.description,
        price: Math.round(data.priceDollars * 100), // convert to cents for backend
        imageUrl: data.imageUrl
      }
    });
    setIsOpen(false);
    form.reset();
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center gap-2">
          <Link href="/admin/restaurants" className="text-muted-foreground hover:text-foreground transition-colors flex items-center">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Restaurants
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-display font-black text-foreground mb-1">Menu Management</h1>
            <p className="text-lg text-muted-foreground font-medium">{restaurant?.name}</p>
          </div>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent hover:bg-accent/90 shadow-bold hover:shadow-bold-lg"><Plus className="w-5 h-5 mr-2" /> Add Menu Item</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-3xl border-2 border-border">
              <DialogHeader>
                <DialogTitle className="text-2xl font-display">New Menu Item</DialogTitle>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
                <div className="space-y-1">
                  <label className="text-sm font-bold">Item Name</label>
                  <Input {...form.register("name")} placeholder="Spicy Chicken Burger" />
                  {form.formState.errors.name && <span className="text-xs text-destructive">{form.formState.errors.name.message}</span>}
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold">Description</label>
                  <textarea 
                    {...form.register("description")} 
                    className="flex min-h-[80px] w-full rounded-xl border-2 border-border bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:border-accent focus-visible:ring-4 focus-visible:ring-accent/20"
                    placeholder="Delicious burger with secret sauce..."
                  />
                  {form.formState.errors.description && <span className="text-xs text-destructive">{form.formState.errors.description.message}</span>}
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold">Price ($)</label>
                  <Input type="number" step="0.01" {...form.register("priceDollars")} placeholder="12.99" />
                  {form.formState.errors.priceDollars && <span className="text-xs text-destructive">{form.formState.errors.priceDollars.message}</span>}
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold">Image URL</label>
                  <div className="relative">
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input {...form.register("imageUrl")} className="pl-9" placeholder="https://..." />
                  </div>
                </div>
                <Button type="submit" className="w-full h-12 bg-accent text-white shadow-bold mt-4" disabled={createMutation.isPending}>
                  Save Item
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map(item => (
            <div key={item.id} className="bg-card border-2 border-border rounded-3xl overflow-hidden shadow-sm flex flex-col group hover:border-accent/30 transition-colors">
              <div className="h-48 overflow-hidden relative">
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                <div className="absolute top-3 right-3">
                  <span className="bg-white/90 backdrop-blur-sm text-foreground font-black px-3 py-1 rounded-full shadow-sm">
                    {formatPrice(item.price)}
                  </span>
                </div>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-xl font-display font-bold mb-2">{item.name}</h3>
                <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{item.description}</p>
                <div className="mt-auto pt-4 border-t border-border flex justify-end">
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="h-9"
                    onClick={() => {
                      if(confirm("Delete item?")) deleteMutation.mutate({ restaurantId: restId, id: item.id });
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Remove
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {menuItems.length === 0 && (
             <div className="col-span-full py-12 text-center bg-muted/20 border-2 border-dashed border-border rounded-3xl">
               <p className="text-muted-foreground font-medium">No menu items yet.</p>
             </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
