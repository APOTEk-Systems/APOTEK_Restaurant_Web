import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Package, AlertTriangle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { InventoryService } from '@/services/inventoryService';
import { SupplierService } from '@/services/supplierService';
import type { Category, InventoryUnit } from '@/types/inventory.types';
import type { Supplier } from '@/types/supplier.types';
import { useToast } from '@/hooks/use-toast';

export default function InventoryNew() {
	const navigate = useNavigate();
	const { toast } = useToast();
	const [loading, setLoading] = useState(false);
	const [categories, setCategories] = useState<Category[]>([]);
	const [units, setUnits] = useState<InventoryUnit[]>([]);
	const [suppliers, setSuppliers] = useState<Supplier[]>([]);
	const [formData, setFormData] = useState({
		name: '',
		sku: '',
		categoryId: undefined,
		supplier: '',
		description: '',
		quantity: 0,
		unit: '',
		price: 0,
		minStock: 0,
		maxStock: 0,
		location: '',
	});

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [categoriesData, unitsData, suppliersData] = await Promise.all([
					InventoryService.getAllCategories(),
					InventoryService.getAllUnits(),
					SupplierService.getAllSuppliers(),
				]);
				setCategories(categoriesData);
				setUnits(unitsData);
				setSuppliers(suppliersData);
			} catch (error) {
				toast({
					variant: 'destructive',
					title: 'Error',
					description: 'Failed to fetch data. Please try again later.',
				});
			}
		};

		fetchData();
	}, [toast]);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		const { name, value, type } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: type === 'number' ? parseFloat(value) || 0 : value,
		}));
	};

	const handleSelectChange = (name: string, value: string | number) => {
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSwitchChange = (name: string, checked: boolean) => {
		setFormData((prev) => ({
			...prev,
			[name]: checked,
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			await InventoryService.createInventoryItem(formData);
			toast({
				variant: 'default',
				title: 'Success',
				description: 'Inventory item created successfully.',
			});
			navigate('/inventory');
		} catch (error) {
			toast({
				variant: 'destructive',
				title: 'Error',
				description:
					error instanceof Error
						? error.message
						: 'Failed to create inventory item.',
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<MainLayout
			title='Add Inventory Item'
			subtitle='Add a new item to your inventory'>
			<div className='space-y-6 animate-fade-in max-w-3xl'>
				{/* Back Button */}
				<Link to='/inventory'>
					<Button
						variant='ghost'
						className='gap-2'>
						<ArrowLeft className='h-4 w-4' />
						Back to Inventory
					</Button>
				</Link>

				<form
					onSubmit={handleSubmit}
					className='grid gap-6'>
					{/* Basic Information */}
					<Card className='shadow-card border-border/50'>
						<CardHeader>
							<CardTitle className='text-lg flex items-center gap-2'>
								<Package className='h-5 w-5 text-primary' />
								Basic Information
							</CardTitle>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
								<div className='space-y-2'>
									<Label htmlFor='name'>Item Name *</Label>
									<Input
										id='name'
										name='name'
										value={formData.name}
										onChange={handleChange}
										placeholder='e.g., Fresh Salmon'
										required
									/>
								</div>
								<div className='space-y-2'>
									<Label htmlFor='sku'>SKU / Item Code</Label>
									<Input
										id='sku'
										name='sku'
										value={formData.sku}
										onChange={handleChange}
										placeholder='e.g., INV-001'
									/>
								</div>
								<div className='space-y-2'>
									<Label htmlFor='category'>Category *</Label>
									<Select
										value={formData.categoryId?.toString() || ''}
										onValueChange={(value) =>
											handleSelectChange('categoryId', parseInt(value))
										}
										required>
										<SelectTrigger id='category'>
											<SelectValue placeholder='Select category' />
										</SelectTrigger>
										<SelectContent>
											{categories.map((cat) => (
												<SelectItem
													key={cat.id}
													value={cat.id.toString()}>
													{cat.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className='space-y-2'>
									<Label htmlFor='supplier'>Preferred Supplier</Label>
									<Select
										value={formData.supplier}
										onValueChange={(value) =>
											handleSelectChange('supplier', value)
										}>
										<SelectTrigger id='supplier'>
											<SelectValue placeholder='Select supplier' />
										</SelectTrigger>
										<SelectContent>
											{suppliers.map((supplier) => (
												<SelectItem
													key={supplier.id}
													value={supplier.id.toString()}>
													{supplier.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='description'>Description</Label>
								<Textarea
									id='description'
									name='description'
									value={formData.description}
									onChange={handleChange}
									placeholder='Item description, specifications, etc.'
									rows={3}
								/>
							</div>
						</CardContent>
					</Card>

					{/* Stock & Pricing */}
					<Card className='shadow-card border-border/50'>
						<CardHeader>
							<CardTitle className='text-lg flex items-center gap-2'>
								<AlertTriangle className='h-5 w-5 text-warning' />
								Stock & Pricing
							</CardTitle>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
								<div className='space-y-2'>
									<Label htmlFor='quantity'>Current Quantity *</Label>
									<Input
										id='quantity'
										name='quantity'
										type='number'
										min='0'
										value={formData.quantity}
										onChange={handleChange}
										placeholder='0'
										required
									/>
								</div>
								<div className='space-y-2'>
									<Label htmlFor='unit'>Unit *</Label>
									<Select
										value={formData.unit}
										onValueChange={(value) => handleSelectChange('unit', value)}
										required>
										<SelectTrigger id='unit'>
											<SelectValue placeholder='Select unit' />
										</SelectTrigger>
										<SelectContent>
											{units.map((unit) => (
												<SelectItem
													key={unit.id}
													value={unit.name}>
													{unit.name} ({unit.symbol})
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className='space-y-2'>
									<Label htmlFor='price'>Unit Price ($) *</Label>
									<Input
										id='price'
										name='price'
										type='number'
										min='0'
										step='0.01'
										value={formData.price}
										onChange={handleChange}
										placeholder='0.00'
										required
									/>
								</div>
							</div>
							<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
								<div className='space-y-2'>
									<Label htmlFor='minStock'>Minimum Stock Level</Label>
									<Input
										id='minStock'
										name='minStock'
										type='number'
										min='0'
										value={formData.minStock}
										onChange={handleChange}
										placeholder='Alert when below this'
									/>
								</div>
								<div className='space-y-2'>
									<Label htmlFor='maxStock'>Maximum Stock Level</Label>
									<Input
										id='maxStock'
										name='maxStock'
										type='number'
										min='0'
										value={formData.maxStock}
										onChange={handleChange}
										placeholder='Maximum capacity'
									/>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Additional Settings */}
					<Card className='shadow-card border-border/50'>
						<CardHeader>
							<CardTitle className='text-lg'>Additional Settings</CardTitle>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='grid grid-cols-1 gap-4'>
								<div className='space-y-2'>
									<Label htmlFor='location'>Storage Location</Label>
									<Select
										value={formData.location}
										onValueChange={(value) =>
											handleSelectChange('location', value)
										}>
										<SelectTrigger id='location'>
											<SelectValue placeholder='Select storage location' />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='KITCHEN'>Kitchen</SelectItem>
											<SelectItem value='BAR'>Bar</SelectItem>
											<SelectItem value='STORAGE'>Storage</SelectItem>
											<SelectItem value='WALKIN_COOLER'>
												Walk-in Cooler
											</SelectItem>
											<SelectItem value='FREEZER'>Freezer</SelectItem>
											<SelectItem value='DRY_STORAGE'>Dry Storage</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Actions */}
					<div className='flex gap-3 justify-end'>
						<Link to='/inventory'>
							<Button
								variant='outline'
								disabled={loading}>
								Cancel
							</Button>
						</Link>
						<Button
							type='submit'
							className='gradient-primary text-primary-foreground shadow-glow hover:shadow-lg transition-shadow'
							disabled={loading}>
							{loading ? (
								'Creating...'
							) : (
								<>
									<Package className='h-4 w-4 mr-2' />
									Add Inventory Item
								</>
							)}
						</Button>
					</div>
				</form>
			</div>
		</MainLayout>
	);
}
