import { Clock, Users } from "lucide-react";

const reservations = [
  { name: "Johnson Family", time: "6:00 PM", guests: 4, table: "Table 5" },
  { name: "Corporate Dinner", time: "7:00 PM", guests: 12, table: "Private Room" },
  { name: "Anniversary Couple", time: "7:30 PM", guests: 2, table: "Table 8" },
  { name: "Birthday Party", time: "8:00 PM", guests: 8, table: "Tables 10-11" },
];

export function UpcomingReservations() {
  return (
    <div className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Today's Reservations</h3>
        <p className="text-sm text-muted-foreground">Upcoming bookings for today</p>
      </div>
      <div className="divide-y divide-border">
        {reservations.map((reservation) => (
          <div key={reservation.name} className="px-6 py-4 hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">{reservation.name}</p>
                <p className="text-sm text-muted-foreground">{reservation.table}</p>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {reservation.guests}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {reservation.time}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
