import { MainLayout } from '@/components/layout/MainLayout';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { AdjustmentReasonService } from '@/services/adjustmentReasonService';
import type { AdjustmentReason } from '@/types/adjustmentReason.types';

const SettingsAdjustmentReasons = () => {
	const {
		data: adjustmentReasons,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ['adjustment-reasons'],
		queryFn: () => AdjustmentReasonService.getAllAdjustmentReasons(),
	});

	if (isLoading) {
		return (
			<MainLayout
				title='Adjustment Reasons'
				subtitle='Manage reasons for inventory adjustments'>
				<div className='flex items-center justify-center h-64'>
					<div className='animate-spin rounded-full h-32 w-32 border-b-2 border-primary'></div>
				</div>
			</MainLayout>
		);
	}

	if (isError) {
		return (
			<MainLayout
				title='Adjustment Reasons'
				subtitle='Manage reasons for inventory adjustments'>
				<div className='flex items-center justify-center h-64'>
					<div className='text-center'>
						<h2 className='text-2xl font-bold text-red-600 mb-4'>Error</h2>
						<p className='text-muted-foreground'>
							Failed to load adjustment reasons
						</p>
						<Button
							variant='outline'
							className='mt-4'
							onClick={() => window.location.reload()}>
							Retry
						</Button>
					</div>
				</div>
			</MainLayout>
		);
	}

	return (
		<MainLayout
			title='Adjustment Reasons'
			subtitle='Manage reasons for inventory adjustments'>
			<div className='space-y-6'>
				<div className='flex justify-between items-center'>
					<div>
						<p className='text-muted-foreground'>
							Define reasons that can be selected when making inventory
							adjustments.
						</p>
					</div>
					<Button>
						<Plus className='h-4 w-4 mr-2' />
						Add Reason
					</Button>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Adjustment Reasons</CardTitle>
						<CardDescription>
							List of available adjustment reasons for inventory management
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Reason Name</TableHead>
									<TableHead>Type</TableHead>
									<TableHead>Description</TableHead>
									<TableHead>Status</TableHead>
									<TableHead className='text-right'>Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{adjustmentReasons?.map((reason: AdjustmentReason) => (
									<TableRow key={reason.id}>
										<TableCell className='font-medium'>{reason.name}</TableCell>
										<TableCell>
											<Badge
												variant={
													reason.type === 'increase'
														? 'default'
														: reason.type === 'decrease'
															? 'destructive'
															: 'secondary'
												}>
												{reason.type === 'both'
													? 'Increase/Decrease'
													: reason.type.charAt(0).toUpperCase() +
														reason.type.slice(1)}
											</Badge>
										</TableCell>
										<TableCell className='text-muted-foreground'>
											{reason.description}
										</TableCell>
										<TableCell>
											<Badge variant={reason.active ? 'outline' : 'secondary'}>
												{reason.active ? 'Active' : 'Inactive'}
											</Badge>
										</TableCell>
										<TableCell className='text-right'>
											<div className='flex justify-end gap-2'>
												<Button
													variant='ghost'
													size='icon'>
													<Pencil className='h-4 w-4' />
												</Button>
												<Button
													variant='ghost'
													size='icon'>
													<Trash2 className='h-4 w-4' />
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			</div>
		</MainLayout>
	);
};

export default SettingsAdjustmentReasons;
