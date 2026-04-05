import { Link } from "wouter";
import { useAuth, useLogout } from "@/hooks/use-auth";
import { Button } from "./ui-custom/Button";
import { CartDrawer } from "./CartDrawer";
import { Flame, LogOut, LayoutDashboard, ReceiptText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
function Navbar() {
  const { data: user, isLoading } = useAuth();
  const logout = useLogout();
  return <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary text-white p-2 rounded-xl group-hover:rotate-12 transition-transform shadow-bold-primary">
            <Flame className="w-6 h-6" />
          </div>
          <span className="text-2xl font-display font-black tracking-tight text-foreground">
            Bite<span className="text-primary">Dash</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <CartDrawer />

          {!isLoading && (user ? <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="rounded-full w-12 h-12 p-0 border-2 overflow-hidden hover:border-primary">
                    <div className="bg-secondary/20 w-full h-full flex items-center justify-center text-secondary-foreground font-bold font-display text-lg">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl p-2">
                  <DropdownMenuLabel className="font-display">
                    <div className="flex flex-col">
                      <span className="font-bold">{user.name}</span>
                      <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {user.role === "admin" && <Link href="/admin">
                      <DropdownMenuItem className="cursor-pointer py-3 rounded-lg focus:bg-accent/10 focus:text-accent font-medium">
                        <LayoutDashboard className="mr-2 h-4 w-4" /> Admin Dashboard
                      </DropdownMenuItem>
                    </Link>}
                  
                  <Link href="/orders">
                    <DropdownMenuItem className="cursor-pointer py-3 rounded-lg focus:bg-primary/10 focus:text-primary font-medium">
                      <ReceiptText className="mr-2 h-4 w-4" /> My Orders
                    </DropdownMenuItem>
                  </Link>

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
    onClick={() => logout.mutate()}
    className="cursor-pointer py-3 rounded-lg text-destructive focus:bg-destructive/10 focus:text-destructive font-bold"
  >
                    <LogOut className="mr-2 h-4 w-4" /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu> : <div className="flex gap-2">
                <Link href="/login" className="hidden sm:block">
                  <Button variant="ghost" className="font-bold">Log in</Button>
                </Link>
                <Link href="/register">
                  <Button className="rounded-full">Sign up</Button>
                </Link>
              </div>)}
        </div>
      </div>
    </header>;
}
export {
  Navbar
};
