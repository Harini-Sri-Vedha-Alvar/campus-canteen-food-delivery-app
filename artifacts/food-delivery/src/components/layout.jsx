import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme-provider";
import { Button } from "@/components/ui/button";
import { Moon, Sun, ShoppingCart, User as UserIcon, LogOut, Package, Settings, Coins } from "lucide-react";
import { useGetCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
export function Layout({ children }) {
    const { user, logout } = useAuth();
    const { theme, setTheme } = useTheme();
    const [location] = useLocation();
    const { data: cart } = useGetCart({
        query: {
            enabled: !!user,
            queryKey: getGetCartQueryKey(),
        }
    });
    const cartItemsCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
    const navLinks = [
        { href: "/restaurants", label: "Restaurants" },
        ...(user ? [{ href: "/orders", label: "Orders" }] : []),
    ];
    return (<div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex gap-6 items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-bold text-2xl text-primary tracking-tight">FoodRush</span>
            </Link>
            <nav className="hidden md:flex gap-1">
              {navLinks.map(link => (<Link key={link.href} href={link.href} className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${location === link.href
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}>
                  {link.label}
                </Link>))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "light" ? "dark" : "light")} aria-label="Toggle theme">
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"/>
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"/>
            </Button>

            {user ? (<>
                <Link href="/cart" className="relative">
                  <Button variant="ghost" size="icon" aria-label="Cart">
                    <ShoppingCart className="h-5 w-5"/>
                    {cartItemsCount > 0 && (<span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                        {cartItemsCount}
                      </span>)}
                  </Button>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 px-2" data-testid="button-user-menu">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">{user.name?.[0]?.toUpperCase()}</span>
                      </div>
                      <div className="hidden sm:flex flex-col items-start">
                        <span className="text-sm font-medium leading-none">{user.name}</span>
                        <span className="text-xs text-amber-600 flex items-center gap-0.5">
                          <Coins className="h-3 w-3"/>
                          {user.coins} coins
                        </span>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                        <UserIcon className="h-4 w-4"/> Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/orders" className="flex items-center gap-2 cursor-pointer">
                        <Package className="h-4 w-4"/> Orders
                      </Link>
                    </DropdownMenuItem>
                    {user.role === "admin" && (<>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/admin" className="flex items-center gap-2 cursor-pointer">
                            <Settings className="h-4 w-4"/> Admin Dashboard
                          </Link>
                        </DropdownMenuItem>
                      </>)}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => logout()} className="text-destructive focus:text-destructive cursor-pointer" data-testid="button-logout">
                      <LogOut className="h-4 w-4 mr-2"/> Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>) : (<div className="flex items-center gap-2">
                <Link href="/login" className="text-sm font-medium hover:underline text-muted-foreground hover:text-foreground">
                  Login
                </Link>
                <Link href="/register">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>)}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t py-6 md:py-0">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row px-4 text-center md:text-left">
          <p className="text-sm leading-loose text-muted-foreground">
            FoodRush &mdash; Fast delivery, fresh food. &copy; {new Date().getFullYear()}
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/restaurants" className="hover:text-foreground">Restaurants</Link>
            <Link href="/orders" className="hover:text-foreground">Orders</Link>
            <Link href="/profile" className="hover:text-foreground">Profile</Link>
          </div>
        </div>
      </footer>
    </div>);
}
