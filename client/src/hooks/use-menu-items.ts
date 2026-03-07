import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

export function useMenuItems(restaurantId: number) {
  return useQuery({
    queryKey: [api.menuItems.listByRestaurant.path, restaurantId],
    queryFn: async () => {
      const url = buildUrl(api.menuItems.listByRestaurant.path, { id: restaurantId });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch menu items");
      return api.menuItems.listByRestaurant.responses[200].parse(await res.json());
    },
    enabled: !!restaurantId
  });
}

export function useCreateMenuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ restaurantId, data }: { restaurantId: number, data: z.infer<typeof api.menuItems.create.input> }) => {
      const url = buildUrl(api.menuItems.create.path, { id: restaurantId });
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create menu item");
      return api.menuItems.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.menuItems.listByRestaurant.path, variables.restaurantId] });
    }
  });
}

export function useUpdateMenuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ restaurantId, id, data }: { restaurantId: number, id: number, data: Partial<z.infer<typeof api.menuItems.create.input>> }) => {
      const url = buildUrl(api.menuItems.update.path, { restaurantId, id });
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update menu item");
      return api.menuItems.update.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.menuItems.listByRestaurant.path, variables.restaurantId] });
    }
  });
}

export function useDeleteMenuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ restaurantId, id }: { restaurantId: number, id: number }) => {
      const url = buildUrl(api.menuItems.delete.path, { restaurantId, id });
      const res = await fetch(url, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete menu item");
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.menuItems.listByRestaurant.path, variables.restaurantId] });
    }
  });
}
