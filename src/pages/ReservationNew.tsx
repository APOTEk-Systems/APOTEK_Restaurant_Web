import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ReservationService } from "@/services/reservationService";
import { TableService } from "@/services/tableService";
import { toast } from "@/components/ui/use-toast";

interface Table {
  id: number;
  number: number;
  capacity: number;
  status: string;
}

interface Reservation {
  id: number;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string;
  date: string;
  numberOfGuests: number;
  status: string;
  notes: string | null;
  tables: {
    id: number;
    tableId: number;
    table: {
      id: number;
      number: number;
      capacity: number;
      status: string;
    };
  }[];
}

export default function ReservationNew() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const editId = searchParams.get("editId");
  const passedReservation = location.state?.reservation as Reservation | undefined;
  const isEditing = !!editId || !!passedReservation;

  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    numberOfGuests: "",
    date: "",
    time: "",
    notes: ""
  });
  const [selectedTableIds, setSelectedTableIds] = useState<number[]>([]);

  // Fetch tables for selection
  const { data: tables = [], isLoading: isTablesLoading } = useQuery({
    queryKey: ['tables'],
    queryFn: TableService.getAllTables,
  });

  // Fetch all reservations to determine available tables based on selected date/time
  const { data: dateReservations = [] } = useQuery({
    queryKey: ['reservations', formData.date],
    queryFn: () => ReservationService.getReservations({
      startDate: formData.date ? new Date(`${formData.date}T00:00:00`).toISOString() : undefined,
      endDate: formData.date ? new Date(`${formData.date}T23:59:59`).toISOString() : undefined,
    }),
  });

  // Fetch reservation if editing
  const { data: existingReservation, isLoading: isLoadingReservation } = useQuery({
    queryKey: ['reservation', editId],
    queryFn: () => ReservationService.getReservationById(parseInt(editId!)),
    enabled: !!editId && !passedReservation,
  });

  // Get table IDs that are booked for the selected date (excluding current reservation when editing)
  const bookedTableIds = React.useMemo(() => {
    const bookedIds = new Set<number>();
    const reservations = dateReservations as unknown as Reservation[];
    
    reservations.forEach((reservation) => {
      // Skip the reservation being edited
      if (isEditing && (reservation.id === passedReservation?.id || reservation.id === existingReservation?.id)) {
        return;
      }
      
      // Check if the reservation is on the selected date and not cancelled
      if (formData.date && reservation.status !== 'CANCELLED') {
        const reservationDate = new Date(reservation.date);
        
        // Check if same day
        if (reservationDate.toISOString().split('T')[0] === formData.date) {
          reservation.tables.forEach((rt) => {
            bookedIds.add(rt.tableId);
          });
        }
      }
    });
    
    return bookedIds;
  }, [dateReservations, formData.date, isEditing, passedReservation, existingReservation]);

  // Pre-fill form with existing reservation data
  useEffect(() => {
    const reservation = passedReservation || existingReservation;
    if (reservation) {
      const reservationDate = new Date(reservation.date);
      const dateStr = reservationDate.toISOString().split('T')[0];
      // Use local time directly instead of toISOString to preserve the time
      const hours = reservationDate.getHours().toString().padStart(2, '0');
      const minutes = reservationDate.getMinutes().toString().padStart(2, '0');
      const timeStr = `${hours}:${minutes}`;
      
      setFormData({
        customerName: reservation.customerName,
        customerEmail: reservation.customerEmail || "",
        customerPhone: reservation.customerPhone,
        numberOfGuests: reservation.numberOfGuests.toString(),
        date: dateStr,
        time: timeStr,
        notes: reservation.notes || ""
      });
      setSelectedTableIds(reservation.tables.map(t => t.tableId));
    }
  }, [passedReservation, existingReservation]);


  // Create reservation mutation
  const createReservationMutation = useMutation({
    mutationFn: (data: any) => ReservationService.createReservation(data),
    onSuccess: () => {
      toast({
        title: "Reservation Created",
        description: "The reservation has been successfully created.",
      });
      navigate("/reservations");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create reservation. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update reservation mutation
  const updateReservationMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => ReservationService.updateReservation(id, data),
    onSuccess: () => {
      toast({
        title: "Reservation Updated",
        description: "The reservation has been successfully updated.",
      });
      navigate("/reservations");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update reservation. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTableSelect = (tableId: number) => {
    setSelectedTableIds(prev => {
      if (prev.includes(tableId)) {
        return prev.filter(id => id !== tableId);
      } else {
        return [...prev, tableId];
      }
    });
  };

  const getTotalCapacity = (): number => {
    return selectedTableIds.reduce((sum, tableId) => {
      const table = (tables as Table[]).find((t: Table) => t.id === tableId);
      return sum + (table?.capacity || 0);
    }, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerName || !formData.customerEmail || !formData.customerPhone || !formData.date || !formData.time) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (selectedTableIds.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one table.",
        variant: "destructive",
      });
      return;
    }

    const numberOfGuests = parseInt(formData.numberOfGuests) || 0;
    if (numberOfGuests <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid number of guests.",
        variant: "destructive",
      });
      return;
    }

    const totalCapacity = getTotalCapacity();
    if (numberOfGuests > totalCapacity) {
      toast({
        title: "Capacity Error",
        description: `Number of guests (${numberOfGuests}) exceeds total table capacity (${totalCapacity}).`,
        variant: "destructive",
      });
      return;
    }

    // Combine date and time into ISO string
    const dateTime = new Date(`${formData.date}T${formData.time}`);

    const reservationData = {
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      customerEmail: formData.customerEmail || undefined,
      date: dateTime.toISOString(),
      numberOfGuests: parseInt(formData.numberOfGuests) || 1,
      // When creating, default to CONFIRMED. When editing, keep existing status.
      status: isEditing ? (passedReservation?.status || existingReservation?.status) : "CONFIRMED",
      notes: formData.notes || undefined,
      tableIds: selectedTableIds,
    };

    if (isEditing) {
      const id = passedReservation?.id || existingReservation?.id;
      if (id) {
        updateReservationMutation.mutate({ id, data: reservationData });
      }
    } else {
      createReservationMutation.mutate(reservationData);
    }
  };

  // Get available tables (not booked for the selected date)
  const availableTables = (tables as Table[]).filter(t => !bookedTableIds.has(t.id));

  if (isLoadingReservation) {
    return (
      <MainLayout title="Loading..." subtitle="Please wait">
        <div className="space-y-6 animate-fade-in">
          <div className="text-center py-8">Loading reservation...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={isEditing ? "Edit Reservation" : "New Reservation"} subtitle={isEditing ? "Update an existing reservation" : "Create a new table reservation"}>
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
            <CardTitle className="text-lg">{isEditing ? "Edit Reservation" : "Create New Reservation"}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {isEditing ? "Update reservation details" : "Select tables and enter reservation details"}
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
                    value={formData.customerName}
                    onChange={(e) => handleInputChange("customerName", e.target.value)}
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
                    value={formData.customerEmail}
                    onChange={(e) => handleInputChange("customerEmail", e.target.value)}
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
                    value={formData.customerPhone}
                    onChange={(e) => handleInputChange("customerPhone", e.target.value)}
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
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={formData.numberOfGuests}
                    onChange={(e) => handleInputChange("numberOfGuests", e.target.value)}
                    placeholder="Enter number of guests"
                    required
                    className="h-9"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-sm font-medium">
                    Reservation Date *
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    required
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time" className="text-sm font-medium">
                    Reservation Time *
                  </Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => handleInputChange("time", e.target.value)}
                    required
                    className="h-9"
                  />
                </div>
              </div>

              {/* Table Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Select Tables * (Total Capacity: {getTotalCapacity()})
                </Label>
                {isTablesLoading ? (
                  <p className="text-sm text-muted-foreground">Loading tables...</p>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-40 overflow-y-auto p-2 border rounded-lg">
                    {(availableTables as Table[]).map((table: Table) => {
                      const isSelected = selectedTableIds.includes(table.id);
                      return (
                        <button
                          key={table.id}
                          type="button"
                          onClick={() => handleTableSelect(table.id)}
                          disabled={isEditing && bookedTableIds.has(table.id)}
                          className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                            isSelected
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted hover:bg-muted/80'
                          } ${isEditing && bookedTableIds.has(table.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          T{table.number}
                          <span className="block text-xs opacity-70">{table.capacity} seats</span>
                        </button>
                      );
                    })}
                  </div>
                )}
                {selectedTableIds.length === 0 && (
                  <p className="text-xs text-muted-foreground">Please select at least one table</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Add any special requests or notes..."
                  className="h-20"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" type="button" onClick={() => navigate("/reservations")}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="gradient-primary text-primary-foreground shadow-glow hover:shadow-lg transition-shadow"
                  disabled={createReservationMutation.isPending || updateReservationMutation.isPending}
                >
                  {createReservationMutation.isPending ? "Creating..." :
                   updateReservationMutation.isPending ? "Updating..." :
                   isEditing ? "Update Reservation" : "Create Reservation"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}