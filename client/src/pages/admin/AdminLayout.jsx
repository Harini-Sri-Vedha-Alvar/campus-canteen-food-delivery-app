import { Link, useLocation } from "wouter";
import { Store, ReceiptText, Home, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
function AdminLayout({ children }) {
  const [location] = useLocation();
  const { data: user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user || user.role !== "admin") {
    return <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="text-6xl text-destructive mb-4">⛔</div>
          <h1 className="text-3xl font-display font-bold">Access Denied</h1>
          <p className="text-muted-foreground">You do not have permission to view this area.</p>
          <Link href="/">
            <button className="text-primary font-bold hover:underline">Return Home</button>
          </Link>
        </div>
      </div>;
  }
  const links = [
    { href: "/admin", label: "Dashboard", icon: Home },
    { href: "/admin/restaurants", label: "Restaurants", icon: Store },
    { href: "/admin/orders", label: "Orders", icon: ReceiptText }
  ];
  return <div className="min-h-screen flex flex-col md:flex-row bg-muted/20">
      {
    /* Sidebar */
  }
      <aside className="w-full md:w-64 bg-card border-b md:border-b-0 md:border-r border-border p-6 flex flex-col h-auto md:h-screen sticky top-0">
        <Link href="/" className="flex items-center gap-2 mb-10 text-accent group">
          <div className="bg-accent text-white p-2 rounded-xl group-hover:rotate-12 transition-transform shadow-sm">
            <Store className="w-5 h-5" />
          </div>
          <span className="text-xl font-display font-black">Admin Panel</span>
        </Link>
        
        <nav className="flex-1 space-y-2 flex flex-row md:flex-col overflow-x-auto md:overflow-visible pb-2 md:pb-0">
          {links.map((link) => {
    const Icon = link.icon;
    const isActive = location === link.href;
    return <Link key={link.href} href={link.href} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all whitespace-nowrap md:whitespace-normal ${isActive ? "bg-accent text-white shadow-bold" : "text-muted-foreground hover:bg-accent/10 hover:text-accent"}`}>
                <Icon className="w-5 h-5" /> {link.label}
              </Link>;
  })}
        </nav>

        <div className="mt-auto hidden md:block pt-6 border-t border-border">
          <Link href="/">
            <button className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-muted-foreground hover:bg-muted w-full transition-colors">
              <LogOut className="w-5 h-5" /> Exit Admin
            </button>
          </Link>
        </div>
      </aside>

      {
    /* Main Content */
  }
      <main className="flex-1 p-6 sm:p-10 overflow-auto">
        {children}
      </main>
    </div>;
}
export {
  AdminLayout as default
};
