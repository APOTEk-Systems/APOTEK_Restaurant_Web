import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

export default function ReservationNew() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    numberOfGuests: 1,
    date: "",
    time: "",
    status: "PENDING",
    notes: ""
  });
  const [selectedTableIds, setSelectedTableIds] = useState<number[]>([]);

  // Fetch tables for selection
  const { data: tables = [], isLoading: isTablesLoading } = useQuery({
    queryKey: ['tables'],
    queryFn: TableService.getAllTables,
  });

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

    const totalCapacity = getTotalCapacity();
    if (formData.numberOfGuests > totalCapacity) {
      toast({
        title: "Capacity Error",
        description: `Number of guests (${formData.numberOfGuests}) exceeds total table capacity (${totalCapacity}).`,
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
      numberOfGuests: formData.numberOfGuests,
      status: formData.status,
      notes: formData.notes || undefined,
      tableIds: selectedTableIds,
    };

    createReservationMutation.mutate(reservationData);
  };

  // Filter available tables
  const availableTables = (tables as Table[]).filter(t => t.status !== 'OCCUPIED');

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
              Select tables and enter reservation details
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
                    type="number"
                    min="1"
                    value={formData.numberOfGuests}
                    onChange={(e) => handleInputChange("numberOfGuests", parseInt(e.target.value) || 1)}
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
                          className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                            isSelected
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted hover:bg-muted/80'
                          }`}
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
                  disabled={createReservationMutation.isPending}
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