import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Users } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ReservationService } from "@/services/reservationService";
import { TableService } from "@/services/tableService";
import type { AvailableTable } from "@/types/table.types";
import { toast } from "@/hooks/use-toast";

// Status options with uppercase values for API
const STATUS_OPTIONS = [
	{ value: "PENDING", label: "Pending" },
	{ value: "CONFIRMED", label: "Confirmed" },
	{ value: "CANCELLED", label: "Cancelled" },
];

interface ReservationFormData {
	customerName: string;
	customerPhone: string;
	customerEmail: string;
	date: string; // Will be converted to ISO format
	numberOfGuests: number;
	selectedTables: number[];
	notes: string;
	status: "PENDING" | "CONFIRMED" | "CANCELLED";
}

// Helper to convert datetime-local to ISO format
const toISODateTime = (dateTimeLocal: string): string => {
	if (!dateTimeLocal) return "";
	return new Date(dateTimeLocal).toISOString();
};

export default function ReservationNew() {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [tablesLoading, setTablesLoading] = useState(false);
	const [availableTables, setAvailableTables] = useState<AvailableTable[]>([]);
	const [reservation, setReservation] = useState<ReservationFormData>({
		customerName: "",
		customerPhone: "",
		customerEmail: "",
		date: "",
		numberOfGuests: 1,
		selectedTables: [],
		notes: "",
		status: "PENDING",
	});

	// Fetch available tables when date/time changes
	useEffect(() => {
		const fetchTables = async () => {
			if (reservation.date) {
				setTablesLoading(true);
				try {
					// Convert to ISO format for API
					const isoDate = toISODateTime(reservation.date);
					const tables = await TableService.getAvailableTables(isoDate);
					setAvailableTables(tables);
				} catch (error) {
					console.error("Failed to fetch available tables:", error);
				} finally {
					setTablesLoading(false);
				}
			} else {
				setAvailableTables([]);
			}
		};

		fetchTables();
	}, [reservation.date]);

	const handleInputChange = (
		field: string,
		value: string | number | undefined,
	) => {
		setReservation((prev) => ({ ...prev, [field]: value }));
	};

	const handleTableSelect = (tableId: number) => {
		const currentTables = reservation.selectedTables;

		if (currentTables.includes(tableId)) {
			// Remove table if already selected
			setReservation((prev) => ({
				...prev,
				selectedTables: currentTables.filter((tid) => tid !== tableId),
			}));
		} else {
			// Add table
			setReservation((prev) => ({
				...prev,
				selectedTables: [...currentTables, tableId],
			}));
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			// Prepare the data with correct format for API
			const reservationData = {
				customerName: reservation.customerName,
				customerPhone: reservation.customerPhone,
				customerEmail: reservation.customerEmail,
				date: toISODateTime(reservation.date), // Convert to ISO format
				numberOfGuests: reservation.numberOfGuests,
				notes: reservation.notes,
				status: reservation.status,
				tableIds: reservation.selectedTables,
			};

			await ReservationService.createReservation(reservationData);
			toast({
				title: "Reservation Created",
				description: `Reservation for ${reservation.customerName} has been created successfully`,
				variant: "default",
			});
			navigate("/reservations");
		} catch (error) {
			toast({
				title: "Error",
				description:
					error instanceof Error
						? error.message
						: "Failed to create reservation. Please try again.",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	const isFormValid =
		reservation.customerName &&
		reservation.customerPhone &&
		reservation.customerEmail &&
		reservation.date &&
		reservation.numberOfGuests > 0 &&
		reservation.selectedTables.length > 0;

	// Filter tables based on guest capacity
	const suitableTables = availableTables.filter(
		(table) => table.capacity >= reservation.numberOfGuests,
	);

	return (
		<MainLayout title="New Reservation" subtitle="Create a new table reservation">
			<div className="space-y-6 animate-fade-in">
				{/* Back Button */}
				<Link to="/reservations">
					<Button variant="ghost" className="gap-2">
						<ArrowLeft className="h-4 w-4" />
						Back to Reservations
					</Button>
				</Link>

				{/* Reservation Form */}
				<Card className="shadow-card border-border/50">
					<CardHeader>
						<CardTitle className="text-lg">Create New Reservation</CardTitle>
						<p className="text-sm text-muted-foreground">
							Select a table to complete the reservation
						</p>
					</CardHeader>
					<CardContent className="space-y-6">
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="customerName" className="text-sm font-medium">
										Customer Name *
									</Label>
									<Input
										id="customerName"
										value={reservation.customerName}
										onChange={(e) =>
											handleInputChange("customerName", e.target.value)
										}
										placeholder="Enter customer name"
										required
										className="h-9"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="customerEmail" className="text-sm font-medium">
										Email *
									</Label>
									<Input
										id="customerEmail"
										type="email"
										value={reservation.customerEmail}
										onChange={(e) =>
											handleInputChange("customerEmail", e.target.value)
										}
										placeholder="Enter email address"
										required
										className="h-9"
									/>
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="customerPhone" className="text-sm font-medium">
										Phone *
									</Label>
									<Input
										id="customerPhone"
										value={reservation.customerPhone}
										onChange={(e) =>
											handleInputChange("customerPhone", e.target.value)
										}
										placeholder="Enter phone number"
										required
										className="h-9"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="numberOfGuests" className="text-sm font-medium">
										Number of Guests *
									</Label>
									<Input
										id="numberOfGuests"
										type="number"
										min="1"
										value={reservation.numberOfGuests}
										onChange={(e) =>
											handleInputChange(
												"numberOfGuests",
												parseInt(e.target.value) || 1,
											)
										}
										required
										className="h-9"
									/>
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="date" className="text-sm font-medium">
										Reservation Date & Time *
									</Label>
									<Input
										id="date"
										type="datetime-local"
										value={reservation.date}
										onChange={(e) =>
											handleInputChange("date", e.target.value)
										}
										required
										className="h-9"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="status" className="text-sm font-medium">
										Status
									</Label>
									<Select
										value={reservation.status}
										onValueChange={(value) =>
											handleInputChange(
												"status",
												value as "PENDING" | "CONFIRMED" | "CANCELLED",
											)
										}
									>
										<SelectTrigger id="status" className="h-9">
											<SelectValue placeholder="Select status" />
										</SelectTrigger>
										<SelectContent>
											{STATUS_OPTIONS.map((option) => (
												<SelectItem key={option.value} value={option.value}>
													{option.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>

							{/* Table Selection */}
							<div className="space-y-2">
								<Label className="text-sm font-medium">
									Select Table(s) *{" "}
									<span className="text-muted-foreground text-xs">
										(Select at least one)
									</span>
								</Label>
								{!reservation.date ? (
									<p className="text-sm text-muted-foreground">
										Please select a date and time first to see available tables
									</p>
								) : tablesLoading ? (
									<div className="flex items-center gap-2 text-sm text-muted-foreground">
										<Loader2 className="h-4 w-4 animate-spin" />
										Loading available tables...
									</div>
								) : suitableTables.length === 0 ? (
									<p className="text-sm text-destructive">
										No tables available for this date/time and guest count
									</p>
								) : (
									<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
										{suitableTables.map((table) => {
											const isSelected =
												reservation.selectedTables.includes(table.id);
											return (
												<Button
													key={table.id}
													type="button"
													variant={isSelected ? "default" : "outline"}
													className={`justify-start ${
														isSelected
															? "bg-primary text-primary-foreground"
															: ""
													}`}
													onClick={() => handleTableSelect(table.id)}
												>
													<Users className="h-4 w-4 mr-2" />
													Table {table.tableNumber}
													<span className="ml-auto text-xs opacity-70">
														{table.capacity} seats
													</span>
												</Button>
											);
										})}
									</div>
								)}
								{reservation.selectedTables.length > 0 && (
									<p className="text-sm text-success">
										Selected:{" "}
										{reservation.selectedTables
											.map(
												(id) =>
													`Table ${availableTables.find((t) => t.id === id)?.tableNumber}`,
											)
											.join(", ")}
									</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="notes" className="text-sm font-medium">
									Notes
								</Label>
								<Textarea
									id="notes"
									value={reservation.notes}
									onChange={(e) => handleInputChange("notes", e.target.value)}
									placeholder="Add any special requests or notes..."
									className="h-20"
								/>
							</div>

							<div className="flex justify-end gap-3 pt-4">
								<Button
									variant="outline"
									type="button"
									onClick={() => navigate("/reservations")}
								>
									Cancel
								</Button>
								<Button
									type="submit"
									className="gradient-primary text-primary-foreground shadow-glow hover:shadow-lg transition-shadow"
									disabled={!isFormValid || loading}
								>
									{loading ? (
										<>
											<Loader2 className="h-4 w-4 mr-2 animate-spin" />
											Creating...
										</>
									) : (
										"Create Reservation"
									)}
								</Button>
							</div>
						</form>
					</CardContent>
				</Card>
			</div>
		</MainLayout>
	);
}
