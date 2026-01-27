import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Plus, DollarSign } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { MenuService } from '@/services/menuService';
import { useToast } from '@/hooks/use-toast';
import { AxiosError } from 'axios';

// Import types from menu service
import { MenuAddon } from '@/types/menuType';

export default function AddonEdit() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		name: '',
		description: '',
		price: 0,
		available: true,
	});
	const { toast } = useToast();

	// Fetch the addon to edit
	const {
		data: addon,
		isLoading: isLoadingAddon,
		error: addonError,
	} = useQuery<MenuAddon, Error>({
		queryKey: ['addon', id],
		queryFn: () => MenuService.getMenuAddonById(Number(id)),
		enabled: !!id,
	});

	// Populate form when addon is loaded
	useEffect(() => {
		if (addon) {
			setFormData({
				name: addon.name,
				description: addon.description || '',
				price: addon.price,
				available: addon.isAvailable,
			});
		}
	}, [addon]);

	// Handle errors
	useEffect(() => {
		if (addonError) {
			toast({
				title: 'Error',
				description: 'Failed to load addon',
				variant: 'destructive',
			});
		}
	}, [addonError, toast]);

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		const { id, value, type: inputType } = e.target;
		setFormData((prev) => ({
			...prev,
			[id]: inputType === 'number' ? parseFloat(value) || 0 : value,
		}));
	};

	const handleSwitchChange = (id: string, checked: boolean) => {
		setFormData((prev) => ({
			...prev,
			[id]: checked,
		}));
	};

	// Update addon mutation
	const {
		mutate: updateAddon,
		isPending,
		isError,
		isSuccess,
	} = useMutation({
		mutationFn: async (addonData: typeof formData) => {
			if (!addon) throw new Error('Addon not found');

			const updateData = {
				name: addonData.name,
				description: addonData.description,
				price: addonData.price,
				isAvailable: addonData.available,
			};

			return MenuService.updateMenuAddon(addon.id, updateData);
		},
		onSuccess: () => {
			toast({
				title: 'Success',
				description: 'Addon updated successfully!',
				variant: 'default',
			});
			setTimeout(() => {
				navigate('/kitchen/menu');
			}, 2000);
		},
		onError: (error: AxiosError) => {
			toast({
				title: 'Error',
				description: error.response?.data?.message || 'Failed to update addon',
				variant: 'destructive',
			});
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// Basic validation
		if (!formData.name.trim()) {
			toast({
				title: 'Validation Error',
				description: 'Please enter a name for the addon',
				variant: 'destructive',
			});
			return;
		}

		if (formData.price <= 0) {
			toast({
				title: 'Validation Error',
				description: 'Please enter a valid price',
				variant: 'destructive',
			});
			return;
		}

		// Update addon
		updateAddon(formData);
	};

	if (isLoadingAddon) {
		return (
			<MainLayout
				title='Edit Addon'
				subtitle='Loading...'>
				<div className='flex justify-center items-center py-12'>
					<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
				</div>
			</MainLayout>
		);
	}

	if (addonError || !addon) {
		return (
			<MainLayout
				title='Edit Addon'
				subtitle='Error'>
				<div className='p-6 rounded-lg bg-red-50 border border-red-200 text-red-800'>
					<p className='font-medium'>❌ Error loading addon</p>
					<p className='mt-2'>The addon could not be found or loaded.</p>
					<Link to='/kitchen/menu'>
						<Button
							variant='outline'
							className='mt-4'>
							Back to Kitchen Menu
						</Button>
					</Link>
				</div>
			</MainLayout>
		);
	}

	return (
		<MainLayout
			title='Edit Addon'
			subtitle='Update the details of your kitchen menu addon'>
			<div className='space-y-6 animate-fade-in max-w-3xl'>
				{/* Status Feedback */}
				{isSuccess && (
					<div className='p-4 rounded-lg bg-green-50 border border-green-200 text-green-800'>
						✅ Addon updated successfully! Redirecting...
					</div>
				)}
				{isError && (
					<div className='p-4 rounded-lg bg-red-50 border border-red-200 text-red-800'>
						❌ Error updating addon. Please check the form and try again.
					</div>
				)}
				{/* Back Button */}
				<Link to='/kitchen/menu'>
					<Button
						variant='ghost'
						className='gap-2'>
						<ArrowLeft className='h-4 w-4' />
						Back to Kitchen Menu
					</Button>
				</Link>

				<form
					onSubmit={handleSubmit}
					className='grid gap-6'>
					{/* Basic Information */}
					<Card className='shadow-card border-border/50'>
						<CardHeader>
							<CardTitle className='text-lg flex items-center gap-2'>
								<Plus className='h-5 w-5 text-primary' />
								Addon Information
							</CardTitle>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
								<div className='space-y-2'>
									<Label htmlFor='name'>Addon Name *</Label>
									<Input
										id='name'
										placeholder='e.g., Extra Cheese'
										value={formData.name}
										onChange={handleInputChange}
									/>
								</div>
								<div className='space-y-2'>
									<Label
										htmlFor='price'
										className='flex items-center gap-1'>
										<DollarSign className='h-4 w-4' />
										Price *
									</Label>
									<Input
										id='price'
										type='number'
										step='0.01'
										min='0'
										placeholder='0.00'
										value={formData.price}
										onChange={handleInputChange}
									/>
								</div>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='description'>Description</Label>
								<Textarea
									id='description'
									placeholder='Describe the addon...'
									value={formData.description}
									onChange={handleInputChange}
									rows={3}
								/>
							</div>
							<div className='flex items-center justify-between'>
								<div className='space-y-0.5'>
									<Label htmlFor='available'>Available</Label>
									<p className='text-sm text-muted-foreground'>
										Make this addon available for ordering
									</p>
								</div>
								<Switch
									id='available'
									checked={formData.available}
									onCheckedChange={(checked) =>
										handleSwitchChange('available', checked)
									}
								/>
							</div>
						</CardContent>
					</Card>

					{/* Submit Button */}
					<div className='flex justify-end gap-4'>
						<Link to='/kitchen/menu'>
							<Button
								variant='outline'
								type='button'>
								Cancel
							</Button>
						</Link>
						<Button
							type='submit'
							disabled={isPending}
							className='gradient-primary'>
							{isPending ? 'Updating...' : 'Update Addon'}
						</Button>
					</div>
				</form>
			</div>
		</MainLayout>
	);
}
