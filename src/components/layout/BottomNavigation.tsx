import {
  LayoutDashboard,
  ClipboardList,
  CalendarDays,
  ChefHat,
  Wine,
  Plus,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "New Order", url: "/orders/new", icon: Plus, color: "bg-primary" },
  { title: "Current Orders", url: "/orders", icon: ClipboardList },
  { title: "Kitchen Orders", url: "/kitchen/orders", icon: ChefHat, color: "bg-orange-500" },
  { title: "Bar Orders", url: "/bar/orders", icon: Wine, color: "bg-blue-500" },
  { title: "Reservations", url: "/reservations", icon: CalendarDays },
];

export function BottomNavigation() {
  const location = useLocation();

  const isActive = (url: string) => {
    // Exact match or handle specific cases
    if (location.pathname === url) return true;
    
    // Special case: /orders/new should NOT match /orders
    if (url === "/orders" && location.pathname.startsWith("/orders/")) return false;
    
    return location.pathname.startsWith(url);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t-4 border-primary shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
      <div className="flex items-center justify-around h-20 px-6">
        {navItems.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            className={cn(
              "flex flex-col items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 min-w-[90px]",
              isActive(item.url)
                ? item.color
                  ? `${item.color} text-white shadow-lg scale-105`
                  : "bg-primary text-primary-foreground shadow-lg scale-105"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <item.icon className="h-6 w-6" />
            <span className="text-xs font-bold">{item.title.toUpperCase()}</span>
          </NavLink>
        ))}
        {/* <NavLink
          to="/home"
          className={cn(
            "flex flex-col items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 min-w-[90px]",
            location.pathname === "/home"
              ? "bg-muted text-foreground shadow-lg scale-105"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          <LayoutDashboard className="h-6 w-6" />
          <span className="text-xs font-bold">HOME</span>
        </NavLink> */}
      </div>
    </nav>
  );
}