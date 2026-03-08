import { z } from 'zod';
import { insertUserSchema, insertRestaurantSchema, insertMenuItemSchema, users, restaurants, menuItems, cartItems, orders } from './schema.js';

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

const userSelectSchema = z.custom();
const restaurantSelectSchema = z.custom();
const menuItemSelectSchema = z.custom();
const orderSelectSchema = z.custom();

export const api = {
  auth: {
    register: {
      method: 'POST',
      path: '/api/auth/register',
      input: insertUserSchema,
      responses: {
        201: userSelectSchema,
        400: errorSchemas.validation,
      }
    },
    login: {
      method: 'POST',
      path: '/api/auth/login',
      input: z.object({ email: z.string(), password: z.string() }),
      responses: {
        200: userSelectSchema,
        401: errorSchemas.unauthorized,
      }
    },
    me: {
      method: 'GET',
      path: '/api/auth/me',
      responses: {
        200: userSelectSchema,
        401: errorSchemas.unauthorized,
      }
    },
    logout: {
      method: 'POST',
      path: '/api/auth/logout',
      responses: {
        200: z.object({ message: z.string() })
      }
    }
  },
  restaurants: {
    list: {
      method: 'GET',
      path: '/api/restaurants',
      responses: {
        200: z.array(restaurantSelectSchema)
      }
    },
    get: {
      method: 'GET',
      path: '/api/restaurants/:id',
      responses: {
        200: restaurantSelectSchema,
        404: errorSchemas.notFound,
      }
    },
    create: {
      method: 'POST',
      path: '/api/restaurants',
      input: insertRestaurantSchema,
      responses: {
        201: restaurantSelectSchema,
        401: errorSchemas.unauthorized,
      }
    },
    update: {
      method: 'PUT',
      path: '/api/restaurants/:id',
      input: insertRestaurantSchema.partial(),
      responses: {
        200: restaurantSelectSchema,
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      }
    },
    delete: {
      method: 'DELETE',
      path: '/api/restaurants/:id',
      responses: {
        204: z.void(),
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      }
    }
  },
  menuItems: {
    listByRestaurant: {
      method: 'GET',
      path: '/api/restaurants/:id/menu',
      responses: {
        200: z.array(menuItemSelectSchema)
      }
    },
    create: {
      method: 'POST',
      path: '/api/restaurants/:id/menu',
      input: insertMenuItemSchema.omit({ restaurantId: true }),
      responses: {
        201: menuItemSelectSchema,
        401: errorSchemas.unauthorized,
      }
    },
    update: {
      method: 'PUT',
      path: '/api/restaurants/:restaurantId/menu/:id',
      input: insertMenuItemSchema.partial(),
      responses: {
        200: menuItemSelectSchema,
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      }
    },
    delete: {
      method: 'DELETE',
      path: '/api/restaurants/:restaurantId/menu/:id',
      responses: {
        204: z.void(),
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      }
    }
  },
  cart: {
    list: {
      method: 'GET',
      path: '/api/cart',
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
      method: 'POST',
      path: '/api/cart',
      input: z.object({ menuItemId: z.number(), quantity: z.number() }),
      responses: {
        201: z.custom(),
        401: errorSchemas.unauthorized,
      }
    },
    update: {
      method: 'PUT',
      path: '/api/cart/:id',
      input: z.object({ quantity: z.number() }),
      responses: {
        200: z.custom(),
        401: errorSchemas.unauthorized,
      }
    },
    delete: {
      method: 'DELETE',
      path: '/api/cart/:id',
      responses: {
        204: z.void(),
        401: errorSchemas.unauthorized,
      }
    },
    clear: {
      method: 'DELETE',
      path: '/api/cart',
      responses: {
        204: z.void(),
        401: errorSchemas.unauthorized,
      }
    }
  },
  orders: {
    list: {
      method: 'GET',
      path: '/api/orders',
      responses: {
        200: z.array(orderSelectSchema),
        401: errorSchemas.unauthorized,
      }
    },
    create: {
      method: 'POST',
      path: '/api/orders',
      input: z.object({}),
      responses: {
        201: orderSelectSchema,
        401: errorSchemas.unauthorized,
        400: errorSchemas.validation,
      }
    },
    updateStatus: {
      method: 'PATCH',
      path: '/api/orders/:id/status',
      input: z.object({ status: z.string() }),
      responses: {
        200: orderSelectSchema,
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      }
    }
  }
};

export function buildUrl(path, params) {
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
