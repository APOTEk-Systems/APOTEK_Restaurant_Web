import React, { lazy, Suspense } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Lazy-loaded page components for code splitting and faster initial load
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Orders = lazy(() => import("./pages/Orders"));
const OrderNew = lazy(() => import("./pages/OrderNew"));
const OrderPay = lazy(() => import("./pages/OrderPay"));
const OrdersHistory = lazy(() => import("./pages/OrdersHistory"));
const Kitchen = lazy(() => import("./pages/Kitchen"));
const KitchenOrders = lazy(() => import("./pages/KitchenOrders"));
const KitchenMenu = lazy(() => import("./pages/KitchenMenu"));
const KitchenInventory = lazy(() => import("./pages/KitchenInventory"));
const KitchenDissatisfactions = lazy(() => import("./pages/KitchenDissatisfactions"));
const Bar = lazy(() => import("./pages/Bar"));
const BarOrders = lazy(() => import("./pages/BarOrders"));
const BarMenu = lazy(() => import("./pages/BarMenu"));
const BarInventory = lazy(() => import("./pages/BarInventory"));
const BarReturns = lazy(() => import("./pages/BarReturns"));
const Menu = lazy(() => import("./pages/Menu"));
const MenuNew = lazy(() => import("./pages/MenuNew"));
const Reservations = lazy(() => import("./pages/Reservations"));
const ReservationNew = lazy(() => import("./pages/ReservationNew"));
const Inventory = lazy(() => import("./pages/Inventory"));
const InventoryNew = lazy(() => import("./pages/InventoryNew"));
const InventoryEdit = lazy(() => import("./pages/InventoryEdit"));
const InventoryAdjustments = lazy(() => import("./pages/InventoryAdjustments"));
const InventoryRequests = lazy(() => import("./pages/InventoryRequests"));
const InventoryRequestDetail = lazy(() => import("./pages/InventoryRequestDetail"));
const StockRequestNew = lazy(() => import("./pages/StockRequestNew"));
const ExpiringProducts = lazy(() => import("./pages/ExpiringProducts"));
const Purchases = lazy(() => import("./pages/Purchases"));
const PurchaseOrderNew = lazy(() => import("./pages/PurchaseOrderNew"));
const GoodsReceiving = lazy(() => import("./pages/GoodsReceiving"));
const GoodsReceivingDetail = lazy(() => import("./pages/GoodsReceivingDetail"));
const Suppliers = lazy(() => import("./pages/Suppliers"));
const SettingsInventoryCategories = lazy(() => import("./pages/SettingsInventoryCategories"));
const SettingsMenuCategories = lazy(() => import("./pages/SettingsMenuCategories"));
const Staff = lazy(() => import("./pages/Staff"));
const StaffNew = lazy(() => import("./pages/StaffNew"));
const Users = lazy(() => import("./pages/Users"));
const UserNew = lazy(() => import("./pages/UserNew"));
const Roles = lazy(() => import("./pages/Roles"));
const RoleNew = lazy(() => import("./pages/RoleNew"));
const Accounting = lazy(() => import("./pages/Accounting"));
const AccountingExpenses = lazy(() => import("./pages/AccountingExpenses"));
const Reports = lazy(() => import("./pages/Reports"));
const SettingsRestaurantInfo = lazy(() => import("./pages/SettingsRestaurantInfo"));
const SettingsConfigurations = lazy(() => import("./pages/SettingsConfigurations"));
const SettingsAdjustmentReasons = lazy(() => import("./pages/SettingsAdjustmentReasons"));
const SettingsExpenseCategories = lazy(() => import("./pages/SettingsExpenseCategories"));
const SettingsUnits = lazy(() => import("./pages/SettingsUnits"));
const SettingsAlerts = lazy(() => import("./pages/SettingsAlerts"));
const SettingsTables = lazy(() => import("./pages/SettingsTables"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PurchaseOrderDetail = lazy(() => import("./pages/PurchaseOrderDetail"));
const GoodsReceivingNew = lazy(() => import("./pages/GoodsReceivingNew"));

const queryClient = new QueryClient();

// Loading fallback component for Suspense
const Loading = () => (
  <div className="flex flex-col items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    <p>Apotek Restaurant Loading</p>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/new" element={<OrderNew />} />
            <Route path="/orders/history" element={<OrdersHistory />} />
            <Route path="/order/:id/pay" element={<OrderPay />} />
            <Route path="/kitchen" element={<Kitchen />} />
            <Route path="/kitchen/orders" element={<KitchenOrders />} />
            <Route path="/kitchen/menu" element={<KitchenMenu />} />
            <Route path="/kitchen/inventory" element={<KitchenInventory />} />
            <Route path="/kitchen/dissatisfactions" element={<KitchenDissatisfactions />} />
            <Route path="/bar" element={<Bar />} />
            <Route path="/bar/orders" element={<BarOrders />} />
            <Route path="/bar/menu" element={<BarMenu />} />
            <Route path="/bar/inventory" element={<BarInventory />} />
            <Route path="/bar/returns" element={<BarReturns />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/menu/new" element={<MenuNew />} />
            <Route path="/reservations" element={<Reservations />} />
            <Route path="/reservations/new" element={<ReservationNew />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/inventory/new" element={<InventoryNew />} />
            <Route path="/inventory/edit/:id" element={<InventoryEdit />} />
            <Route path="/inventory/adjustments" element={<InventoryAdjustments />} />
            <Route path="/inventory/requests" element={<InventoryRequests />} />
            <Route path="/inventory/requests/:id" element={<InventoryRequestDetail />} />
            <Route path="/inventory-requests/new" element={<StockRequestNew />} />
            <Route path="/inventory/expiring" element={<ExpiringProducts />} />
            <Route path="/purchases" element={<Purchases />} />
            <Route path="/purchases/receiving" element={<GoodsReceiving />} />
            <Route path="/purchases/receiving/view/:id" element={<GoodsReceivingDetail />} />
            <Route path="/purchases/receiving/new/:id" element={<GoodsReceivingNew />} />
            <Route path="/purchases/suppliers" element={<Suppliers />} />
            <Route path="/purchases/new" element={<PurchaseOrderNew />} />
            <Route path="/purchases/:id" element={<PurchaseOrderDetail />} />
            <Route path="/staff" element={<Staff />} />
            <Route path="/staff/new" element={<StaffNew />} />
            <Route path="/users" element={<Users />} />
            <Route path="/users/new" element={<UserNew />} />
            <Route path="/users/roles" element={<Roles />} />
            <Route path="/users/roles/new" element={<RoleNew />} />
            <Route path="/accounting" element={<Accounting />} />
            <Route path="/accounting/expenses" element={<AccountingExpenses />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<SettingsRestaurantInfo />} />
            <Route path="/settings/configurations" element={<SettingsConfigurations />} />
            <Route path="/settings/tables" element={<SettingsTables />} />
            <Route path="/settings/adjustment-reasons" element={<SettingsAdjustmentReasons />} />
            <Route path="/settings/expense-categories" element={<SettingsExpenseCategories />} />
            <Route path="/settings/units" element={<SettingsUnits />} />
            <Route path="/settings/alerts" element={<SettingsAlerts />} />
            <Route path="/settings/inventory-categories" element={<SettingsInventoryCategories />} />
            <Route path="/settings/menu-categories" element={<SettingsMenuCategories />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
