import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TableService } from "@/services/tableService";
import type { Table } from "@/services/tableService";
import { useToast } from "@/hooks/use-toast";

export default function ReservationNew() {
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    numberOfGuests: 1,
    reservationDate: "",
    reservationTime: "",
    status: "PENDING",
    notes: ""
  });
  const [selectedTableIds, setSelectedTableIds] = useState<number[]>([]);
  const [availableTables, setAvailableTables] = useState<Table[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch available tables for the selected date
  const { data: tables, isLoading: isTablesLoading } = useQuery({
    queryKey: ['availableTablesForReservation', formData.reservationDate],
    queryFn: () => TableService.getAvailableTables(formData.reservationDate),
    enabled: !!formData.reservationDate,
  });

  useEffect(() => {
    if (tables) {
      setAvailableTables(tables);
    }
  }, [tables]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTableSelect = (tableId: string) => {
    const id = parseInt(tableId);
    if (selectedTableIds.includes(id)) {
      setSelectedTableIds(prev => prev.filter(t => t !== id));
    } else {
      setSelectedTableIds(prev => [...prev, id]);
    }
  };

  // Create reservation mutation
  const createReservationMutation = useMutation({
    mutationFn: (data: {
      customerName: string;
      customerPhone: string;
      customerEmail?: string;
      date: string;
      numberOfGuests: number;
      tableIds: number[];
      notes?: string;
      status?: string;
    }) => TableService.createReservation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayReservations'] });
      queryClient.invalidateQueries({ queryKey: ['availableTables'] });
      toast({
        title: "Success",
        description: "Reservation created successfully",
        variant: "default",
      });
      navigate("/reservations");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create reservation",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedTableIds.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one table",
        variant: "destructive",
      });
      return;
    }

    // Combine date and time
    const dateTime = `${formData.reservationDate}T${formData.reservationTime}:00Z`;

    createReservationMutation.mutate({
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      customerEmail: formData.customerEmail || undefined,
      date: dateTime,
      numberOfGuests: formData.numberOfGuests,
      tableIds: selectedTableIds,
      notes: formData.notes || undefined,
      status: formData.status,
    });
  };

  // Get total capacity of selected tables
  const totalCapacity = selectedTableIds.reduce((sum, id) => {
    const table = availableTables.find(t => t.id === id);
    return sum + (table?.capacity || 0);
  }, 0);

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
              Select an available table for the reservation
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Customer Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.customerName}
                    onChange={(e) => handleInputChange("customerName", e.target.value)}
                    placeholder="Enter customer name"
                    required
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => handleInputChange("customerEmail", e.target.value)}
                    placeholder="Enter email address"
                    className="h-9"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Phone *
                  </Label>
                  <Input
                    id="phone"
                    value={formData.customerPhone}
                    onChange={(e) => handleInputChange("customerPhone", e.target.value)}
                    placeholder="Enter phone number"
                    required
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guests" className="text-sm font-medium">
                    Number of Guests *
                  </Label>
                  <Input
                    id="guests"
                    type="number"
                    min="1"
                    value={formData.numberOfGuests}
                    onChange={(e) => handleInputChange("numberOfGuests", parseInt(e.target.value))}
                    required
                    className="h-9"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reservationDate" className="text-sm font-medium">
                    Reservation Date *
                  </Label>
                  <Input
                    id="reservationDate"
                    type="date"
                    value={formData.reservationDate}
                    onChange={(e) => handleInputChange("reservationDate", e.target.value)}
                    required
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reservationTime" className="text-sm font-medium">
                    Reservation Time *
                  </Label>
                  <Input
                    id="reservationTime"
                    type="time"
                    value={formData.reservationTime}
                    onChange={(e) => handleInputChange("reservationTime", e.target.value)}
                    required
                    className="h-9"
                  />
                </div>
              </div>

              {/* Table Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Select Tables *
                </Label>
                {isTablesLoading ? (
                  <div className="text-sm text-muted-foreground">Loading available tables...</div>
                ) : formData.reservationDate ? (
                  availableTables.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {availableTables.map((table) => {
                        const isSelected = selectedTableIds.includes(table.id);
                        const hasEnoughCapacity = (totalCapacity - (isSelected ? table.capacity : 0) + table.capacity) >= formData.numberOfGuests;
                        
                        return (
                          <div
                            key={table.id}
                            onClick={() => handleTableSelect(table.id.toString())}
                            className={`
                              p-3 rounded-lg border cursor-pointer transition-all
                              ${isSelected
                                ? 'bg-primary/10 border-primary'
                                : hasEnoughCapacity
                                  ? 'bg-card hover:bg-muted/50 border-border'
                                  : 'bg-muted/30 border-border opacity-50 cursor-not-allowed'
                              }
                            `}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">Table {table.number}</span>
                              {isSelected && <CheckCircle className="h-4 w-4 text-primary" />}
                            </div>
                            <div className="text-sm text-muted1">
                              Capacity {table.capacity}
                            </div>
                            {table.reservationDue && (
                              <div className="text-xs text-muted-foreground mt-1">
                                Reserved: {new Date(table.reservationDue).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-4 bg-muted/30 rounded-lg text-muted-foreground">
                      <AlertCircle className="h-5 w-5" />
                      <span>No available tables for this date</span>
                    </div>
                  )
                ) : (
                  <div className="text-sm text-muted-foreground">
                    Select a reservation date to see available tables
                  </div>
                )}
                
                {/* Capacity Summary */}
                {selectedTableIds.length > 0 && (
                  <div className={`flex items-center gap-2 p-3 rounded-lg mt-2 ${
                    totalCapacity >= formData.numberOfGuests
                      ? 'bg-success/10 text-success'
                      : 'bg-destructive/10 text-destructive'
                  }`}>
                    <span className="font-medium">
                      Total Capacity: {totalCapacity} / {formData.numberOfGuests} guests
                    </span>
                    {totalCapacity >= formData.numberOfGuests ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium">
                  Status
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange("status", value)}
                >
                  <SelectTrigger id="status" className="h-9">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
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
                  disabled={
                    !formData.customerName ||
                    !formData.customerPhone ||
                    !formData.reservationDate ||
                    !formData.reservationTime ||
                    selectedTableIds.length === 0 ||
                    totalCapacity < formData.numberOfGuests ||
                    createReservationMutation.isPending
                  }
                >
                  {createReservationMutation.isPending ? "Creating..." : "Create Reservation"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}