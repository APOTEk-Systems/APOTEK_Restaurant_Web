import { NavLink, useLocation } from "react-router-dom";
import { UtensilsCrossed, PlusCircle, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

const waiterNavItems = [
	{ title: "Menu", url: "/menu", icon: UtensilsCrossed },
	{ title: "New", url: "/orders/new", icon: PlusCircle },
	{ title: "Orders", url: "/orders", icon: ClipboardList },
];

export function WaiterBottomNav() {
	const location = useLocation();

	return (
		<nav className='fixed bottom-0 left-0 right-0 z-40 bg-sidebar border-t border-sidebar-border pb-[env(safe-area-inset-bottom)] md:block'>
			<ul className='flex items-stretch justify-around'>
				{waiterNavItems.map((item) => {
					const isActive =
						item.url === "/orders/new"
							? location.pathname === "/orders/new"
							: location.pathname.startsWith(item.url);

					return (
						<li key={item.title} className='flex-1'>
							<NavLink
								to={item.url}
								className={cn(
									'relative flex flex-col items-center justify-center gap-1 py-2.5 transition-all duration-200',
									isActive
										? 'text-sidebar-primary'
										: 'text-sidebar-muted hover:text-sidebar-foreground',
								)}>
								{isActive && (
									<span className='absolute top-0 h-0.5 w-10 rounded-full bg-sidebar-primary' />
								)}
								<item.icon
									className={cn(
										'h-6 w-6 transition-transform duration-200',
										isActive && 'scale-110',
									)}
								/>
								<span className='text-[11px] font-medium'>{item.title}</span>
							</NavLink>
						</li>
					);
				})}
			</ul>
		</nav>
	);
}
