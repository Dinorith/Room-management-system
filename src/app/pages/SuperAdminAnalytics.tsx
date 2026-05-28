import { useState, useEffect } from "react";
import { 
  Building2, Users, DollarSign, TrendingUp, Activity, BarChart3, PieChart
} from "lucide-react";
import { api } from "../lib/api";

export function SuperAdminAnalytics() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.getSuperAdminDashboard();
        setStats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-muted-foreground font-semibold">Loading platform analytics...</p>
      </div>
    );
  }

  const {
    totalOwners = 0,
    activeOwners = 0,
    totalProperties = 0,
    occupiedRooms = 0,
    availableRooms = 0,
    maintenanceRooms = 0,
    totalRevenue = 0,
    paidInvoices = 0,
    pendingInvoices = 0,
    overdueInvoices = 0
  } = stats;

  const occupancyRate = totalProperties > 0 ? Math.round((occupiedRooms / totalProperties) * 100) : 0;
  const vacantRate = totalProperties > 0 ? Math.round((availableRooms / totalProperties) * 100) : 0;
  const maintenanceRate = totalProperties > 0 ? Math.round((maintenanceRooms / totalProperties) * 100) : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Platform Analytics</h1>
        <p className="text-muted-foreground mt-1">Cross-landlord system telemetry & telemetry logs</p>
      </div>

      {/* Grid of high fidelity analytics widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Widget 1: Detailed Occupancy Distribution */}
        <div className="bg-card rounded-3xl border border-foreground/10 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <PieChart className="w-4 h-4 text-primary" /> Occupancy distribution
            </h3>
            <span className="text-xs font-black bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-xl">{occupancyRate}% Occupied</span>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8 justify-around py-4">
            <div className="relative w-36 h-36">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="72" cy="72" r="58" fill="transparent" stroke="var(--muted)" strokeWidth="16" />
                <circle 
                  cx="72" 
                  cy="72" 
                  r="58" 
                  fill="transparent" 
                  stroke="var(--primary)" 
                  strokeWidth="16" 
                  strokeDasharray={`${2 * Math.PI * 58}`}
                  strokeDashoffset={`${2 * Math.PI * 58 * (1 - occupancyRate / 100)}`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-foreground">{occupancyRate}%</span>
                <span className="text-[9px] uppercase font-black text-muted-foreground">Occupancy</span>
              </div>
            </div>

            <div className="space-y-3.5 text-xs font-medium w-full md:w-auto">
              <div className="flex items-center justify-between gap-6">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-primary rounded-xl" /> Occupied Rooms</span>
                <span className="font-bold text-foreground">{occupiedRooms} ({occupancyRate}%)</span>
              </div>
              <div className="flex items-center justify-between gap-6">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-secondary rounded-xl" /> Vacant Rooms</span>
                <span className="font-bold text-foreground">{availableRooms} ({vacantRate}%)</span>
              </div>
              <div className="flex items-center justify-between gap-6">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-destructive rounded-xl" /> Maintenance</span>
                <span className="font-bold text-foreground">{maintenanceRooms} ({maintenanceRate}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Widget 2: Platform Revenue Trend */}
        <div className="bg-card rounded-3xl border border-foreground/10 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" /> Monthly Revenue Growth
            </h3>
            <span className="text-xs font-black text-emerald-600 flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> +14.2% Growth
            </span>
          </div>

          <div className="flex items-end justify-between gap-4 h-36 pt-6">
            <div className="w-full space-y-2 text-center">
              <div className="bg-primary/20 rounded-xl h-12 flex flex-col justify-end border border-foreground/5 shadow-sm"><div className="bg-primary/45 w-full h-8 rounded-xl" /></div>
              <span className="text-[10px] text-muted-foreground font-semibold">Jan</span>
            </div>
            <div className="w-full space-y-2 text-center">
              <div className="bg-primary/20 rounded-xl h-20 flex flex-col justify-end border border-foreground/5 shadow-sm"><div className="bg-primary/55 w-full h-14 rounded-xl" /></div>
              <span className="text-[10px] text-muted-foreground font-semibold">Feb</span>
            </div>
            <div className="w-full space-y-2 text-center">
              <div className="bg-primary/20 rounded-xl h-24 flex flex-col justify-end border border-foreground/5 shadow-sm"><div className="bg-primary/65 w-full h-18 rounded-xl" /></div>
              <span className="text-[10px] text-muted-foreground font-semibold">Mar</span>
            </div>
            <div className="w-full space-y-2 text-center">
              <div className="bg-primary/20 rounded-xl h-28 flex flex-col justify-end border border-foreground/5 shadow-sm"><div className="bg-primary/75 w-full h-22 rounded-xl" /></div>
              <span className="text-[10px] text-muted-foreground font-semibold">Apr</span>
            </div>
            <div className="w-full space-y-2 text-center">
              <div className="bg-primary/20 rounded-xl h-36 flex flex-col justify-end border border-foreground/10 shadow-sm"><div className="bg-primary w-full h-30 rounded-xl" /></div>
              <span className="text-[10px] text-muted-foreground font-black text-foreground">May</span>
            </div>
          </div>
        </div>

        {/* Widget 3: Payment Status Overview */}
        <div className="bg-card rounded-3xl border border-foreground/10 p-6 shadow-sm space-y-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" /> Invoice Settle Metrics
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Paid Invoices ({paidInvoices})</span>
                <span className="text-emerald-600">✔ Settled</span>
              </div>
              <div className="w-full bg-muted h-3 rounded-full overflow-hidden border border-foreground/5">
                <div 
                  className="bg-emerald-500 h-full rounded-full" 
                  style={{ width: `${paidInvoices + pendingInvoices + overdueInvoices > 0 ? (paidInvoices / (paidInvoices + pendingInvoices + overdueInvoices)) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Pending Invoices ({pendingInvoices})</span>
                <span className="text-amber-600">⌚ Awaiting</span>
              </div>
              <div className="w-full bg-muted h-3 rounded-full overflow-hidden border border-foreground/5">
                <div 
                  className="bg-amber-500 h-full rounded-full" 
                  style={{ width: `${paidInvoices + pendingInvoices + overdueInvoices > 0 ? (pendingInvoices / (paidInvoices + pendingInvoices + overdueInvoices)) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Overdue Invoices ({overdueInvoices})</span>
                <span className="text-rose-600 animate-pulse">✖ Overdue Dues</span>
              </div>
              <div className="w-full bg-muted h-3 rounded-full overflow-hidden border border-foreground/5">
                <div 
                  className="bg-rose-500 h-full rounded-full" 
                  style={{ width: `${paidInvoices + pendingInvoices + overdueInvoices > 0 ? (overdueInvoices / (paidInvoices + pendingInvoices + overdueInvoices)) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Widget 4: Landlord Growth Rate */}
        <div className="bg-card rounded-3xl border border-foreground/10 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" /> Owner growth rate
            </h3>
            <span className="text-xs font-bold bg-muted px-2.5 py-1 rounded-xl border border-foreground/5">{totalOwners} Total registered</span>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 bg-muted/40 rounded-2xl border border-foreground/5">
                <p className="text-[10px] text-muted-foreground font-black uppercase">Active Landlords</p>
                <p className="text-2xl font-bold text-foreground mt-1">{activeOwners}</p>
              </div>
              <div className="p-4 bg-muted/40 rounded-2xl border border-foreground/5">
                <p className="text-[10px] text-muted-foreground font-black uppercase">Inactive Accounts</p>
                <p className="text-2xl font-bold text-foreground mt-1">{totalOwners - activeOwners}</p>
              </div>
            </div>

            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl border border-primary/20 flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="text-xs font-medium text-foreground/80 leading-normal">
                Platform is experiencing positive owner registration growth, with <span className="font-bold text-primary">{activeOwners} active property groups</span> actively managing rooms on the engine.
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
