import { useState } from 'react';
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
	UserCog,
	Store,
	Wrench,
	ListChecks,
	Wallet,
	Ruler,
	Bell,
	Grid3X3,
	Menu,
	ArrowLeft,
} from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogoutConfirmDialog } from '@/components/LogoutConfirmDialog';
import { authService } from '@/services/authService';

import { Receipt } from 'lucide-react';

const menuItems = [
	{ title: 'Dashboard', url: '/', icon: LayoutDashboard, permission: '' },
	{ title: 'Menu', url: '/menu', icon: UtensilsCrossed, permission: 'menu.view' },
	{ title: 'Reservations', url: '/reservations', icon: CalendarDays, permission: 'reservations.view' },
	{ title: 'Reports', url: '/reports', icon: BarChart3, permission: 'reports.view' },
];

const accountingSubItems = [
	{ title: 'Overview', url: '/accounting', icon: Calculator, permission: 'accounting.view' },
	{ title: 'Expenses', url: '/accounting/expenses', icon: Receipt, permission: 'accounting.view' },
];

const orderSubItems = [
	{ title: 'New Order', url: '/orders/new', icon: Plus, permission: 'orders.create_new' },
	{ title: 'Current Orders', url: '/orders', icon: Clock, permission: 'orders.view_current' },
	{ title: 'Orders History', url: '/orders/history', icon: History, permission: 'orders.view_history' },
];

const kitchenSubItems = [
	{ title: 'Orders', url: '/kitchen/orders', icon: ClipboardList, permission: 'kitchen.manage_orders' },
	{ title: 'Menu', url: '/kitchen/menu', icon: UtensilsCrossed, permission: 'kitchen.view_menu' },
	{ title: 'Inventory', url: '/kitchen/inventory', icon: Package, permission: 'kitchen.view_inventory' },
	{ title: 'Issues', url: '/kitchen/issues', icon: AlertTriangle, permission: 'kitchen.order_issues' },
];

const barSubItems = [
	{ title: 'Orders', url: '/bar/orders', icon: ClipboardList, permission: 'bar.manage_orders' },
	{ title: 'Menu', url: '/bar/menu', icon: UtensilsCrossed, permission: 'bar.view_menu' },
	{ title: 'Inventory', url: '/bar/inventory', icon: Package, permission: 'bar.view_inventory' },
	{ title: 'Issues', url: '/bar/issues', icon: AlertTriangle, permission: 'bar.order_issues' },
];

const inventorySubItems = [
	{ title: 'Current Stock', url: '/inventory', icon: Layers, permission: 'inventory.view_current_stock' },
	{ title: 'Adjustments', url: '/inventory/adjustments', icon: ArrowUpDown, permission: 'inventory.view_adjustments' },
	{ title: 'Requests', url: '/inventory/requests', icon: MessageSquare, permission: 'inventory.view_requests' },
	{
		title: 'Expiring Products',
		url: '/inventory/expiring',
		icon: AlertTriangle,
		permission: 'inventory.view_expiring',
	},
];

const userSubItems = [
	{ title: 'Users', url: '/users', icon: Users, permission: 'users.view' },
	{ title: 'Roles', url: '/users/roles', icon: Shield, permission: 'roles.view' },
];

const purchaseSubItems = [
	{ title: 'New Purchase Order', url: '/purchases/new', icon: Plus, permission: 'purchases.create_orders' },
	{ title: 'Purchase Orders', url: '/purchases', icon: FileText, permission: 'purchases.view_orders' },
	{ title: 'Goods Received', url: '/purchases/receiving', icon: PackageCheck, permission: 'purchases.receive_goods' },
	{ title: 'Suppliers', url: '/purchases/suppliers', icon: Users, permission: 'purchases.view_suppliers' },
];

const settingsSubItems = [
	{ title: 'Restaurant Info', url: '/settings', icon: Store, permission: 'settings.view_business_information' },
	{ title: 'Configurations', url: '/settings/configurations', icon: Wrench, permission: 'settings.view_configurations' },
	{ title: 'Tables', url: '/settings/tables', icon: Grid3X3, permission: 'tables.view' },
	{ title: 'Departments', url: '/settings/departments', icon: Building2, permission: 'departments.view' },
	{ title: 'Staff Roles', url: '/settings/staff-roles', icon: UserCog, permission: 'roles.view' },
	{
		title: 'Inventory Categories',
		url: '/settings/inventory-categories',
		icon: Package,
		permission: 'inventory.view_current_stock',
	},
	{
		title: 'Menu Categories',
		url: '/settings/menu-categories',
		icon: UtensilsCrossed,
		permission: 'menu.view',
	},
	{
		title: 'Adjustment Reasons',
		url: '/settings/adjustment-reasons',
		icon: ListChecks,
		permission: 'inventory.view_adjustments',
	},
	{
		title: 'Expense Categories',
		url: '/settings/expense-categories',
		icon: Wallet,
		permission: 'accounting.view',
	},
	{ title: 'Units', url: '/settings/units', icon: Ruler, permission: 'inventory.view_current_stock' },
	{ title: 'Alerts', url: '/settings/alerts', icon: Bell, permission: 'settings.view_alerts' },
];

export function AppSidebar({
	collapsed = false,
	onToggle,
}: {
	collapsed?: boolean;
	onToggle?: () => void;
}) {
	const location = useLocation();
	const navigate = useNavigate();
	const { user, logout } = useAuth();
	const storedUser = authService.getUser();
	const effectiveUser = user || storedUser;
	const userPermissions = (effectiveUser?.permissions || []) as string[];
	const hasWildcard = userPermissions.includes('*') || userPermissions.includes('admin');

	const hasPermission = (required?: string): boolean => {
		if (!required) return true;
		if (hasWildcard) return true;
		return userPermissions.includes(required);
	};

	const visibleMenuItems = menuItems.filter(item => hasPermission(item.permission));
	const visibleOrderSubItems = orderSubItems.filter(item => hasPermission(item.permission));
	const visibleKitchenSubItems = kitchenSubItems.filter(item => hasPermission(item.permission));
	const visibleBarSubItems = barSubItems.filter(item => hasPermission(item.permission));
	const visibleInventorySubItems = inventorySubItems.filter(item => hasPermission(item.permission));
	const visibleUserSubItems = userSubItems.filter(item => hasPermission(item.permission));
	const visiblePurchaseSubItems = purchaseSubItems.filter(item => hasPermission(item.permission));
	const visibleAccountingSubItems = accountingSubItems.filter(item => hasPermission(item.permission));
	const visibleSettingsSubItems = settingsSubItems.filter(item => hasPermission(item.permission));
	const isOrdersActive = location.pathname.startsWith('/orders');
	const isKitchenActive = location.pathname.startsWith('/kitchen');
	const isBarActive = location.pathname.startsWith('/bar');
	const isInventoryActive = location.pathname.startsWith('/inventory');
	const isUsersActive = location.pathname.startsWith('/users');
	const isPurchasesActive = location.pathname.startsWith('/purchases');
	const isAccountingActive = location.pathname.startsWith('/accounting');
	const isSettingsActive = location.pathname.startsWith('/settings');
	const [ordersOpen, setOrdersOpen] = useState(isOrdersActive);
	const [kitchenOpen, setKitchenOpen] = useState(isKitchenActive);
	const [barOpen, setBarOpen] = useState(isBarActive);
	const [inventoryOpen, setInventoryOpen] = useState(isInventoryActive);
	const [usersOpen, setUsersOpen] = useState(isUsersActive);
	const [purchasesOpen, setPurchasesOpen] = useState(isPurchasesActive);
	const [accountingOpen, setAccountingOpen] = useState(isAccountingActive);
	const [settingsOpen, setSettingsOpen] = useState(isSettingsActive);
	const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
	return (
		<>
		<aside
			className={cn(
				'fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300',
				collapsed ? 'w-16' : 'w-64',
			)}>
			{/* Logo */}
			<div className='flex items-center gap-3 px-4 py-5 border-b border-sidebar-border'>
				<div className='flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-glow'>
					<ChefHat className='h-5 w-5 text-primary-foreground' />
				</div>
				{!collapsed && (
					<div>
						<h1 className='text-lg font-semibold text-sidebar-foreground'>
							RestaurantOS
						</h1>
						<p className='text-xs text-sidebar-muted'>Management System</p>
					</div>
				)}
			</div>

			{/* Navigation */}
			<nav className='flex-1 overflow-y-auto scrollbar-thin px-2 py-4'>
				<ul className='space-y-1'>
					{/* Dashboard */}
					<li>
						<NavLink
							to='/'
							className={cn(
								'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
								location.pathname === '/'
									? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-glow'
									: 'text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent',
								collapsed ? 'justify-center' : '',
							)}>
							<LayoutDashboard className='h-5 w-5' />
							{!collapsed && <span>Dashboard</span>}
						</NavLink>
					</li>

					{/* Orders with Sub-menu */}
					{visibleOrderSubItems.length > 0 && (
						<li>
							<Collapsible
								open={ordersOpen}
								onOpenChange={setOrdersOpen}>
								<CollapsibleTrigger
									className={cn(
										'flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
										isOrdersActive
											? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-glow'
											: 'text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent',
										collapsed ? 'justify-center' : '',
									)}>
									<div className='flex items-center gap-3'>
										<ClipboardList className='h-5 w-5' />
										{!collapsed && <span>Orders</span>}
									</div>
									{!collapsed && (
										<ChevronDown
											className={cn(
												'h-4 w-4 transition-transform duration-200',
												ordersOpen && 'rotate-180',
											)}
										/>
									)}
								</CollapsibleTrigger>
								<CollapsibleContent
									className={cn(
										'pl-4 mt-1 space-y-1',
										collapsed ? 'hidden' : '',
									)}>
									{visibleOrderSubItems.map((item) => {
										const isActive = location.pathname === item.url;
										return (
											<NavLink
												key={item.title}
												to={item.url}
												className={cn(
													'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200',
													isActive
														? 'bg-sidebar-accent text-sidebar-foreground font-medium'
														: 'text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50',
												)}>
												<item.icon className='h-4 w-4' />
												<span>{item.title}</span>
											</NavLink>
										);
									})}
								</CollapsibleContent>
							</Collapsible>
						</li>
					)}

					{/* Kitchen with Sub-menu */}
					{visibleKitchenSubItems.length > 0 && (
						<li>
							<Collapsible
								open={kitchenOpen}
								onOpenChange={setKitchenOpen}>
								<CollapsibleTrigger
									className={cn(
										'flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
										isKitchenActive
											? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-glow'
											: 'text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent',
										collapsed ? 'justify-center' : '',
									)}>
									<div className='flex items-center gap-3'>
										<Flame className='h-5 w-5' />
										{!collapsed && <span>Kitchen</span>}
									</div>
									{!collapsed && (
										<ChevronDown
											className={cn(
												'h-4 w-4 transition-transform duration-200',
												kitchenOpen && 'rotate-180',
											)}
										/>
									)}
								</CollapsibleTrigger>
								<CollapsibleContent
									className={cn(
										'pl-4 mt-1 space-y-1',
										collapsed ? 'hidden' : '',
									)}>
									{visibleKitchenSubItems.map((item) => {
										const isActive = location.pathname === item.url;
										return (
											<NavLink
												key={item.title}
												to={item.url}
												className={cn(
													'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200',
													isActive
														? 'bg-sidebar-accent text-sidebar-foreground font-medium'
														: 'text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50',
												)}>
												<item.icon className='h-4 w-4' />
												<span>{item.title}</span>
											</NavLink>
										);
									})}
								</CollapsibleContent>
							</Collapsible>
						</li>
					)}

					{/* Bar with Sub-menu */}
					{visibleBarSubItems.length > 0 && (
						<li>
							<Collapsible
								open={barOpen}
								onOpenChange={setBarOpen}>
								<CollapsibleTrigger
									className={cn(
										'flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
										isBarActive
											? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-glow'
											: 'text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent',
										collapsed ? 'justify-center' : '',
									)}>
									<div className='flex items-center gap-3'>
										<Wine className='h-5 w-5' />
										{!collapsed && <span>Bar</span>}
									</div>
									{!collapsed && (
										<ChevronDown
											className={cn(
												'h-4 w-4 transition-transform duration-200',
												barOpen && 'rotate-180',
											)}
										/>
									)}
								</CollapsibleTrigger>
								<CollapsibleContent
									className={cn(
										'pl-4 mt-1 space-y-1',
										collapsed ? 'hidden' : '',
									)}>
									{visibleBarSubItems.map((item) => {
										const isActive = location.pathname === item.url;
										return (
											<NavLink
												key={item.title}
												to={item.url}
												className={cn(
													'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200',
													isActive
														? 'bg-sidebar-accent text-sidebar-foreground font-medium'
														: 'text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50',
												)}>
												<item.icon className='h-4 w-4' />
												<span>{item.title}</span>
											</NavLink>
										);
									})}
								</CollapsibleContent>
							</Collapsible>
						</li>
					)}

					{/* Menu & Reservations */}
					{visibleMenuItems.slice(1, 3).map((item) => {
						const isActive = location.pathname === item.url;
						return (
							<li key={item.title}>
								<NavLink
									to={item.url}
									className={cn(
										'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
										isActive
											? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-glow'
											: 'text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent',
										collapsed ? 'justify-center' : '',
									)}>
									<item.icon className='h-5 w-5' />
									{!collapsed && <span>{item.title}</span>}
								</NavLink>
							</li>
						);
					})}

					{/* Inventory with Sub-menu */}
					{visibleInventorySubItems.length > 0 && (
						<li>
							<Collapsible
								open={inventoryOpen}
								onOpenChange={setInventoryOpen}>
								<CollapsibleTrigger
									className={cn(
										'flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
										isInventoryActive
											? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-glow'
											: 'text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent',
										collapsed ? 'justify-center' : '',
									)}>
									<div className='flex items-center gap-3'>
										<Package className='h-5 w-5' />
										{!collapsed && <span>Inventory</span>}
									</div>
									{!collapsed && (
										<ChevronDown
											className={cn(
												'h-4 w-4 transition-transform duration-200',
												inventoryOpen && 'rotate-180',
											)}
										/>
									)}
								</CollapsibleTrigger>
								<CollapsibleContent
									className={cn(
										'pl-4 mt-1 space-y-1',
										collapsed ? 'hidden' : '',
									)}>
									{visibleInventorySubItems.map((item) => {
										const isActive = location.pathname === item.url;
										return (
											<NavLink
												key={item.title}
												to={item.url}
												className={cn(
													'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200',
													isActive
														? 'bg-sidebar-accent text-sidebar-foreground font-medium'
														: 'text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50',
												)}>
												<item.icon className='h-4 w-4' />
												<span>{item.title}</span>
											</NavLink>
										);
									})}
								</CollapsibleContent>
							</Collapsible>
						</li>
					)}

					{/* Purchases with Sub-menu */}
					{visiblePurchaseSubItems.length > 0 && (
						<li>
							<Collapsible
								open={purchasesOpen}
								onOpenChange={setPurchasesOpen}>
								<CollapsibleTrigger
									className={cn(
										'flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
										isPurchasesActive
											? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-glow'
											: 'text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent',
										collapsed ? 'justify-center' : '',
									)}>
									<div className='flex items-center gap-3'>
										<ShoppingCart className='h-5 w-5' />
										{!collapsed && <span>Purchases</span>}
									</div>
									{!collapsed && (
										<ChevronDown
											className={cn(
												'h-4 w-4 transition-transform duration-200',
												purchasesOpen && 'rotate-180',
											)}
										/>
									)}
								</CollapsibleTrigger>
								<CollapsibleContent
									className={cn(
										'pl-4 mt-1 space-y-1',
										collapsed ? 'hidden' : '',
									)}>
									{visiblePurchaseSubItems.map((item) => {
										const isActive = location.pathname === item.url;
										return (
											<NavLink
												key={item.title}
												to={item.url}
												className={cn(
													'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200',
													isActive
														? 'bg-sidebar-accent text-sidebar-foreground font-medium'
														: 'text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50',
												)}>
												<item.icon className='h-4 w-4' />
												<span>{item.title}</span>
											</NavLink>
										);
									})}
								</CollapsibleContent>
							</Collapsible>
						</li>
					)}

					{/* Accounting with Sub-menu */}
					{visibleAccountingSubItems.length > 0 && (
						<li>
							<Collapsible
								open={accountingOpen}
								onOpenChange={setAccountingOpen}>
								<CollapsibleTrigger
									className={cn(
										'flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
										isAccountingActive
											? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-glow'
											: 'text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent',
										collapsed ? 'justify-center' : '',
									)}>
									<div className='flex items-center gap-3'>
										<Calculator className='h-5 w-5' />
										{!collapsed && <span>Accounting</span>}
									</div>
									{!collapsed && (
										<ChevronDown
											className={cn(
												'h-4 w-4 transition-transform duration-200',
												accountingOpen && 'rotate-180',
											)}
										/>
									)}
								</CollapsibleTrigger>
								<CollapsibleContent
									className={cn(
										'pl-4 mt-1 space-y-1',
										collapsed ? 'hidden' : '',
									)}>
									{visibleAccountingSubItems.map((item) => {
										const isActive = location.pathname === item.url;
										return (
											<NavLink
												key={item.title}
												to={item.url}
												className={cn(
													'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200',
													isActive
														? 'bg-sidebar-accent text-sidebar-foreground font-medium'
														: 'text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50',
												)}>
												<item.icon className='h-4 w-4' />
												<span>{item.title}</span>
											</NavLink>
										);
									})}
								</CollapsibleContent>
							</Collapsible>
						</li>
					)}

					{/* Staff */}
					{hasPermission('staff.view') && (
						<li>
							<NavLink
								to='/staff'
								className={cn(
									'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
									location.pathname.startsWith('/staff')
										? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-glow'
										: 'text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent',
									collapsed ? 'justify-center' : '',
								)}>
								<UserCircle className='h-5 w-5' />
								{!collapsed && <span>Staff</span>}
							</NavLink>
						</li>
					)}

					{/* User Management with Sub-menu */}
					{visibleUserSubItems.length > 0 && (
						<li>
							<Collapsible
								open={usersOpen}
								onOpenChange={setUsersOpen}>
								<CollapsibleTrigger
									className={cn(
										'flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
										isUsersActive
											? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-glow'
											: 'text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent',
										collapsed ? 'justify-center' : '',
									)}>
									<div className='flex items-center gap-3'>
										<Users className='h-5 w-5' />
										{!collapsed && <span>User Management</span>}
									</div>
									{!collapsed && (
										<ChevronDown
											className={cn(
												'h-4 w-4 transition-transform duration-200',
												usersOpen && 'rotate-180',
											)}
										/>
									)}
								</CollapsibleTrigger>
								<CollapsibleContent
									className={cn(
										'pl-4 mt-1 space-y-1',
										collapsed ? 'hidden' : '',
									)}>
									{visibleUserSubItems.map((item) => {
										const isActive = location.pathname === item.url;
										return (
											<NavLink
												key={item.title}
												to={item.url}
												className={cn(
													'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200',
													isActive
														? 'bg-sidebar-accent text-sidebar-foreground font-medium'
														: 'text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50',
												)}>
												<item.icon className='h-4 w-4' />
												<span>{item.title}</span>
											</NavLink>
										);
									})}
								</CollapsibleContent>
							</Collapsible>
						</li>
					)}

					{/* Reports */}
					{hasPermission('reports.view') && (
						<li>
							<NavLink
								to='/reports'
								className={cn(
									'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
									location.pathname === '/reports'
										? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-glow'
										: 'text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent',
									collapsed ? 'justify-center' : '',
								)}>
								<BarChart3 className='h-5 w-5' />
								{!collapsed && <span>Reports</span>}
							</NavLink>
						</li>
					)}

					{/* Settings with Sub-menu */}
					{visibleSettingsSubItems.length > 0 && (
						<li>
							<Collapsible
								open={settingsOpen}
								onOpenChange={setSettingsOpen}>
								<CollapsibleTrigger
									className={cn(
										'flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
										isSettingsActive
											? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-glow'
											: 'text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent',
										collapsed ? 'justify-center' : '',
									)}>
									<div className='flex items-center gap-3'>
										<Settings className='h-5 w-5' />
										{!collapsed && <span>Settings</span>}
									</div>
									{!collapsed && (
										<ChevronDown
											className={cn(
												'h-4 w-4 transition-transform duration-200',
												settingsOpen && 'rotate-180',
											)}
										/>
									)}
								</CollapsibleTrigger>
								<CollapsibleContent
									className={cn(
										'pl-4 mt-1 space-y-1',
										collapsed ? 'hidden' : '',
									)}>
									{visibleSettingsSubItems.map((item) => {
										const isActive = location.pathname === item.url;
										return (
											<NavLink
												key={item.title}
												to={item.url}
												className={cn(
													'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200',
													isActive
														? 'bg-sidebar-accent text-sidebar-foreground font-medium'
														: 'text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50',
												)}>
												<item.icon className='h-4 w-4' />
												<span>{item.title}</span>
											</NavLink>
										);
									})}
								</CollapsibleContent>
							</Collapsible>
						</li>
					)}
				</ul>
			</nav>

			{/* User Section */}
			<div className='border-t border-sidebar-border p-2'>
				<div className='flex items-center gap-3 px-2'>
					<div className='h-9 w-9 rounded-full bg-primary flex items-center justify-center overflow-hidden'>
						<span className='text-sm font-medium text-primary-foreground'>
							{(user?.staff?.firstName?.[0] || user?.username?.[0] || 'U').toUpperCase()}
						</span>
					</div>
					{!collapsed && (
						<button
							className='flex-1 min-w-0 text-left hover:opacity-80 transition-opacity'
							onClick={() => navigate(`/staff/edit/${user?.staffId}`)}>
							<p className='text-sm font-medium text-sidebar-foreground truncate'>
								{user?.staff?.firstName} {user?.staff?.lastName}
							</p>
							<p className='text-xs text-sidebar-muted truncate'>
								{user?.userGroupName || (user?.userGroupId ? 'Staff' : 'User')}
							</p>
						</button>
					)}
					<button
						className='p-2 rounded-lg hover:bg-sidebar-accent transition-colors'
						onClick={() => setShowLogoutConfirm(true)}
						title='Logout'>
						<LogOut className='h-4 w-4 text-sidebar-muted' />
					</button>
				</div>
			</div>
		</aside>

		<LogoutConfirmDialog
			open={showLogoutConfirm}
			onOpenChange={setShowLogoutConfirm}
			onConfirm={() => logout().catch(console.error)}
		/>
		</>
	);
}

export function MobileSidebar({
	isOpen,
	onClose,
}: {
	isOpen: boolean;
	onClose: () => void;
}) {
	return (
		<Sheet
			open={isOpen}
			onOpenChange={onClose}>
			<SheetContent
				side='left'
				className='w-[280px] p-0 bg-sidebar border-r-0'>
				<AppSidebar collapsed={false} />
			</SheetContent>
		</Sheet>
	);
}
