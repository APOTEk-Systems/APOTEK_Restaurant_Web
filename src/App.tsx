import React, { lazy, Suspense } from 'react';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Lazy-loaded page components for code splitting and faster initial load
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Orders = lazy(() => import('./pages/Orders'));
const OrderNew = lazy(() => import('./pages/OrderNew'));
const OrderPay = lazy(() => import('./pages/OrderPay'));
const OrdersHistory = lazy(() => import('./pages/OrdersHistory'));
const Kitchen = lazy(() => import('./pages/Kitchen'));
const KitchenOrders = lazy(() => import('./pages/KitchenOrders'));
const KitchenMenu = lazy(() => import('./pages/KitchenMenu'));
const KitchenInventory = lazy(() => import('./pages/KitchenInventory'));
const KitchenDissatisfactions = lazy(
	() => import('./pages/KitchenDissatisfactions'),
);
const Bar = lazy(() => import('./pages/Bar'));
const BarOrders = lazy(() => import('./pages/BarOrders'));
const BarMenu = lazy(() => import('./pages/BarMenu'));
const BarInventory = lazy(() => import('./pages/BarInventory'));
const BarReturns = lazy(() => import('./pages/BarReturns'));
const Menu = lazy(() => import('./pages/Menu'));
const MenuNew = lazy(() => import('./pages/MenuNew'));
const Reservations = lazy(() => import('./pages/Reservations'));
const ReservationNew = lazy(() => import('./pages/ReservationNew'));
const Inventory = lazy(() => import('./pages/Inventory'));
const InventoryNew = lazy(() => import('./pages/InventoryNew'));
const InventoryEdit = lazy(() => import('./pages/InventoryEdit'));
const InventoryAdjustments = lazy(() => import('./pages/InventoryAdjustments'));
const InventoryRequests = lazy(() => import('./pages/InventoryRequests'));
const InventoryRequestDetail = lazy(
	() => import('./pages/InventoryRequestDetail'),
);
const StockRequestNew = lazy(() => import('./pages/StockRequestNew'));
const ExpiringProducts = lazy(() => import('./pages/ExpiringProducts'));
const Purchases = lazy(() => import('./pages/Purchases'));
const PurchaseOrderNew = lazy(() => import('./pages/PurchaseOrderNew'));
const GoodsReceiving = lazy(() => import('./pages/GoodsReceiving'));
const GoodsReceivingDetail = lazy(() => import('./pages/GoodsReceivingDetail'));
const Suppliers = lazy(() => import('./pages/Suppliers'));
const SettingsInventoryCategories = lazy(
	() => import('./pages/SettingsInventoryCategories'),
);
const SettingsMenuCategories = lazy(
	() => import('./pages/SettingsMenuCategories'),
);
const Staff = lazy(() => import('./pages/Staff'));
const StaffNew = lazy(() => import('./pages/StaffNew'));
const StaffEdit = lazy(() => import('./pages/StaffEdit'));
const Users = lazy(() => import('./pages/Users'));
const UserNew = lazy(() => import('./pages/UserNew'));
const Roles = lazy(() => import('./pages/Roles'));
const RoleNew = lazy(() => import('./pages/RoleNew'));
const Accounting = lazy(() => import('./pages/Accounting'));
const AccountingExpenses = lazy(() => import('./pages/AccountingExpenses'));
const Reports = lazy(() => import('./pages/Reports'));
const SettingsRestaurantInfo = lazy(
	() => import('./pages/SettingsRestaurantInfo'),
);
const SettingsConfigurations = lazy(
	() => import('./pages/SettingsConfigurations'),
);
const SettingsAdjustmentReasons = lazy(
	() => import('./pages/SettingsAdjustmentReasons'),
);
const SettingsExpenseCategories = lazy(
	() => import('./pages/SettingsExpenseCategories'),
);
const SettingsUnits = lazy(() => import('./pages/SettingsUnits'));
const SettingsAlerts = lazy(() => import('./pages/SettingsAlerts'));
const SettingsTables = lazy(() => import('./pages/SettingsTables'));
const SettingsDepartments = lazy(() => import('./pages/SettingsDepartments'));
const SettingsStaffRoles = lazy(() => import('./pages/SettingsStaffRoles'));
const NotFound = lazy(() => import('./pages/NotFound'));
const PurchaseOrderDetail = lazy(() => import('./pages/PurchaseOrderDetail'));
const GoodsReceivingNew = lazy(() => import('./pages/GoodsReceivingNew'));

const queryClient = new QueryClient();

// Loading fallback component for Suspense
const Loading = () => (
	<div className='flex flex-col items-center justify-center min-h-screen'>
		<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
		<p>Apotek Restaurant Loading</p>
	</div>
);

const App = () => (
	<QueryClientProvider client={queryClient}>
		<AuthProvider>
			<TooltipProvider>
				<Toaster />
				<Sonner />
				<BrowserRouter>
					<Suspense fallback={<Loading />}>
						<Routes>
							{/* Public route - Login */}
							<Route
								path='/login'
								element={<Login />}
							/>

							{/* Protected routes */}
							<Route
								path='/'
								element={
									<ProtectedRoute>
										<Dashboard />
									</ProtectedRoute>
								}
							/>
							<Route
								path='/orders'
								element={
									<ProtectedRoute>
										<Orders />
									</ProtectedRoute>
								}
							/>
							<Route
								path='/orders/new'
								element={
									<ProtectedRoute>
										<OrderNew />
									</ProtectedRoute>
								}
							/>
							<Route
								path='/orders/history'
								element={
									<ProtectedRoute>
										<OrdersHistory />
									</ProtectedRoute>
								}
							/>
							<Route
								path='/order/:id/pay'
								element={
									<ProtectedRoute>
										<OrderPay />
									</ProtectedRoute>
								}
							/>
							<Route
								path='/kitchen'
								element={
									<ProtectedRoute>
										<Kitchen />
									</ProtectedRoute>
								}
							/>
							<Route
								path='/kitchen/orders'
								element={
									<ProtectedRoute>
										<KitchenOrders />
									</ProtectedRoute>
								}
							/>
							<Route
								path='/kitchen/menu'
								element={
									<ProtectedRoute>
										<KitchenMenu />
									</ProtectedRoute>
								}
							/>
							<Route
								path='/kitchen/inventory'
								element={
									<ProtectedRoute>
										<KitchenInventory />
									</ProtectedRoute>
								}
							/>
							<Route
								path='/kitchen/issues'
								element={
									<ProtectedRoute>
										<KitchenDissatisfactions />
									</ProtectedRoute>
								}
							/>
							<Route
								path='/bar'
								element={
									<ProtectedRoute>
										<Bar />
									</ProtectedRoute>
								}
							/>
							<Route
								path='/bar/orders'
								element={
									<ProtectedRoute>
										<BarOrders />
									</ProtectedRoute>
								}
							/>
							<Route
								path='/bar/menu'
								element={
									<ProtectedRoute>
										<BarMenu />
									</ProtectedRoute>
								}
							/>
							<Route
								path='/bar/inventory'
								element={
									<ProtectedRoute>
										<BarInventory />
									</ProtectedRoute>
								}
							/>
							<Route
								path='/bar/issues'
								element={
									<ProtectedRoute>
										<BarReturns />
									</ProtectedRoute>
								}
							/>
							<Route
								path='/menu'
								element={
									<ProtectedRoute>
										<Menu />
									</ProtectedRoute>
								}
							/>
							<Route
								path='/menu/new'
								element={
									<ProtectedRoute>
										<MenuNew />
									</ProtectedRoute>
								}
							/>
							<Route
								path='/reservations'
								element={
									<ProtectedRoute>
										<Reservations />
									</ProtectedRoute>
								}
							/>
							<Route
								path='/reservations/new'
								element={
									<ProtectedRoute>
										<ReservationNew />
									</ProtectedRoute>
								}
							/>
							<Route
								path='/inventory'
								element={
									<ProtectedRoute>
										<Inventory />
									</ProtectedRoute>
								}
							/>
							<Route
								path='/inventory/new'
								element={
									<ProtectedRoute>
										<InventoryNew />
									</ProtectedRoute>
								}
							/>
							<Route
								path='/inventory/edit/:id'
								element={
									<ProtectedRoute>
										<InventoryEdit />
									</ProtectedRoute>
								}
							/>
							<Route
								path='/inventory/adjustments'
								element={
									<ProtectedRoute>
										<InventoryAdjustments />
									</ProtectedRoute>
								}
							/>
							<Route
								path='/inventory/requests'
								element={
									<ProtectedRoute>
										<InventoryRequests />
									</ProtectedRoute>
								}
							/>
							<Route
								path='/inventory/requests/:id'
								element={
									<ProtectedRoute>
										<InventoryRequestDetail />
									</ProtectedRoute>
								}
							/>
							<Route
								path='/inventory-requests/new'
								element={
									<ProtectedRoute>
										<StockRequestNew />
									</ProtectedRoute>
								}
							/>
							<Route
								path='/inventory/expiring'
								element={
									<ProtectedRoute>
										<ExpiringProducts />
									</ProtectedRoute>
								}
							/>
							<Route
								path='/purchases'
								element={
									<ProtectedRoute>
										<Purchases />
									</ProtectedRoute>
								}
							/>
							<Route
								path='/purchases/receiving'
								element={
									<ProtectedRoute>
										<GoodsReceiving />
									</ProtectedRoute>
								}
							/>
							<Route
								path='/purchases/receiving/view/:id'
								element={
									<ProtectedRoute>
										<GoodsReceivingDetail />
									</ProtectedRoute>
								}
							/>
							<Route
								path='/purchases/receiving/new/:id'
								element={
									<ProtectedRoute>
										<GoodsReceivingNew />
									</ProtectedRoute>
								}
							/>
							<Route
								path='/purchases/suppliers'
								element={
									<ProtectedRoute>
										<Suppliers />
									</ProtectedRoute>
								}
							/>
							<Route
								path='/purchases/new'
								element={
									<ProtectedRoute>
										<PurchaseOrderNew />
									</ProtectedRoute>
								}
							/>
							<Route
								path='/purchases/:id'
								element={
									<ProtectedRoute>
										<PurchaseOrderDetail />
									</ProtectedRoute>
								}
							/>
							<Route
								path='/staff'
								element={
									<ProtectedRoute>
										<Staff />
									</ProtectedRoute>
								}
							/>
							<Route
								path='/staff/new'
								element={
									<ProtectedRoute>
										<StaffNew />
									</ProtectedRoute>
								}
							/>
							<Route
								path='/staff/edit/:id'
								element={
									<ProtectedRoute>
										<StaffEdit />
									</ProtectedRoute>
								}
							/>
							<Route
								path='/users'
								element={
									<ProtectedRoute>
										<Users />
									</ProtectedRoute>
								}
							/>
							<Route
								path='/users/new'
								element={
									<ProtectedRoute>
										<UserNew />
									</ProtectedRoute>
								}
							/>
							<Route
								path='/users/roles'
								element={
									<ProtectedRoute>
										<Roles />
									</ProtectedRoute>
								}
							/>
							<Route
								path='/users/roles/new'
								element={
									<ProtectedRoute>
										<RoleNew />
									</ProtectedRoute>
								}
							/>
							<Route
								path='/users/roles/edit/:id'
								element={
									<ProtectedRoute>
										<RoleNew />
									</ProtectedRoute>
								}
							/>
							<Route
								path='/accounting'
								element={
									<ProtectedRoute>
										<Accounting />
									</ProtectedRoute>
								}
							/>
							<Route
								path='/accounting/expenses'
								element={
									<ProtectedRoute>
										<AccountingExpenses />
									</ProtectedRoute>
								}
							/>
							<Route
								path='/reports'
								element={
									<ProtectedRoute>
										<Reports />
									</ProtectedRoute>
								}
							/>
							<Route
								path='/settings'
								element={
									<ProtectedRoute>
										<SettingsRestaurantInfo />
									</ProtectedRoute>
								}
							/>
							<Route
								path='/settings/configurations'
								element={
									<ProtectedRoute>
										<SettingsConfigurations />
									</ProtectedRoute>
								}
							/>
							<Route
								path='/settings/tables'
								element={
									<ProtectedRoute>
										<SettingsTables />
									</ProtectedRoute>
								}
							/>
							<Route
								path='/settings/adjustment-reasons'
								element={
									<ProtectedRoute>
										<SettingsAdjustmentReasons />
									</ProtectedRoute>
								}
							/>
							<Route
								path='/settings/expense-categories'
								element={
									<ProtectedRoute>
										<SettingsExpenseCategories />
									</ProtectedRoute>
								}
							/>
							<Route
								path='/settings/units'
								element={
									<ProtectedRoute>
										<SettingsUnits />
									</ProtectedRoute>
								}
							/>
							<Route
								path='/settings/alerts'
								element={
									<ProtectedRoute>
										<SettingsAlerts />
									</ProtectedRoute>
								}
							/>
							<Route
								path='/settings/inventory-categories'
								element={
									<ProtectedRoute>
										<SettingsInventoryCategories />
									</ProtectedRoute>
								}
							/>
							<Route
								path='/settings/menu-categories'
								element={
									<ProtectedRoute>
										<SettingsMenuCategories />
									</ProtectedRoute>
								}
							/>
							<Route
								path='/settings/departments'
								element={
									<ProtectedRoute>
										<SettingsDepartments />
									</ProtectedRoute>
								}
							/>
							<Route
								path='/settings/staff-roles'
								element={
									<ProtectedRoute>
										<SettingsStaffRoles />
									</ProtectedRoute>
								}
							/>

							{/* 404 - Not Found */}
							<Route
								path='*'
								element={<NotFound />}
							/>
						</Routes>
					</Suspense>
				</BrowserRouter>
			</TooltipProvider>
		</AuthProvider>
	</QueryClientProvider>
);

export default App;
