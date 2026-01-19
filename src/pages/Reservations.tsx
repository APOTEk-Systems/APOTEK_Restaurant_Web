import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Users, Clock, Phone, Mail, MoreHorizontal, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Link } from "react-router-dom";

const reservations = [
  { id: 1, name: "Johnson Family", email: "johnson@email.com", phone: "(555) 123-4567", guests: 4, date: "Today", time: "6:00 PM", table: "Table 5", status: "confirmed", notes: "Birthday celebration" },
  { id: 2, name: "Smith Corporation", email: "events@smith.com", phone: "(555) 234-5678", guests: 12, date: "Today", time: "7:00 PM", table: "Private Room", status: "confirmed", notes: "Corporate dinner" },
  { id: 3, name: "David & Maria", email: "david.m@email.com", phone: "(555) 345-6789", guests: 2, date: "Today", time: "7:30 PM", table: "Table 8", status: "pending", notes: "Anniversary dinner" },
  { id: 4, name: "Williams Party", email: "sarah.w@email.com", phone: "(555) 456-7890", guests: 8, date: "Today", time: "8:00 PM", table: "Tables 10-11", status: "confirmed", notes: "" },
  { id: 5, name: "Chen Family", email: "chen.family@email.com", phone: "(555) 567-8901", guests: 6, date: "Tomorrow", time: "6:30 PM", table: "Table 3", status: "pending", notes: "Window seat preferred" },
  { id: 6, name: "Martinez Wedding", email: "martinez@email.com", phone: "(555) 678-9012", guests: 20, date: "Saturday", time: "5:00 PM", table: "Full Restaurant", status: "confirmed", notes: "Rehearsal dinner" },
];

const statusStyles = {
  pending: "bg-warning/10 text-warning border-warning/20",
  confirmed: "bg-success/10 text-success border-success/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  completed: "bg-muted text-muted-foreground border-border",
};

export default function Reservations() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <MainLayout title="Reservations" subtitle="Manage table bookings and reservations">
      <div className="space-y-6 animate-fade-in">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-3">
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search reservations..." className="pl-9" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Link to="/reservations/new">
            <Button className="gradient-primary text-primary-foreground shadow-glow hover:shadow-lg transition-shadow">
              <Plus className="h-4 w-4 mr-2" />
              New Reservation
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="bg-card rounded-xl shadow-card border border-border/50 p-4">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md"
            />
            <div className="mt-4 pt-4 border-t border-border">
              <h4 className="font-medium text-foreground mb-2">Today's Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Reservations</span>
                  <span className="font-medium text-foreground">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Guests</span>
                  <span className="font-medium text-foreground">48</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tables Reserved</span>
                  <span className="font-medium text-foreground">15/24</span>
                </div>
              </div>
            </div>
          </div>

          {/* Reservations List */}
          <div className="lg:col-span-2 space-y-4">
            {reservations.map((reservation) => (
              <div key={reservation.id} className="bg-card rounded-xl p-5 shadow-card border border-border/50 hover:shadow-card-hover transition-all duration-300">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{reservation.name}</h3>
                      <Badge className={cn("capitalize", statusStyles[reservation.status as keyof typeof statusStyles])}>
                        {reservation.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{reservation.table}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {reservation.status === "pending" && (
                      <>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-success hover:text-success hover:bg-success/10">
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{reservation.date}, {reservation.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{reservation.guests} guests</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{reservation.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{reservation.email}</span>
                  </div>
                </div>
                {reservation.notes && (
                  <p className="text-sm text-muted-foreground mt-3 pt-3 border-t border-border italic">
                    Note: {reservation.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
