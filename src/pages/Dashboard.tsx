import { MainLayout } from "@/components/layout/MainLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentOrders } from "@/components/dashboard/RecentOrders";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { PopularItems } from "@/components/dashboard/PopularItems";
import { UpcomingReservations } from "@/components/dashboard/UpcomingReservations";
import { DollarSign, ShoppingBag, Users, TrendingUp } from "lucide-react";

export default function Dashboard() {
  return (
    <MainLayout title="Dashboard" subtitle="Welcome back, John! Here's what's happening today.">
      <div className="space-y-6 animate-fade-in">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Today's Revenue"
            value={(4856 * 2400).toLocaleString('en-US', {  })}
            change="+12.5% from yesterday"
            changeType="positive"
            icon={DollarSign}
            iconColor="primary"
          />
          <StatCard
            title="Total Orders"
            value="156"
            change="+8 from yesterday"
            changeType="positive"
            icon={ShoppingBag}
            iconColor="success"
          />
          <StatCard
            title="Active Tables"
            value="18/24"
            change="6 available"
            changeType="neutral"
            icon={Users}
            iconColor="warning"
          />
          <StatCard
            title="Avg. Order Value"
            value={(31.13 * 2400).toLocaleString('en-US',)}
            change="+4.2% this week"
            changeType="positive"
            icon={TrendingUp}
            iconColor="primary"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RevenueChart />
          </div>
          <PopularItems />
        </div>

        {/* Orders and Reservations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentOrders />
          <UpcomingReservations />
        </div>
      </div>
    </MainLayout>
  );
}
