import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, DollarSign, Wrench, LogIn, LogOut } from "lucide-react";
import { api } from "../lib/api";

interface CalendarEvent {
  date: string;
  type: "payment" | "maintenance" | "move-in" | "move-out";
  label: string;
  room: string;
}

const EVENT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  payment: { bg: "bg-green-100", text: "text-green-700", border: "border-green-300" },
  maintenance: { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-300" },
  "move-in": { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-300" },
  "move-out": { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-300" },
};

const EVENT_ICONS: Record<string, any> = {
  payment: DollarSign,
  maintenance: Wrench,
  "move-in": LogIn,
  "move-out": LogOut,
};

// Normalize any date string to YYYY-MM-DD
function toDateStr(d: string | null | undefined): string {
  if (!d) return "";
  return d.substring(0, 10); // handles both "2026-04-23" and "2026-04-23T00:00:00.000000Z"
}

export function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString("default", { month: "long", year: "numeric" });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const [paymentsRes, maintenanceRes, tenantsRes] = await Promise.all([
          api.getPayments({ limit: "100" }),
          api.getMaintenance({ limit: "100" }),
          api.getTenants({ limit: "100" }),
        ]);

        const calEvents: CalendarEvent[] = [];

        // Payment due dates
        (paymentsRes.data || []).forEach((p: any) => {
          const d = toDateStr(p.dueDate || p.due_date);
          if (d) {
            calEvents.push({
              date: d,
              type: "payment",
              label: `$${p.amount}`,
              room: `Room ${p.room}`,
            });
          }
        });

        // Maintenance dates
        (maintenanceRes.data || []).forEach((m: any) => {
          const d = toDateStr(m.reportedDate || m.reported_date || m.created_at);
          if (d) {
            calEvents.push({
              date: d,
              type: "maintenance",
              label: (m.title || "Repair").substring(0, 20),
              room: `Room ${m.room}`,
            });
          }
        });

        // Tenant move-in/move-out dates
        (tenantsRes.data || []).forEach((t: any) => {
          const moveIn = toDateStr(t.moveInDate || t.move_in_date);
          if (moveIn) {
            calEvents.push({
              date: moveIn,
              type: "move-in",
              label: (t.name || "Tenant").split(" ")[0],
              room: `Room ${t.room}`,
            });
          }
          const moveOut = toDateStr(t.moveOutDate || t.move_out_date);
          if (moveOut) {
            calEvents.push({
              date: moveOut,
              type: "move-out",
              label: (t.name || "Tenant").split(" ")[0],
              room: `Room ${t.room}`,
            });
          }
        });

        setEvents(calEvents);
      } catch (err) {
        console.error("Failed to load calendar events:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter((e) => e.date === dateStr);
  };

  const isToday = (day: number) =>
    today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Calendar</h1>
        <p className="text-muted-foreground mt-1">View payment schedules and important dates</p>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm">
        <div className="p-6 flex items-center justify-between border-b border-border">
          <h2 className="text-2xl font-bold text-foreground">{monthName}</h2>
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="p-2 hover:bg-muted rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <button onClick={nextMonth} className="p-2 hover:bg-muted rounded-lg transition-colors">
              <ChevronRight className="w-5 h-5 text-foreground" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="p-4">
            <div className="grid grid-cols-7 mb-2">
              {days.map((d) => (
                <div key={d} className="text-center text-sm font-semibold text-muted-foreground py-2">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 border-t border-l border-border">
              {cells.map((day, idx) => {
                const dayEvents = day ? getEventsForDay(day) : [];
                return (
                  <div
                    key={idx}
                    className={`min-h-[100px] border-r border-b border-border p-1.5 ${
                      day ? "bg-card" : "bg-muted/20"
                    } ${isToday(day!) ? "bg-blue-50/50" : ""}`}
                  >
                    {day && (
                      <>
                        <span
                          className={`text-sm font-medium inline-flex ${
                            isToday(day)
                              ? "bg-primary text-primary-foreground w-7 h-7 rounded-full items-center justify-center"
                              : "text-foreground"
                          }`}
                        >
                          {day}
                        </span>
                        <div className="mt-1 space-y-1">
                          {dayEvents.slice(0, 2).map((ev, i) => {
                            const colors = EVENT_COLORS[ev.type];
                            const Icon = EVENT_ICONS[ev.type];
                            return (
                              <div
                                key={i}
                                className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs ${colors.bg} ${colors.text} border ${colors.border} truncate`}
                                title={`${ev.room} - ${ev.label}`}
                              >
                                <Icon className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{ev.room}</span>
                              </div>
                            );
                          })}
                          {dayEvents.length > 2 && (
                            <span className="text-xs text-muted-foreground pl-1">
                              +{dayEvents.length - 2} more
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm p-4">
        <div className="flex flex-wrap items-center justify-center gap-6">
          {[
            { type: "payment", label: "Payment Due" },
            { type: "maintenance", label: "Maintenance" },
            { type: "move-in", label: "Move-In" },
            { type: "move-out", label: "Move-Out" },
          ].map((item) => {
            const colors = EVENT_COLORS[item.type];
            return (
              <div key={item.type} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-sm ${colors.bg} border ${colors.border}`} />
                <span className="text-sm text-muted-foreground">{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
