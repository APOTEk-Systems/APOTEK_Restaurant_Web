import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import OrderNew from './pages/OrderNew';
import OrderPay from './pages/OrderPay';
import OrdersHistory from './pages/OrdersHistory';
import Kitchen from './pages/Kitchen';
import KitchenOrders from './pages/KitchenOrders';
import KitchenMenu from './pages/KitchenMenu';
import KitchenMenuEdit from './pages/kitchen/MenuEdit';
import AddonEdit from './pages/kitchen/AddonEdit';
import SideDishEdit from './pages/kitchen/SideDishEdit';
import KitchenInventory from './pages/KitchenInventory';
import KitchenDissatisfactions from './pages/KitchenDissatisfactions';
import Bar from './pages/Bar';
import BarOrders from './pages/BarOrders';
import BarMenu from './pages/BarMenu';
import BarMenuEdit from './pages/bar/MenuEdit';
import BarInventory from './pages/BarInventory';
import BarReturns from './pages/BarReturns';
import Menu from './pages/Menu';
import MenuEdit from './pages/MenuEdit';
import MenuNew from './pages/MenuNew';
import Reservations from './pages/Reservations';
import ReservationNew from './pages/ReservationNew';
import Inventory from './pages/Inventory';
import InventoryNew from './pages/InventoryNew';
import InventoryAdjustments from './pages/InventoryAdjustments';
import InventoryAdjustmentNew from './pages/InventoryAdjustmentNew';
import InventoryRequests from './pages/InventoryRequests';
import ExpiringProducts from './pages/ExpiringProducts';
import Purchases from './pages/Purchases';
import PurchaseOrderNew from './pages/PurchaseOrderNew';
import GoodsReceiving from './pages/GoodsReceiving';
import Suppliers from './pages/Suppliers';
import Staff from './pages/Staff';
import StaffNew from './pages/StaffNew';
import Users from './pages/Users';
import UserNew from './pages/UserNew';
import Roles from './pages/Roles';
import RoleNew from './pages/RoleNew';
import Accounting from './pages/Accounting';
import AccountingExpenses from './pages/AccountingExpenses';
import Reports from './pages/Reports';
import SettingsRestaurantInfo from './pages/SettingsRestaurantInfo';
import SettingsConfigurations from './pages/SettingsConfigurations';
import SettingsAdjustmentReasons from './pages/SettingsAdjustmentReasons';
import SettingsExpenseCategories from './pages/SettingsExpenseCategories';
import SettingsUnits from './pages/SettingsUnits';
import SettingsAlerts from './pages/SettingsAlerts';
import SettingsTables from './pages/SettingsTables';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

const App = () => (
	<QueryClientProvider client={queryClient}>
		<TooltipProvider>
			<Toaster />
			<Sonner />
			<BrowserRouter>
				<Routes>
					<Route
						path='/'
						element={<Dashboard />}
					/>
					<Route
						path='/orders'
						element={<Orders />}
					/>
					<Route
						path='/orders/new'
						element={<OrderNew />}
					/>
					<Route
						path='/orders/history'
						element={<OrdersHistory />}
					/>
					<Route
						path='/order/:id/pay'
						element={<OrderPay />}
					/>
					<Route
						path='/kitchen'
						element={<Kitchen />}
					/>
					<Route
						path='/kitchen/orders'
						element={<KitchenOrders />}
					/>
					<Route
						path='/kitchen/menu'
						element={<KitchenMenu />}
					/>
					<Route
						path='/kitchen/menu/:id'
						element={<KitchenMenuEdit />}
					/>
					<Route
						path='/kitchen/menu/addons/:id'
						element={<AddonEdit />}
					/>
					<Route
						path='/kitchen/menu/side-dishes/:id'
						element={<SideDishEdit />}
					/>
					<Route
						path='/kitchen/inventory'
						element={<KitchenInventory />}
					/>
					<Route
						path='/kitchen/dissatisfactions'
						element={<KitchenDissatisfactions />}
					/>
					<Route
						path='/bar'
						element={<Bar />}
					/>
					<Route
						path='/bar/orders'
						element={<BarOrders />}
					/>
					<Route
						path='/bar/menu'
						element={<BarMenu />}
					/>
					<Route
						path='/bar/menu/:id'
						element={<BarMenuEdit />}
					/>
					<Route
						path='/bar/inventory'
						element={<BarInventory />}
					/>
					<Route
						path='/bar/returns'
						element={<BarReturns />}
					/>
					<Route
						path='/menu'
						element={<Menu />}
					/>
					<Route
						path='/menu/:id'
						element={<MenuEdit />}
					/>
					<Route
						path='/menu/new'
						element={<MenuNew />}
					/>
					<Route
						path='/reservations'
						element={<Reservations />}
					/>
					<Route
						path='/reservations/new'
						element={<ReservationNew />}
					/>
					<Route
						path='/inventory'
						element={<Inventory />}
					/>
					<Route
						path='/inventory/new'
						element={<InventoryNew />}
					/>
					<Route
						path='/inventory/adjustments'
						element={<InventoryAdjustments />}
					/>
					<Route
						path='/inventory-adjustments'
						element={<InventoryAdjustments />}
					/>
					<Route
						path='/inventory-adjustments/new'
						element={<InventoryAdjustmentNew />}
					/>
					<Route
						path='/inventory/adjustments/new'
						element={<InventoryAdjustmentNew />}
					/>
					<Route
						path='/inventory/requests'
						element={<InventoryRequests />}
					/>
					<Route
						path='/inventory/expiring'
						element={<ExpiringProducts />}
					/>
					<Route
						path='/purchases'
						element={<Purchases />}
					/>
					<Route
						path='/purchases/receiving'
						element={<GoodsReceiving />}
					/>
					<Route
						path='/purchases/suppliers'
						element={<Suppliers />}
					/>
					<Route
						path='/purchases/new'
						element={<PurchaseOrderNew />}
					/>
					<Route
						path='/staff'
						element={<Staff />}
					/>
					<Route
						path='/staff/new'
						element={<StaffNew />}
					/>
					<Route
						path='/users'
						element={<Users />}
					/>
					<Route
						path='/users/new'
						element={<UserNew />}
					/>
					<Route
						path='/users/roles'
						element={<Roles />}
					/>
					<Route
						path='/users/roles/new'
						element={<RoleNew />}
					/>
					<Route
						path='/accounting'
						element={<Accounting />}
					/>
					<Route
						path='/accounting/expenses'
						element={<AccountingExpenses />}
					/>
					<Route
						path='/reports'
						element={<Reports />}
					/>
					<Route
						path='/settings'
						element={<SettingsRestaurantInfo />}
					/>
					<Route
						path='/settings/configurations'
						element={<SettingsConfigurations />}
					/>
					<Route
						path='/settings/tables'
						element={<SettingsTables />}
					/>
					<Route
						path='/settings/adjustment-reasons'
						element={<SettingsAdjustmentReasons />}
					/>
					<Route
						path='/settings/expense-categories'
						element={<SettingsExpenseCategories />}
					/>
					<Route
						path='/settings/units'
						element={<SettingsUnits />}
					/>
					<Route
						path='/settings/alerts'
						element={<SettingsAlerts />}
					/>
					<Route
						path='*'
						element={<NotFound />}
					/>
				</Routes>
			</BrowserRouter>
		</TooltipProvider>
	</QueryClientProvider>
);

export default App;
