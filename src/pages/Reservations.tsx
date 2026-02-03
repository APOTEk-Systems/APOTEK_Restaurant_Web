import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Users, Clock, Phone, Mail, MoreHorizontal, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ReservationService } from "@/services/reservationService";
import { toast } from "@/components/ui/use-toast";
import { TableService } from "@/services/tableService";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DateRange } from "@/components/ui/date-range-picker";

enum ReservationStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED"
}

// Backend returns tables with nested table object
interface ReservationTable {
  id: number;
  tableId: number;
  reservationId: number;
  table: {
    id: number;
    number: number;
    capacity: number;
    status: string;
  };
}

interface Reservation {
  id: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  date: string;
  numberOfGuests: number;
  status: ReservationStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  tables: ReservationTable[];
}

const statusStyles = {
  [ReservationStatus.PENDING]: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  [ReservationStatus.CONFIRMED]: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  [ReservationStatus.CANCELLED]: "bg-red-500/10 text-red-500 border-red-500/20",
  [ReservationStatus.COMPLETED]: "bg-muted text-muted-foreground border-border",
};

export default function Reservations() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const queryClient = useQueryClient();

  // Fetch reservations based on date range
  const { data: reservations = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['reservations', dateRange?.from, dateRange?.to],
    queryFn: async () => {
      if (dateRange?.from && dateRange?.to) {
        return ReservationService.getReservationsByDateRange(
          dateRange.from.toISOString(),
          dateRange.to.toISOString()
        );
      }
      return ReservationService.getAllReservations();
    },
  });

  // Fetch all tables for summary
  const { data: allTables = [] } = useQuery({
    queryKey: ['tables'],
    queryFn: TableService.getAllTables,
  });

  // Confirm reservation mutation
  const confirmMutation = useMutation({
    mutationFn: (id: number) => ReservationService.confirmReservation(id),
    onSuccess: () => {
      toast({
        title: "Reservation Confirmed",
        description: "The reservation has been confirmed.",
      });
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to confirm reservation.",
        variant: "destructive",
      });
    },
  });

  // Cancel reservation mutation
  const cancelMutation = useMutation({
    mutationFn: (id: number) => ReservationService.cancelReservation(id),
    onSuccess: () => {
      toast({
        title: "Reservation Cancelled",
        description: "The reservation has been cancelled.",
      });
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to cancel reservation.",
        variant: "destructive",
      });
    },
  });

  // Filter reservations based on search and status
  const filteredReservations = (reservations as unknown as Reservation[]).filter((reservation) => {
    const matchesSearch = 
      reservation.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reservation.customerPhone.includes(searchQuery) ||
      (reservation.customerEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    
    const matchesStatus = statusFilter === "all" || reservation.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate summary stats for the filtered date range
  const summaryReservations = (reservations as unknown as Reservation[]).filter((r) => {
    const reservationDate = new Date(r.date);
    return dateRange 
      ? reservationDate >= dateRange.from && reservationDate <= dateRange.to
      : true;
  });

  const totalGuestsSummary = summaryReservations.reduce((sum, r) => sum + r.numberOfGuests, 0);
  const tablesReservedSummary = summaryReservations.reduce((sum, r) => sum + (r.tables?.length || 0), 0);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const getTableDisplay = (reservation: Reservation): string => {
    if (!reservation.tables || reservation.tables.length === 0) return "Not assigned";
    if (reservation.tables.length === 1) return `Table ${reservation.tables[0].table.number}`;
    const numbers = reservation.tables.map(t => t.table.number).sort((a, b) => a - b);
    return `Tables ${numbers.join('-')}`;
  };

  const clearDateRange = () => {
    setDateRange(undefined);
  };

  if (isLoading) {
    return (
      <MainLayout title="Reservations" subtitle="Manage table bookings and reservations">
        <div className="space-y-6 animate-fade-in">
          <div className="text-center py-8">Loading reservations...</div>
        </div>
      </MainLayout>
    );
  }

  if (isError) {
    return (
      <MainLayout title="Reservations" subtitle="Manage table bookings and reservations">
        <div className="space-y-6 animate-fade-in">
          <div className="text-center py-8 text-destructive">
            Error loading reservations: {(error as Error)?.message || 'Unknown error'}
          </div>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Reservations" subtitle="Manage table bookings and reservations">
      <div className="space-y-6 animate-fade-in">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search reservations..." 
                className="pl-9"
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
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <DateRangePicker
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
            />
            {dateRange && (
              <Button variant="outline" size="sm" onClick={clearDateRange}>
                Clear
              </Button>
            )}
          </div>
          <Link to="/reservations/new">
            <Button className="gradient-primary text-primary-foreground shadow-glow hover:shadow-lg transition-shadow">
              <Plus className="h-4 w-4 mr-2" />
              New Reservation
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Summary Card */}
          <div className="bg-card rounded-xl shadow-card border border-border/50 p-4">
            <div className="mt-4 pt-4 border-t border-border">
              <h4 className="font-medium text-foreground mb-2">
                {dateRange ? 'Date Range Summary' : 'All Reservations'}
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Reservations</span>
                  <span className="font-medium text-foreground">{summaryReservations.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Guests</span>
                  <span className="font-medium text-foreground">{totalGuestsSummary}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tables Reserved</span>
                  <span className="font-medium text-foreground">{tablesReservedSummary}/{allTables.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Reservations List */}
          <div className="lg:col-span-2 space-y-4">
            {filteredReservations.length > 0 ? (
              filteredReservations.map((reservation) => (
                <div key={reservation.id} className="bg-card rounded-xl p-5 shadow-card border border-border/50 hover:shadow-card-hover transition-all duration-300">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{reservation.customerName}</h3>
                        <Badge className={cn("capitalize", statusStyles[reservation.status as keyof typeof statusStyles])}>
                          {reservation.status.toLowerCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{getTableDisplay(reservation)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {reservation.status === ReservationStatus.PENDING && (
                        <>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-emerald-500 hover:text-emerald-500 hover:bg-emerald-500/10"
                            onClick={() => confirmMutation.mutate(reservation.id)}
                            disabled={confirmMutation.isPending}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-500 hover:text-red-500 hover:bg-red-500/10"
                            onClick={() => cancelMutation.mutate(reservation.id)}
                            disabled={cancelMutation.isPending}
                          >
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
                      <span>{formatDate(reservation.date)}, {formatTime(reservation.date)}</span>
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
                      <span className="truncate">{reservation.customerEmail || 'N/A'}</span>
                    </div>
                  </div>
                  {reservation.notes && (
                    <p className="text-sm text-muted-foreground mt-3 pt-3 border-t border-border italic">
                      Note: {reservation.notes}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No reservations found
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
