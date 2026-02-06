import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ClipboardList,
  UtensilsCrossed,
  CalendarDays,
  Users,
  Settings,
  Calculator,
  BarChart3,
  ChefHat,
  LogOut,
  Wine,
  Flame,
  ChevronDown,
  Plus,
  Clock,
  History,
  Shield,
  Layers,
  ArrowUpDown,
  MessageSquare,
  AlertTriangle,
  FileText,
  PackageCheck,
  Building2,
  UserCircle,
  RotateCcw,
  ThumbsDown,
  Store,
  Wrench,
  ListChecks,
  Wallet,
  Ruler,
  Bell,
  Grid3X3,
  Menu,
  ArrowLeft
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

import { Receipt } from "lucide-react";

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Menu", url: "/menu", icon: UtensilsCrossed },
  { title: "Reservations", url: "/reservations", icon: CalendarDays },
  { title: "Reports", url: "/reports", icon: BarChart3 },
];

const accountingSubItems = [
  { title: "Overview", url: "/accounting", icon: Calculator },
  { title: "Expenses", url: "/accounting/expenses", icon: Receipt },
];

const orderSubItems = [
  { title: "New Order", url: "/orders/new", icon: Plus },
  { title: "Current Orders", url: "/orders", icon: Clock },
  { title: "Orders History", url: "/orders/history", icon: History },
];

const kitchenSubItems = [
  { title: "Orders", url: "/kitchen/orders", icon: ClipboardList },
  { title: "Menu", url: "/kitchen/menu", icon: UtensilsCrossed },
  { title: "Inventory", url: "/kitchen/inventory", icon: Package },
  { title: "Dissatisfactions", url: "/kitchen/dissatisfactions", icon: ThumbsDown },
];

const barSubItems = [
  { title: "Orders", url: "/bar/orders", icon: ClipboardList },
  { title: "Menu", url: "/bar/menu", icon: UtensilsCrossed },
  { title: "Inventory", url: "/bar/inventory", icon: Package },
  { title: "Returns", url: "/bar/returns", icon: RotateCcw },
];

const inventorySubItems = [
  { title: "Current Stock", url: "/inventory", icon: Layers },
  { title: "Adjustments", url: "/inventory/adjustments", icon: ArrowUpDown },
  { title: "Requests", url: "/inventory/requests", icon: MessageSquare },
  { title: "Expiring Products", url: "/inventory/expiring", icon: AlertTriangle },
];

const userSubItems = [
  { title: "Users", url: "/users", icon: Users },
  { title: "Roles", url: "/users/roles", icon: Shield },
];

const purchaseSubItems = [
  { title: "New Purchase Order", url: "/purchases/new", icon: Plus },
  { title: "Purchase Orders", url: "/purchases", icon: FileText },
  { title: "Goods Received", url: "/purchases/receiving", icon: PackageCheck },
  { title: "Suppliers", url: "/purchases/suppliers", icon: Building2 },
];

const settingsSubItems = [
  { title: "Restaurant Info", url: "/settings", icon: Store },
  { title: "Configurations", url: "/settings/configurations", icon: Wrench },
  { title: "Tables", url: "/settings/tables", icon: Grid3X3 },
  { title: "Inventory Categories", url: "/settings/inventory-categories", icon: Package },
  { title: "Menu Categories", url: "/settings/menu-categories", icon: UtensilsCrossed },
  { title: "Adjustment Reasons", url: "/settings/adjustment-reasons", icon: ListChecks },
  { title: "Expense Categories", url: "/settings/expense-categories", icon: Wallet },
  { title: "Units", url: "/settings/units", icon: Ruler },
  { title: "Alerts", url: "/settings/alerts", icon: Bell },
];

export function AppSidebar({ collapsed = false, onToggle }: { collapsed?: boolean, onToggle?: () => void }) {
  const location = useLocation();
  const isOrdersActive = location.pathname.startsWith("/orders");
  const isKitchenActive = location.pathname.startsWith("/kitchen");
  const isBarActive = location.pathname.startsWith("/bar");
  const isInventoryActive = location.pathname.startsWith("/inventory");
  const isUsersActive = location.pathname.startsWith("/users");
  const isPurchasesActive = location.pathname.startsWith("/purchases");
  const isAccountingActive = location.pathname.startsWith("/accounting");
  const isSettingsActive = location.pathname.startsWith("/settings");
  const [ordersOpen, setOrdersOpen] = useState(isOrdersActive);
  const [kitchenOpen, setKitchenOpen] = useState(isKitchenActive);
  const [barOpen, setBarOpen] = useState(isBarActive);
  const [inventoryOpen, setInventoryOpen] = useState(isInventoryActive);
  const [usersOpen, setUsersOpen] = useState(isUsersActive);
  const [purchasesOpen, setPurchasesOpen] = useState(isPurchasesActive);
  const [accountingOpen, setAccountingOpen] = useState(isAccountingActive);
  const [settingsOpen, setSettingsOpen] = useState(isSettingsActive);
  return (
    <aside className={cn(
      "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-glow">
          <ChefHat className="h-5 w-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div>
            <h1 className="text-lg font-semibold text-sidebar-foreground">RestaurantOS</h1>
            <p className="text-xs text-sidebar-muted">Management System</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin px-2 py-4">
        <ul className="space-y-1">
          {/* Dashboard */}
          <li>
            <NavLink
              to="/"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                location.pathname === "/"
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-glow"
                  : "text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent",
                collapsed ? "justify-center" : ""
              )}
            >
              <LayoutDashboard className="h-5 w-5" />
              {!collapsed && <span>Dashboard</span>}
            </NavLink>
          </li>

          {/* Orders with Sub-menu */}
          <li>
            <Collapsible open={ordersOpen} onOpenChange={setOrdersOpen}>
              <CollapsibleTrigger
                className={cn(
                  "flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isOrdersActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-glow"
                    : "text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent",
                  collapsed ? "justify-center" : ""
                )}
              >
                <div className="flex items-center gap-3">
                  <ClipboardList className="h-5 w-5" />
                  {!collapsed && <span>Orders</span>}
                </div>
                {!collapsed && (
                  <ChevronDown className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    ordersOpen && "rotate-180"
                  )} />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className={cn("pl-4 mt-1 space-y-1", collapsed ? "hidden" : "")}>
                {orderSubItems.map((item) => {
                  const isActive = location.pathname === item.url;
                  return (
                    <NavLink
                      key={item.title}
                      to={item.url}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-foreground font-medium"
                          : "text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  );
                })}
              </CollapsibleContent>
            </Collapsible>
          </li>

          {/* Kitchen with Sub-menu */}
          <li>
            <Collapsible open={kitchenOpen} onOpenChange={setKitchenOpen}>
              <CollapsibleTrigger
                className={cn(
                  "flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isKitchenActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-glow"
                    : "text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent",
                  collapsed ? "justify-center" : ""
                )}
              >
                <div className="flex items-center gap-3">
                  <Flame className="h-5 w-5" />
                  {!collapsed && <span>Kitchen</span>}
                </div>
                {!collapsed && (
                  <ChevronDown className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    kitchenOpen && "rotate-180"
                  )} />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className={cn("pl-4 mt-1 space-y-1", collapsed ? "hidden" : "")}>
                {kitchenSubItems.map((item) => {
                  const isActive = location.pathname === item.url;
                  return (
                    <NavLink
                      key={item.title}
                      to={item.url}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-foreground font-medium"
                          : "text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  );
                })}
              </CollapsibleContent>
            </Collapsible>
          </li>

          {/* Bar with Sub-menu */}
          <li>
            <Collapsible open={barOpen} onOpenChange={setBarOpen}>
              <CollapsibleTrigger
                className={cn(
                  "flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isBarActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-glow"
                    : "text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent",
                  collapsed ? "justify-center" : ""
                )}
              >
                <div className="flex items-center gap-3">
                  <Wine className="h-5 w-5" />
                  {!collapsed && <span>Bar</span>}
                </div>
                {!collapsed && (
                  <ChevronDown className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    barOpen && "rotate-180"
                  )} />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className={cn("pl-4 mt-1 space-y-1", collapsed ? "hidden" : "")}>
                {barSubItems.map((item) => {
                  const isActive = location.pathname === item.url;
                  return (
                    <NavLink
                      key={item.title}
                      to={item.url}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-foreground font-medium"
                          : "text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  );
                })}
              </CollapsibleContent>
            </Collapsible>
          </li>

          {/* Menu & Reservations */}
          {menuItems.slice(1, 3).map((item) => {
            const isActive = location.pathname === item.url;
            return (
              <li key={item.title}>
                <NavLink
                  to={item.url}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-glow"
                      : "text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent",
                    collapsed ? "justify-center" : ""
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {!collapsed && <span>{item.title}</span>}
                </NavLink>
              </li>
            );
          })}

          {/* Inventory with Sub-menu */}
          <li>
            <Collapsible open={inventoryOpen} onOpenChange={setInventoryOpen}>
              <CollapsibleTrigger
                className={cn(
                  "flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isInventoryActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-glow"
                    : "text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent",
                  collapsed ? "justify-center" : ""
                )}
              >
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5" />
                  {!collapsed && <span>Inventory</span>}
                </div>
                {!collapsed && (
                  <ChevronDown className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    inventoryOpen && "rotate-180"
                  )} />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className={cn("pl-4 mt-1 space-y-1", collapsed ? "hidden" : "")}>
                {inventorySubItems.map((item) => {
                  const isActive = location.pathname === item.url;
                  return (
                    <NavLink
                      key={item.title}
                      to={item.url}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-foreground font-medium"
                          : "text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  );
                })}
              </CollapsibleContent>
            </Collapsible>
          </li>

          {/* Purchases with Sub-menu */}
          <li>
            <Collapsible open={purchasesOpen} onOpenChange={setPurchasesOpen}>
              <CollapsibleTrigger
                className={cn(
                  "flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isPurchasesActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-glow"
                    : "text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent",
                  collapsed ? "justify-center" : ""
                )}
              >
                <div className="flex items-center gap-3">
                  <ShoppingCart className="h-5 w-5" />
                  {!collapsed && <span>Purchases</span>}
                </div>
                {!collapsed && (
                  <ChevronDown className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    purchasesOpen && "rotate-180"
                  )} />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className={cn("pl-4 mt-1 space-y-1", collapsed ? "hidden" : "")}>
                {purchaseSubItems.map((item) => {
                  const isActive = location.pathname === item.url;
                  return (
                    <NavLink
                      key={item.title}
                      to={item.url}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-foreground font-medium"
                          : "text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  );
                })}
              </CollapsibleContent>
            </Collapsible>
          </li>

           {/* Accounting with Sub-menu */}
          <li>
            <Collapsible open={accountingOpen} onOpenChange={setAccountingOpen}>
              <CollapsibleTrigger
                className={cn(
                  "flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isAccountingActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-glow"
                    : "text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent",
                  collapsed ? "justify-center" : ""
                )}
              >
                <div className="flex items-center gap-3">
                  <Calculator className="h-5 w-5" />
                  {!collapsed && <span>Accounting</span>}
                </div>
                {!collapsed && (
                  <ChevronDown className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    accountingOpen && "rotate-180"
                  )} />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className={cn("pl-4 mt-1 space-y-1", collapsed ? "hidden" : "")}>
                {accountingSubItems.map((item) => {
                  const isActive = location.pathname === item.url;
                  return (
                    <NavLink
                      key={item.title}
                      to={item.url}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-foreground font-medium"
                          : "text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  );
                })}
              </CollapsibleContent>
            </Collapsible>
          </li>

          {/* Staff */}
          <li>
            <NavLink
              to="/staff"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                location.pathname.startsWith("/staff")
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-glow"
                  : "text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent",
                collapsed ? "justify-center" : ""
              )}
            >
              <UserCircle className="h-5 w-5" />
              {!collapsed && <span>Staff</span>}
            </NavLink>
          </li>

          {/* User Management with Sub-menu */}
          <li>
            <Collapsible open={usersOpen} onOpenChange={setUsersOpen}>
              <CollapsibleTrigger
                className={cn(
                  "flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isUsersActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-glow"
                    : "text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent",
                  collapsed ? "justify-center" : ""
                )}
              >
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5" />
                  {!collapsed && <span>User Management</span>}
                </div>
                {!collapsed && (
                  <ChevronDown className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    usersOpen && "rotate-180"
                  )} />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className={cn("pl-4 mt-1 space-y-1", collapsed ? "hidden" : "")}>
                {userSubItems.map((item) => {
                  const isActive = location.pathname === item.url;
                  return (
                    <NavLink
                      key={item.title}
                      to={item.url}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-foreground font-medium"
                          : "text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  );
                })}
              </CollapsibleContent>
            </Collapsible>
          </li>

         

          {/* Reports */}
          <li>
            <NavLink
              to="/reports"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                location.pathname === "/reports"
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-glow"
                  : "text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent",
                collapsed ? "justify-center" : ""
              )}
            >
              <BarChart3 className="h-5 w-5" />
              {!collapsed && <span>Reports</span>}
            </NavLink>
          </li>

          {/* Settings with Sub-menu */}
          <li>
            <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
              <CollapsibleTrigger
                className={cn(
                  "flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isSettingsActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-glow"
                    : "text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent",
                  collapsed ? "justify-center" : ""
                )}
              >
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5" />
                  {!collapsed && <span>Settings</span>}
                </div>
                {!collapsed && (
                  <ChevronDown className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    settingsOpen && "rotate-180"
                  )} />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className={cn("pl-4 mt-1 space-y-1", collapsed ? "hidden" : "")}>
                {settingsSubItems.map((item) => {
                  const isActive = location.pathname === item.url;
                  return (
                    <NavLink
                      key={item.title}
                      to={item.url}

                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-foreground font-medium"
                          : "text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  );
                })}
              </CollapsibleContent>
            </Collapsible>
          </li>
        </ul>
      </nav>

      {/* User Section */}
      <div className="border-t border-sidebar-border p-2">
        <div className="flex items-center gap-3 px-2">
          <div className="h-9 w-9 rounded-full bg-sidebar-accent flex items-center justify-center">
            <span className="text-sm font-medium text-sidebar-foreground">JD</span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">John Doe</p>
              <p className="text-xs text-sidebar-muted truncate">Admin</p>
            </div>
          )}
          <button className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors">
            <LogOut className="h-4 w-4 text-sidebar-muted" />
          </button>
        </div>
      </div>
    </aside>
  );
}


export function MobileSidebar({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-[280px] p-0 bg-sidebar border-r-0">
        <AppSidebar collapsed={false} />
      </SheetContent>
    </Sheet>
  );
}
