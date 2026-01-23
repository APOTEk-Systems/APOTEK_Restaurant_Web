import { ReactNode, useState, useEffect } from "react";
import { AppSidebar, MobileSidebar } from "./AppSidebar";
import { Bell, Search, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLocation } from "react-router-dom";

interface MainLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function MainLayout({ children, title, subtitle }: MainLayoutProps) {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    // Initialize from localStorage if available
    const savedState = localStorage.getItem('sidebarCollapsed');
    return savedState ? JSON.parse(savedState) : false;
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Save collapsed state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // Reset mobile sidebar when navigation changes
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <AppSidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />

      {/* Mobile Sidebar */}
      <MobileSidebar isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />

       {/* Main Content */}
      <div className={sidebarCollapsed ? "pl-16" : "pl-64"}>
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>

              {/* Sidebar Toggle Button */}
              <Button
                variant="ghost"
                size="icon"
                className="hidden md:block hover:bg-transparent hover:text-primary transition-colors"
                onClick={toggleSidebar}
              >
                <Menu className="h-5 w-5" />
              </Button>

              <div>
                <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
                {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="w-64 pl-9 bg-secondary border-0 focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>

              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary animate-pulse-soft" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="px-6 py-3">
          {children}
        </main>
      </div>
    </div>
  );
}
