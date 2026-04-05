import AdminLayout from "./AdminLayout";
import { useRestaurants, useCreateRestaurant, useDeleteRestaurant } from "@/hooks/use-restaurants";
import { Button } from "@/components/ui-custom/Button";
import { Input } from "@/components/ui-custom/Input";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@shared/routes";
import { Edit, Trash2, MenuSquare, Plus } from "lucide-react";
import { Link } from "wouter";

const schema = api.restaurants.create.input;

export default function AdminRestaurants() {
  const { data: restaurants = [] } = useRestaurants();
  const createMutation = useCreateRestaurant();
  const deleteMutation = useDeleteRestaurant();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", location: "", cuisine: "" }
  });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    await createMutation.mutateAsync(data);
    setIsOpen(false);
    form.reset();
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-display font-black text-foreground">Restaurants</h1>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent hover:bg-accent hover:shadow-bold hover:-translate-y-0.5"><Plus className="w-5 h-5 mr-2" /> Add Restaurant</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-3xl border-2 border-border shadow-bold-lg">
              <DialogHeader>
                <DialogTitle className="text-2xl font-display">New Restaurant</DialogTitle>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                <div className="space-y-1">
                  <label className="text-sm font-bold">Name</label>
                  <Input {...form.register("name")} placeholder="Pizza Palace" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold">Location</label>
                  <Input {...form.register("location")} placeholder="123 Main St" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold">Cuisine</label>
                  <Input {...form.register("cuisine")} placeholder="Italian" />
                </div>
                <Button type="submit" className="w-full h-12 bg-accent text-white shadow-bold hover:brightness-110" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Saving..." : "Save Restaurant"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-card border-2 border-border rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b-2 border-border text-sm text-muted-foreground uppercase tracking-wider">
                  <th className="p-4 font-bold">Name</th>
                  <th className="p-4 font-bold">Location</th>
                  <th className="p-4 font-bold">Cuisine</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y border-border">
                {restaurants.map(r => (
                  <tr key={r.id} className="hover:bg-muted/20 transition-colors group">
                    <td className="p-4 font-bold">{r.name}</td>
                    <td className="p-4 text-muted-foreground">{r.location}</td>
                    <td className="p-4"><span className="bg-accent/10 text-accent font-bold px-2 py-1 rounded-lg text-xs">{r.cuisine}</span></td>
                    <td className="p-4 flex items-center justify-end gap-2">
                      <Link href={`/admin/restaurants/${r.id}/menu`}>
                        <Button variant="outline" size="sm" className="h-9 px-3 gap-1">
                          <MenuSquare className="w-4 h-4" /> Menu
                        </Button>
                      </Link>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="h-9 w-9 p-0"
                        onClick={() => {
                          if (confirm("Delete this restaurant?")) deleteMutation.mutate(r.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {restaurants.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-muted-foreground">No restaurants found. Create one above!</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
