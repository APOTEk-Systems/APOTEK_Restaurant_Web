import { Clock, Users } from "lucide-react";
import { Loader2 } from "lucide-react";

interface UpcomingReservationsProps {
  reservations: any[];
  isLoading: boolean;
}

export function UpcomingReservations({ reservations = [], isLoading }: UpcomingReservationsProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  return (
    <div className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Today's Reservations</h3>
        <p className="text-sm text-muted-foreground">Upcoming bookings for today</p>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : reservations.length === 0 ? (
        <div className="px-6 py-12 text-center text-muted-foreground">
          No upcoming reservations
        </div>
      ) : (
        <div className="divide-y divide-border">
          {reservations.map((reservation) => (
            <div key={reservation.id} className="px-6 py-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">{reservation.customerName}</p>
                  <p className="text-sm text-muted-foreground">
                    {reservation.tables?.map((t: any) => t.number).join(', ') || 'TBD'}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {reservation.numberOfGuests || reservation.guestCount || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatTime(reservation.date)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
