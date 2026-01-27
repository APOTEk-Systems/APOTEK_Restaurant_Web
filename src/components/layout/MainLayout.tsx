import { ReactNode, useState, useEffect } from 'react';
import { AppSidebar, MobileSidebar } from './AppSidebar';
import { Bell, Search, Menu, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SearchService } from '@/services/searchService';
import { NotificationService } from '@/services/notificationService';
import type { SearchResult, Notification } from '@/types/common';
import { useToast } from '@/hooks/use-toast';

interface MainLayoutProps {
	children: ReactNode;
	title: string;
	subtitle?: string;
}

export function MainLayout({ children, title, subtitle }: MainLayoutProps) {
	const location = useLocation();
	const { toast } = useToast();
	const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
		// Initialize from localStorage if available
		const savedState = localStorage.getItem('sidebarCollapsed');
		return savedState ? JSON.parse(savedState) : false;
	});
	const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

	// Search state
	const [searchQuery, setSearchQuery] = useState('');
	const [searchOpen, setSearchOpen] = useState(false);

	// Notifications state
	const [notificationsOpen, setNotificationsOpen] = useState(false);

	// Save collapsed state to localStorage whenever it changes
	useEffect(() => {
		localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed));
	}, [sidebarCollapsed]);

	// Reset mobile sidebar when navigation changes
	useEffect(() => {
		setMobileSidebarOpen(false);
	}, [location.pathname]);

	// Search query
	const { data: searchResults = [], refetch: refetchSearch } = useQuery({
		queryKey: ['search', searchQuery],
		queryFn: () => SearchService.globalSearch(searchQuery),
		enabled: searchQuery.length > 2, // Only search when query is at least 3 characters
		staleTime: 30000, // Cache for 30 seconds
	});

	// Notifications query - disabled until backend implements the endpoint
	// const { data: notificationsData, refetch: refetchNotifications } = useQuery({
	// 	queryKey: ['notifications'],
	// 	queryFn: () => NotificationService.getNotifications(1, 10),
	// 	refetchInterval: 30000, // Refetch every 30 seconds
	// });
	const notificationsData = { notifications: [], unreadCount: 0 };
	const refetchNotifications = () => {};

	const notifications = notificationsData?.notifications || [];
	const unreadCount = notificationsData?.unreadCount || 0;

	// Search handlers
	const handleSearchChange = (value: string) => {
		setSearchQuery(value);
		setSearchOpen(value.length > 2);
	};

	const handleSearchResultClick = (result: SearchResult) => {
		// Navigate to the result URL
		window.location.href = result.url;
		setSearchOpen(false);
		setSearchQuery('');
	};

	// Notification handlers
	const handleMarkAsRead = async (notificationId: number) => {
		try {
			await NotificationService.markAsRead(notificationId);
			refetchNotifications();
			toast({
				title: 'Notification marked as read',
				duration: 2000,
			});
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to mark notification as read',
				variant: 'destructive',
			});
		}
	};

	const handleMarkAllAsRead = async () => {
		try {
			await NotificationService.markAllAsRead();
			refetchNotifications();
			toast({
				title: 'All notifications marked as read',
				duration: 2000,
			});
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to mark all notifications as read',
				variant: 'destructive',
			});
		}
	};

	const toggleSidebar = () => {
		setSidebarCollapsed(!sidebarCollapsed);
	};

	return (
		<div className='min-h-screen bg-background'>
			{/* Desktop Sidebar */}
			<AppSidebar
				collapsed={sidebarCollapsed}
				onToggle={toggleSidebar}
			/>

			{/* Mobile Sidebar */}
			<MobileSidebar
				isOpen={mobileSidebarOpen}
				onClose={() => setMobileSidebarOpen(false)}
			/>

			{/* Main Content */}
			<div className={sidebarCollapsed ? 'pl-16' : 'pl-64'}>
				{/* Header */}
				<header className='sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border'>
					<div className='flex items-center justify-between px-6 py-4'>
						<div className='flex items-center gap-4'>
							{/* Mobile Menu Button */}
							<Button
								variant='ghost'
								size='icon'
								className='md:hidden'
								onClick={() => setMobileSidebarOpen(true)}>
								<Menu className='h-5 w-5' />
							</Button>

							{/* Sidebar Toggle Button */}
							<Button
								variant='ghost'
								size='icon'
								className='hidden md:block hover:bg-transparent hover:text-primary transition-colors'
								onClick={toggleSidebar}>
								<Menu className='h-5 w-5' />
							</Button>

							<div>
								<h1 className='text-2xl font-semibold text-foreground'>
									{title}
								</h1>
								{subtitle && (
									<p className='text-sm text-muted-foreground mt-0.5'>
										{subtitle}
									</p>
								)}
							</div>
						</div>

						<div className='flex items-center gap-4'>
							{/* Search */}
							<div className='relative'>
								<Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
								<Input
									placeholder='Search menu, orders, users...'
									className='w-64 pl-9 bg-secondary border-0 focus-visible:ring-1 focus-visible:ring-primary'
									value={searchQuery}
									onChange={(e) => handleSearchChange(e.target.value)}
									onFocus={() => searchQuery.length > 2 && setSearchOpen(true)}
									onBlur={() => setTimeout(() => setSearchOpen(false), 200)} // Delay to allow clicks
								/>

								{/* Search Results Dropdown */}
								{searchOpen && searchResults.length > 0 && (
									<div className='absolute top-full mt-2 w-full bg-background border border-border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto'>
										{searchResults.map((result) => (
											<button
												key={`${result.type}-${result.id}`}
												className='w-full px-4 py-3 text-left hover:bg-secondary border-b border-border last:border-b-0 transition-colors'
												onClick={() => handleSearchResultClick(result)}>
												<div className='flex items-center justify-between'>
													<div>
														<div className='font-medium text-sm'>
															{result.title}
														</div>
														{result.subtitle && (
															<div className='text-xs text-muted-foreground'>
																{result.subtitle}
															</div>
														)}
													</div>
													<div className='text-xs text-muted-foreground capitalize'>
														{result.type.replace('_', ' ')}
													</div>
												</div>
											</button>
										))}
									</div>
								)}

								{/* No Results */}
								{searchOpen &&
									searchQuery.length > 2 &&
									searchResults.length === 0 && (
										<div className='absolute top-full mt-2 w-full bg-background border border-border rounded-lg shadow-lg z-50 p-4 text-center text-muted-foreground'>
											No results found for "{searchQuery}"
										</div>
									)}
							</div>

							{/* Notifications */}
							<div className='relative'>
								<button
									className='relative p-2 rounded-lg hover:bg-secondary transition-colors'
									onClick={() => setNotificationsOpen(!notificationsOpen)}
									onBlur={() =>
										setTimeout(() => setNotificationsOpen(false), 200)
									}>
									<Bell className='h-5 w-5 text-muted-foreground' />
									{unreadCount > 0 && (
										<span className='absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center animate-pulse-soft'>
											{unreadCount > 9 ? '9+' : unreadCount}
										</span>
									)}
								</button>

								{/* Notifications Dropdown */}
								{notificationsOpen && (
									<div className='absolute right-0 top-full mt-2 w-80 bg-background border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto'>
										<div className='p-4 border-b border-border'>
											<div className='flex items-center justify-between'>
												<h3 className='font-semibold'>Notifications</h3>
												{unreadCount > 0 && (
													<Button
														variant='ghost'
														size='sm'
														onClick={handleMarkAllAsRead}
														className='text-xs'>
														Mark all read
													</Button>
												)}
											</div>
										</div>

										<div className='divide-y divide-border'>
											{notifications.length > 0 ? (
												notifications.map((notification) => (
													<div
														key={notification.id}
														className={`p-4 hover:bg-secondary transition-colors ${
															!notification.isRead ? 'bg-primary/5' : ''
														}`}>
														<div className='flex items-start justify-between gap-3'>
															<div className='flex-1'>
																<div className='flex items-center gap-2 mb-1'>
																	<div
																		className={`w-2 h-2 rounded-full ${
																			notification.type === 'error'
																				? 'bg-red-500'
																				: notification.type === 'warning'
																					? 'bg-yellow-500'
																					: notification.type === 'success'
																						? 'bg-green-500'
																						: 'bg-blue-500'
																		}`}
																	/>
																	<h4 className='font-medium text-sm'>
																		{notification.title}
																	</h4>
																</div>
																<p className='text-sm text-muted-foreground mb-2'>
																	{notification.message}
																</p>
																<div className='text-xs text-muted-foreground'>
																	{new Date(
																		notification.createdAt,
																	).toLocaleDateString()}{' '}
																	at{' '}
																	{new Date(
																		notification.createdAt,
																	).toLocaleTimeString()}
																</div>
															</div>
															{!notification.isRead && (
																<Button
																	variant='ghost'
																	size='sm'
																	onClick={() =>
																		handleMarkAsRead(notification.id)
																	}
																	className='text-xs opacity-0 group-hover:opacity-100 transition-opacity'>
																	Mark read
																</Button>
															)}
														</div>
													</div>
												))
											) : (
												<div className='p-8 text-center text-muted-foreground'>
													<Bell className='h-8 w-8 mx-auto mb-2 opacity-50' />
													<p>No notifications</p>
												</div>
											)}
										</div>
									</div>
								)}
							</div>
						</div>
					</div>
				</header>

				{/* Page Content */}
				<main className='px-6 py-3'>{children}</main>
			</div>
		</div>
	);
}
