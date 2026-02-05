import { cn } from '@/lib/utils';
import { LucideIcon, Loader2 } from 'lucide-react';

interface StatCardProps {
	title: string;
	value: string | number;
	subtitle?: string;
	change?: string;
	changeType?: 'positive' | 'negative' | 'neutral';
	icon?: LucideIcon;
	iconColor?: 'primary' | 'success' | 'warning' | 'destructive';
	textColor?: 'primary' | 'success' | 'warning' | 'destructive' | 'foreground';
	loading?: boolean;
}

const iconColorClasses = {
	primary: 'bg-primary/10 text-primary',
	success: 'bg-success/10 text-success',
	warning: 'bg-warning/10 text-warning',
	destructive: 'bg-destructive/10 text-destructive',
};

const textColorClasses = {
	primary: 'text-primary',
	success: 'text-success',
	warning: 'text-warning',
	destructive: 'text-destructive',
	foreground: 'text-foreground',
};

export function StatCard({
	title,
	value,
	subtitle,
	change,
	changeType = 'neutral',
	icon: Icon,
	iconColor = 'primary',
	textColor = 'foreground',
	loading = false,
}: StatCardProps) {
	return (
		<div className='bg-card rounded-xl p-5 shadow-card border border-border/50'>
			<p className='text-sm text-muted-foreground'>{title}</p>
			{loading ? (
				<div className='flex items-center mt-1'>
					<Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
				</div>
			) : (
				<p
					className={cn(
						'text-2xl font-bold mt-1',
						textColorClasses[textColor],
					)}>
					{value}
				</p>
			)}
			{subtitle && (
				<p className='text-xs text-muted-foreground mt-1'>{subtitle}</p>
			)}
			{change && (
				<p
					className={cn(
						'text-sm font-medium mt-1',
						changeType === 'positive' && 'text-success',
						changeType === 'negative' && 'text-destructive',
						changeType === 'neutral' && 'text-muted-foreground',
					)}>
					{change}
				</p>
			)}
		</div>
	);
}
