import { useState, lazy, Suspense } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Lazy load tab components
const OrdersReports = lazy(() => import("@/components/reports/OrdersReports"));
const PurchasesReports = lazy(() => import("@/components/reports/PurchasesReports"));
const InventoryReports = lazy(() => import("@/components/reports/InventoryReports"));
const AccountingReports = lazy(() => import("@/components/reports/AccountingReports"));

// Loading fallback
const TabLoading = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

export default function Reports() {
  // State for date range
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });

  return (
    <MainLayout title="Reports" subtitle="Generate and export reports">
      <div className="space-y-6 animate-fade-in">
        {/* Tabs for Reports */}
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="purchases">Purchases</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="accounting">Accounting</TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Suspense fallback={<TabLoading />}>
              <OrdersReports 
                dateRange={dateRange} 
                onDateRangeChange={setDateRange} 
              />
            </Suspense>
          </TabsContent>

          {/* Purchases Tab */}
          <TabsContent value="purchases">
            <Suspense fallback={<TabLoading />}>
              <PurchasesReports 
                dateRange={dateRange} 
                onDateRangeChange={setDateRange} 
              />
            </Suspense>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory">
            <Suspense fallback={<TabLoading />}>
              <InventoryReports 
                dateRange={dateRange} 
                onDateRangeChange={setDateRange} 
              />
            </Suspense>
          </TabsContent>

          {/* Accounting Tab */}
          <TabsContent value="accounting">
            <Suspense fallback={<TabLoading />}>
              <AccountingReports 
                dateRange={dateRange} 
                onDateRangeChange={setDateRange} 
              />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
