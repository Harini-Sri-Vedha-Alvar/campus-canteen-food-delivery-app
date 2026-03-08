<<<<<<< HEAD
# Food Delivery Web Application

A full-stack food delivery platform built with React.js, Node.js + Express, and PostgreSQL.

## Features

- **User Features**
  - User registration and login
  - Browse restaurants and menus
  - Add items to cart
  - Place orders
  - View order history

- **Admin Features**
  - Admin-only login
  - Manage restaurants (create, update, delete)
  - Manage menu items
  - View all orders and update order status

## Prerequisites

Before you start, make sure you have installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **PostgreSQL** (v12 or higher) - [Download here](https://www.postgresql.org/download/)

## Setup Instructions

### 1. Extract and Navigate to Project

```bash
# Extract the zip file
unzip food-delivery-app.zip
cd food-delivery-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up PostgreSQL Database

#### Option A: Using PostgreSQL Locally

1. Start PostgreSQL service on your machine
2. Create a new database:
   ```bash
   psql -U postgres
   CREATE DATABASE food_delivery_db;
   \q
   ```

3. Create a `.env.local` file in the project root:
   ```bash
   cp .env.example .env.local
   ```

4. Edit `.env.local` and add your database connection string:
   ```
   DATABASE_URL=postgresql://postgres:your_password@localhost:5432/food_delivery_db
   SESSION_SECRET=your_secret_key_here
   ```

#### Option B: Using a Cloud Database

If you prefer using a cloud service like Supabase or Railway:
1. Create a PostgreSQL database
2. Copy the connection string
3. Add it to `.env.local` as shown above

### 4. Initialize Database Schema

Run the Drizzle migration to create all tables:

```bash
npm run db:push
```

This will automatically seed the database with sample data:
- Admin user: `admin@admin.com` / `admin123`
- Regular user: `user@user.com` / `user123`
- Two sample restaurants with menu items

### 5. Start the Application

```bash
npm run dev
```

The application will start on `http://localhost:5000`

## Login Credentials

### Admin Account
- Email: `admin@admin.com`
- Password: `admin123`

### User Account
- Email: `user@user.com`
- Password: `user123`

## Project Structure

```
├── shared/
│   ├── schema.ts          # Database schema definitions
│   └── routes.ts          # API contract and routes definition
├── server/
│   ├── index.ts           # Express server setup
│   ├── db.ts              # Database connection
│   ├── storage.ts         # Database operations layer
│   ├── auth.ts            # Authentication setup
│   └── routes.ts          # API route handlers
├── client/
│   ├── src/
│   │   ├── pages/         # React pages
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities
│   │   ├── App.tsx        # Main app component
│   │   └── index.css      # Styles
│   └── index.html         # HTML entry point
└── package.json           # Project dependencies
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user info

### Restaurants
- `GET /api/restaurants` - List all restaurants
- `GET /api/restaurants/:id` - Get restaurant details
- `POST /api/restaurants` - Create restaurant (admin only)
- `PUT /api/restaurants/:id` - Update restaurant (admin only)
- `DELETE /api/restaurants/:id` - Delete restaurant (admin only)

### Menu Items
- `GET /api/restaurants/:id/menu` - Get menu items for restaurant
- `POST /api/restaurants/:id/menu` - Add menu item (admin only)
- `PUT /api/restaurants/:restaurantId/menu/:id` - Update menu item (admin only)
- `DELETE /api/restaurants/:restaurantId/menu/:id` - Delete menu item (admin only)

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:id` - Update cart item quantity
- `DELETE /api/cart/:id` - Remove item from cart
- `DELETE /api/cart` - Clear entire cart

### Orders
- `GET /api/orders` - Get user's orders (or all orders for admin)
- `POST /api/orders` - Create new order
- `PATCH /api/orders/:id/status` - Update order status (admin only)

## Troubleshooting

### Database Connection Error
- Verify PostgreSQL is running: `psql -U postgres -c "SELECT 1"`
- Check your `DATABASE_URL` in `.env.local`
- Ensure the database exists: `psql -U postgres -l | grep food_delivery_db`

### Port Already in Use
If port 5000 is in use, you can change it by setting:
```bash
export PORT=3000
npm run dev
```

### Dependencies Installation Issues
If `npm install` fails:
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## Development

### Running Tests
```bash
npm test
```

### Building for Production
```bash
npm run build
```

## Tech Stack

- **Frontend:** React.js, Vite, TailwindCSS, shadcn/ui components
- **Backend:** Node.js, Express.js, Passport.js
- **Database:** PostgreSQL with Drizzle ORM
- **Authentication:** Session-based with bcrypt password hashing
- **State Management:** TanStack React Query
- **Form Handling:** React Hook Form with Zod validation

## Notes

- Prices are stored in cents (e.g., 1500 = $15.00)
- Sessions are stored in the PostgreSQL database
- Admin privileges are assigned during user creation (not changeable via UI)

## Support

For issues or questions, check the logs:
```bash
# Backend logs are displayed in terminal where npm run dev is running
# Browser console shows frontend errors (F12 in browser)
```

Enjoy your food delivery application!
=======
# campus-canteen-food-delivery-app
A web-based food ordering application for a campus canteen that allows students to view the menu, place orders, and enables admins to manage orders efficiently using the MERN stack.
>>>>>>> 587430f764b0d743fb39fb92d3ba5f589cc22160
