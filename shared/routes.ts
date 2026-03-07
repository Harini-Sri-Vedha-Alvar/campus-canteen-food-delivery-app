import { z } from 'zod';
import { insertUserSchema, insertRestaurantSchema, insertMenuItemSchema, users, restaurants, menuItems, cartItems, orders } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

const userSelectSchema = z.custom<typeof users.$inferSelect>();
const restaurantSelectSchema = z.custom<typeof restaurants.$inferSelect>();
const menuItemSelectSchema = z.custom<typeof menuItems.$inferSelect>();
const orderSelectSchema = z.custom<typeof orders.$inferSelect>();

export const api = {
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/auth/register' as const,
      input: insertUserSchema,
      responses: {
        201: userSelectSchema,
        400: errorSchemas.validation,
      }
    },
    login: {
      method: 'POST' as const,
      path: '/api/auth/login' as const,
      input: z.object({ email: z.string(), password: z.string() }),
      responses: {
        200: userSelectSchema,
        401: errorSchemas.unauthorized,
      }
    },
    me: {
      method: 'GET' as const,
      path: '/api/auth/me' as const,
      responses: {
        200: userSelectSchema,
        401: errorSchemas.unauthorized,
      }
    },
    logout: {
      method: 'POST' as const,
      path: '/api/auth/logout' as const,
      responses: {
        200: z.object({ message: z.string() })
      }
    }
  },
  restaurants: {
    list: {
      method: 'GET' as const,
      path: '/api/restaurants' as const,
      responses: {
        200: z.array(restaurantSelectSchema)
      }
    },
    get: {
      method: 'GET' as const,
      path: '/api/restaurants/:id' as const,
      responses: {
        200: restaurantSelectSchema,
        404: errorSchemas.notFound,
      }
    },
    create: {
      method: 'POST' as const,
      path: '/api/restaurants' as const,
      input: insertRestaurantSchema,
      responses: {
        201: restaurantSelectSchema,
        401: errorSchemas.unauthorized,
      }
    },
    update: {
      method: 'PUT' as const,
      path: '/api/restaurants/:id' as const,
      input: insertRestaurantSchema.partial(),
      responses: {
        200: restaurantSelectSchema,
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      }
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/restaurants/:id' as const,
      responses: {
        204: z.void(),
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      }
    }
  },
  menuItems: {
    listByRestaurant: {
      method: 'GET' as const,
      path: '/api/restaurants/:id/menu' as const,
      responses: {
        200: z.array(menuItemSelectSchema)
      }
    },
    create: {
      method: 'POST' as const,
      path: '/api/restaurants/:id/menu' as const,
      input: insertMenuItemSchema.omit({ restaurantId: true }),
      responses: {
        201: menuItemSelectSchema,
        401: errorSchemas.unauthorized,
      }
    },
    update: {
      method: 'PUT' as const,
      path: '/api/restaurants/:restaurantId/menu/:id' as const,
      input: insertMenuItemSchema.partial(),
      responses: {
        200: menuItemSelectSchema,
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      }
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/restaurants/:restaurantId/menu/:id' as const,
      responses: {
        204: z.void(),
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      }
    }
  },
  cart: {
    list: {
      method: 'GET' as const,
      path: '/api/cart' as const,
      responses: {
        200: z.array(z.object({
          id: z.number(),
          quantity: z.number(),
          menuItem: menuItemSelectSchema,
        })),
        401: errorSchemas.unauthorized,
      }
    },
    add: {
      method: 'POST' as const,
      path: '/api/cart' as const,
      input: z.object({ menuItemId: z.number(), quantity: z.number() }),
      responses: {
        201: z.custom<typeof cartItems.$inferSelect>(),
        401: errorSchemas.unauthorized,
      }
    },
    update: {
      method: 'PUT' as const,
      path: '/api/cart/:id' as const,
      input: z.object({ quantity: z.number() }),
      responses: {
        200: z.custom<typeof cartItems.$inferSelect>(),
        401: errorSchemas.unauthorized,
      }
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/cart/:id' as const,
      responses: {
        204: z.void(),
        401: errorSchemas.unauthorized,
      }
    },
    clear: {
      method: 'DELETE' as const,
      path: '/api/cart' as const,
      responses: {
        204: z.void(),
        401: errorSchemas.unauthorized,
      }
    }
  },
  orders: {
    list: {
      method: 'GET' as const,
      path: '/api/orders' as const,
      responses: {
        200: z.array(orderSelectSchema),
        401: errorSchemas.unauthorized,
      }
    },
    create: {
      method: 'POST' as const,
      path: '/api/orders' as const,
      input: z.object({}), // Order creation reads from the user's cart in the DB
      responses: {
        201: orderSelectSchema,
        401: errorSchemas.unauthorized,
        400: errorSchemas.validation, // e.g. empty cart
      }
    },
    updateStatus: {
      method: 'PATCH' as const,
      path: '/api/orders/:id/status' as const,
      input: z.object({ status: z.string() }),
      responses: {
        200: orderSelectSchema,
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
