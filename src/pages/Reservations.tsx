import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DateRangePicker, DateRange } from "@/components/ui/date-range-picker";
import { Plus, Search, Users, Clock, Phone, Mail, MoreHorizontal, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { TableService, Reservation as ReservationType } from "@/services/tableService";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const statusStyles: Record<string, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  confirmed: "bg-success/10 text-success border-success/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  completed: "bg-muted text-muted-foreground border-border",
};

export default function Reservations() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(),
    to: new Date(),
  });
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  // Convert date range to API format
  const startDate = dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : "";
  const endDate = dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : "";

  // Fetch reservations by date range
  const { data: reservations, isLoading: isReservationsLoading } = useQuery({
    queryKey: ['reservationsByDateRange', startDate, endDate],
    queryFn: () => TableService.getReservationsByDateRange(startDate, endDate),
    enabled: !!startDate && !!endDate,
  });

  // Fetch booked tables for today (for summary)
  const { data: bookedTables } = useQuery({
    queryKey: ['bookedTables'],
    queryFn: TableService.getBookedTables,
  });

  // Filter reservations
  const filteredReservations = reservations?.filter((r: ReservationType) => {
    const matchesStatus = statusFilter === "all" || r.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSearch = r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.customerPhone.includes(searchQuery);
    return matchesStatus && matchesSearch;
  }) || [];

  // Calculate summary
  const totalGuests = filteredReservations.reduce((sum: number, r: ReservationType) => sum + r.numberOfGuests, 0);
  const tablesReserved = new Set(bookedTables?.map((t: any) => t.id)).size || 0;

  // Format date helper
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
    };
  };

  return (
    <MainLayout title="Reservations" subtitle="Manage table bookings and reservations">
      <div className="space-y-6 animate-fade-in">
        {/* Date Range Filter & Actions Bar */}
        <div className="flex flex-col lg:flex-row gap-4 items-start">
          <div className="flex flex-1 gap-3">
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or phone..."
                className="pl-9 "
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
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

               <div className="flex flex-col sm:flex-row gap-4 items-start lg:items-center">
            <DateRangePicker
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
            />
          </div> 
          </div>
          <Link to="/reservations/new">
            <Button className="gradient-primary text-primary-foreground shadow-glow hover:shadow-lg transition-shadow">
              <Plus className="h-4 w-4 mr-2" />
              New Reservation
            </Button>
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-card rounded-xl p-4 shadow-card border border-border/50">
            <div className="text-sm text-muted-foreground">Total Reservations</div>
            <div className="text-2xl font-semibold">{filteredReservations.length}</div>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-card border border-border/50">
            <div className="text-sm text-muted-foreground">Total Guests</div>
            <div className="text-2xl font-semibold">{totalGuests}</div>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-card border border-border/50">
            <div className="text-sm text-muted-foreground">Tables Reserved</div>
            <div className="text-2xl font-semibold">{tablesReserved}</div>
          </div>
        </div>

        {/* Reservations List */}
        <div className="space-y-4">
            {isReservationsLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading reservations...</div>
            ) : filteredReservations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No reservations found for today</p>
                <Link to="/reservations/new">
                  <Button variant="link" className="mt-2">Create a new reservation</Button>
                </Link>
              </div>
            ) : (
              filteredReservations.map((reservation: ReservationType) => {
                const { date: dateStr, time } = formatDateTime(reservation.date);
                const tableNames = reservation.tables?.map((t: { table: { number: number } }) => `Table ${t.table.number}`).join(', ') || 'No table assigned';

                return (
                  <div key={reservation.id} className="bg-card rounded-xl p-5 shadow-card border border-border/50 hover:shadow-card-hover transition-all duration-300">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{reservation.customerName}</h3>
                          <Badge className={cn("capitalize", statusStyles[reservation.status?.toLowerCase() || "pending"])}>
                            {reservation.status || "pending"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{tableNames}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{dateStr}, {time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{reservation.numberOfGuests} guests</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{reservation.customerPhone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span className="truncate">{reservation.customerEmail || "N/A"}</span>
                      </div>
                    </div>
                    {reservation.notes && (
                      <p className="text-sm text-muted-foreground mt-3 pt-3 border-t border-border italic">
                        Note: {reservation.notes}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
      </div>
    </MainLayout>
  );
}
