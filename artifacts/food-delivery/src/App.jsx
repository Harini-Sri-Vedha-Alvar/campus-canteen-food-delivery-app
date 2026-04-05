import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme-provider";
import { setBaseUrl } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Restaurants from "@/pages/restaurants";
import RestaurantPage from "@/pages/restaurant";
import Cart from "@/pages/cart";
import Orders from "@/pages/orders";
import OrderDetail from "@/pages/order-detail";
import Profile from "@/pages/profile";
import AdminDashboard from "@/pages/admin/index";
import AdminOrders from "@/pages/admin/orders";
import AdminRestaurants from "@/pages/admin/restaurants";
import AdminRevenue from "@/pages/admin/revenue";
import AdminMenu from "@/pages/admin/menu";
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
            refetchOnWindowFocus: false,
        },
    },
});

// Configure API client to use the backend server
setBaseUrl("http://localhost:3000");

function Router() {
    return (<Layout>
      <Switch>
        <Route path="/" component={Home}/>
        <Route path="/login" component={Login}/>
        <Route path="/register" component={Register}/>
        <Route path="/restaurants" component={Restaurants}/>
        <Route path="/restaurant/:id" component={RestaurantPage}/>
        <Route path="/cart" component={Cart}/>
        <Route path="/orders" component={Orders}/>
        <Route path="/orders/:id" component={OrderDetail}/>
        <Route path="/profile" component={Profile}/>
        <Route path="/admin" component={AdminDashboard}/>
        <Route path="/admin/orders" component={AdminOrders}/>
        <Route path="/admin/restaurants" component={AdminRestaurants}/>
        <Route path="/admin/menu" component={AdminMenu}/>
        <Route path="/admin/revenue" component={AdminRevenue}/>
        <Route component={NotFound}/>
      </Switch>
    </Layout>);
}
function App() {
    return (<QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="foodrush-theme">
        <AuthProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>);
}
export default App;
