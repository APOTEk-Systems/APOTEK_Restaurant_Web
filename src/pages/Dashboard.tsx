import { MainLayout } from "@/components/layout/MainLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentOrders } from "@/components/dashboard/RecentOrders";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { PopularItems } from "@/components/dashboard/PopularItems";
import { UpcomingReservations } from "@/components/dashboard/UpcomingReservations";
import { DollarSign, ShoppingBag, Users, TrendingUp, AlertTriangle, Package, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { OrderService } from "@/services/orderService";
import { ReservationService } from "@/services/reservationService";
import { TableService } from "@/services/tableService";
import { InventoryService } from "@/services/inventoryService";
import { StockRequestService } from "@/services/stockRequestService";
import { useMemo } from "react";

export default function Dashboard() {
  // Fetch weekly orders - for charts and weekly stats
  const { data: weeklyOrders = [], isLoading: loadingWeeklyOrders } = useQuery({
    queryKey: ['weekly-orders'],
    queryFn: OrderService.getWeeklyOrders,
  });

  // Fetch recent orders - for RecentOrders component (most recent regardless of date)
  const { data: recentOrders = [], isLoading: loadingRecentOrders } = useQuery({
    queryKey: ['recent-orders'],
    queryFn: OrderService.getRecentOrders,
  });

  // Fetch today's reservations
  const { data: reservations = [], isLoading: loadingReservations } = useQuery({
    queryKey: ['today-reservations'],
    queryFn: ReservationService.getTodayReservations,
  });

  // Fetch all tables
  const { data: tables = [], isLoading: loadingTables } = useQuery({
    queryKey: ['tables'],
    queryFn: TableService.getAllTables,
  });

  // Fetch all inventory items
  const { data: inventoryItems = [], isLoading: loadingInventory } = useQuery({
    queryKey: ['inventory-items'],
    queryFn: InventoryService.getAllItems,
  });

  // Fetch pending stock requests
  const { data: pendingRequests = [], isLoading: loadingRequests } = useQuery({
    queryKey: ['pending-stock-requests'],
    queryFn: () => StockRequestService.getAllStockRequests({ status: 'pending' }),
  });

  // Calculate weekly stats from weeklyOrders
  const weeklyStats = useMemo(() => {
    const totalRevenue = weeklyOrders.reduce((sum: number, order: any) => sum + (order.total || 0), 0);
    const totalOrders = weeklyOrders.length;
    return { totalRevenue, totalOrders };
  }, [weeklyOrders]);

  // Get today's orders for today's revenue
  const todayOrders = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return weeklyOrders.filter((order: any) =>
      new Date(order.createdAt).toISOString().split('T')[0] === today
    );
  }, [weeklyOrders]);

  const todayRevenue = todayOrders.reduce((sum: number, order: any) => sum + (order.total || 0), 0);

  const isLoading = loadingWeeklyOrders || loadingRecentOrders || loadingReservations || loadingTables || loadingInventory || loadingRequests;
  
  const activeTables = tables.filter((t: any) => t.status === 'OCCUPIED').length;
  const availableTables = tables.filter((t: any) => t.status === 'AVAILABLE').length;
  const avgOrderValue = weeklyStats.totalOrders > 0 ? weeklyStats.totalRevenue / weeklyStats.totalOrders : 0;
  
  // Low stock items
  const lowStockItems = inventoryItems.filter((item: any) => {
    if (!item.minStock) return false;
    return item.quantity <= item.minStock;
  });
  
  // Upcoming reservations for today (sorted by time)
  const upcomingReservations = reservations
    .filter((r: any) => new Date(r.date) >= new Date())
    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  return (
    <MainLayout title="Dashboard" subtitle="Welcome back! Here's what's happening today.">
      <div className="space-y-6 animate-fade-in">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Today's Revenue"
            value={isLoading ? "..." : `TZS ${todayRevenue.toLocaleString()}`}
            change={isLoading ? "Loading..." : `${todayOrders.length} orders today`}
            changeType="positive"
            icon={DollarSign}
            iconColor="primary"
          />
          <StatCard
            title="Weekly Revenue"
            value={isLoading ? "..." : `TZS ${weeklyStats.totalRevenue.toLocaleString()}`}
            change={isLoading ? "Loading..." : `${weeklyStats.totalOrders} orders this week`}
            changeType="neutral"
            icon={TrendingUp}
            iconColor="success"
          />
          <StatCard
            title="Pending Requests"
            value={isLoading ? "..." : String(pendingRequests.length)}
            change={isLoading ? "Loading..." : "stock requests"}
            changeType={pendingRequests.length > 0 ? "negative" : "positive"}
            icon={Clock}
            iconColor="warning"
          />
           <StatCard
            title="Low Stock Items"
            value={isLoading ? "..." : String(lowStockItems.length)}
            change={isLoading ? "Loading..." : "items need restock"}
            changeType={lowStockItems.length > 0 ? "negative" : "positive"}
            icon={AlertTriangle}
            iconColor="destructive"
          />
        </div>


        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RevenueChart orders={weeklyOrders} isLoading={loadingWeeklyOrders} />
          </div>
          <PopularItems orders={weeklyOrders} isLoading={loadingWeeklyOrders} />
        </div>

        {/* Orders and Reservations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentOrders orders={recentOrders} isLoading={loadingRecentOrders} />
          <UpcomingReservations reservations={upcomingReservations} isLoading={loadingReservations} />
        </div>
      </div>
    </MainLayout>
  );
}
