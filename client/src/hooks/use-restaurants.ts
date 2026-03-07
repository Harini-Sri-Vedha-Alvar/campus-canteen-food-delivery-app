import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

export function useRestaurants() {
  return useQuery({
    queryKey: [api.restaurants.list.path],
    queryFn: async () => {
      const res = await fetch(api.restaurants.list.path);
      if (!res.ok) throw new Error("Failed to fetch restaurants");
      return api.restaurants.list.responses[200].parse(await res.json());
    }
  });
}

export function useRestaurant(id: number) {
  return useQuery({
    queryKey: [api.restaurants.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.restaurants.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch restaurant");
      return api.restaurants.get.responses[200].parse(await res.json());
    },
    enabled: !!id
  });
}

export function useCreateRestaurant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof api.restaurants.create.input>) => {
      const res = await fetch(api.restaurants.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create restaurant");
      return api.restaurants.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.restaurants.list.path] })
  });
}

export function useUpdateRestaurant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<z.infer<typeof api.restaurants.create.input>>) => {
      const url = buildUrl(api.restaurants.update.path, { id });
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update restaurant");
      return api.restaurants.update.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.restaurants.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.restaurants.get.path, variables.id] });
    }
  });
}

export function useDeleteRestaurant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.restaurants.delete.path, { id });
      const res = await fetch(url, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete restaurant");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.restaurants.list.path] })
  });
}
