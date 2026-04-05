import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
function useCart() {
  return useQuery({
    queryKey: [api.cart.list.path],
    queryFn: async () => {
      const res = await fetch(api.cart.list.path, { credentials: "include" });
      if (res.status === 401) return [];
      if (!res.ok) throw new Error("Failed to fetch cart");
      return api.cart.list.responses[200].parse(await res.json());
    }
  });
}
function useAddToCart() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data) => {
      const res = await fetch(api.cart.add.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to add to cart");
      return api.cart.add.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.cart.list.path] });
      toast({ title: "Added to cart!", duration: 2e3 });
    }
  });
}
function useUpdateCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, quantity }) => {
      const url = buildUrl(api.cart.update.path, { id });
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to update cart");
      return api.cart.update.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.cart.list.path] })
  });
}
function useDeleteCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const url = buildUrl(api.cart.delete.path, { id });
      const res = await fetch(url, {
        method: "DELETE",
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to remove item");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.cart.list.path] })
  });
}
function useClearCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.cart.clear.path, {
        method: "DELETE",
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to clear cart");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.cart.list.path] })
  });
}
export {
  useAddToCart,
  useCart,
  useClearCart,
  useDeleteCartItem,
  useUpdateCartItem
};
