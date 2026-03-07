import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/Navbar";

// Pages
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import RestaurantView from "@/pages/RestaurantView";
import Orders from "@/pages/Orders";

// Admin Pages
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminRestaurants from "@/pages/admin/AdminRestaurants";
import AdminMenu from "@/pages/admin/AdminMenu";
import AdminOrders from "@/pages/admin/AdminOrders";

// Wrapper for standard app layout
function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      {/* Public / User Routes */}
      <Route path="/" component={() => <MainLayout><Home /></MainLayout>} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/restaurant/:id" component={() => <MainLayout><RestaurantView /></MainLayout>} />
      <Route path="/orders" component={() => <MainLayout><Orders /></MainLayout>} />

      {/* Admin Routes */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/restaurants" component={AdminRestaurants} />
      <Route path="/admin/restaurants/:id/menu" component={AdminMenu} />
      <Route path="/admin/orders" component={AdminOrders} />

      <Route component={() => <MainLayout><NotFound /></MainLayout>} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
