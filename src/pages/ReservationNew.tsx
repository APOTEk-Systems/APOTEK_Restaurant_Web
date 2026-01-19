import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ReservationNew() {
  const [reservation, setReservation] = useState({
    name: "",
    email: "",
    phone: "",
    guests: 1,
    reservationDate: "",
    reservationTime: "",
    status: "pending",
    notes: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setReservation(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("New reservation:", reservation);
    // Here you would typically add the reservation to your data store
    // The system will automatically assign a table after scanning available tables
  };

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
              The system will automatically assign a table after scanning available tables
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
                    value={reservation.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter customer name"
                    required
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={reservation.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Enter email address"
                    required
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
                    value={reservation.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
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
                    value={reservation.guests}
                    onChange={(e) => handleInputChange("guests", e.target.value)}
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
                    value={reservation.reservationDate}
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
                    value={reservation.reservationTime}
                    onChange={(e) => handleInputChange("reservationTime", e.target.value)}
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
                  value={reservation.status}
                  onValueChange={(value) => handleInputChange("status", value)}
                >
                  <SelectTrigger id="status" className="h-9">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
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
                <Button variant="outline" type="button">
                  Save Draft
                </Button>
                <Button
                  type="submit"
                  className="gradient-primary text-primary-foreground shadow-glow hover:shadow-lg transition-shadow"
                  disabled={
                    !reservation.name ||
                    !reservation.email ||
                    !reservation.phone ||
                    !reservation.reservationDate ||
                    !reservation.reservationTime
                  }
                >
                  Create Reservation
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}