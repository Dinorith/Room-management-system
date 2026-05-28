import { useState, useEffect } from "react";
import {
  Building2,
  Users,
  DollarSign,
  UserCheck,
  ShieldCheck,
  TrendingUp,
  RefreshCw,
  Plus,
  ArrowRight,
  AlertCircle,
  FileText,
  Clock,
  AlertTriangle,
  Activity,
  Database,
  Info
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import { StatCard } from "../components/StatCard";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { api } from "../lib/api";

export function SuperAdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      setError(null);
      const response = await api.getSuperAdminDashboard();
      setData(response.data);
    } catch (err: any) {
      console.error("Failed to fetch super admin dashboard data:", err);
      setError(err.message || String(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-destructive animate-pulse border border-solid border-foreground" />
          <p className="text-sm text-muted-foreground font-medium">Loading console dashboard...</p>
        </div>
      </div>
    );
  }

  const {
    totalOwners = 0,
    activeOwners = 0,
    inactiveOwners = 0,
    totalProperties = 0,
    availableRooms = 0,
    occupiedRooms = 0,
    maintenanceRooms = 0,
    totalTenants = 0,
    totalRevenue = 0,
    totalInvoices = 0,
    paidInvoices = 0,
    pendingInvoices = 0,
    overdueInvoices = 0,
    recentProperties = [],
    recentOwners = [],
    recentPayments = [],
    recentLogs = [],
    systemSummary = { status: "Active", database: "Operational", totalRecords: 0 }
  } = data || {};

  const occupancyRate = totalProperties > 0
    ? Math.round((occupiedRooms / totalProperties) * 100)
    : 0;

  return (
    <div className="space-y-8">
      {/* Welcome & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-2">
            Super Admin Console
          </h1>
          <p className="text-muted-foreground mt-1">Global oversight, administrative controls & telemetry logs</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            icon={RefreshCw}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => navigate("/super-admin/owners")}
          >
            Add Owner
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl border border-destructive/35 bg-destructive/10 text-destructive text-sm font-semibold flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>API Connection Error: {error} (Confirm backend PHP server is running)</span>
        </div>
      )}

      {/* 1. System-wide Telemetry Metrics */}
      <div>
        <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-primary" /> Main Statistics Cards
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Landlords"
            value={String(totalOwners)}
            icon={Users}
            trend={`${activeOwners} active · ${inactiveOwners} suspended`}
            trendUp={activeOwners > 0}
            color="blue"
          />
          <StatCard
            title="Total Rooms capacity"
            value={String(totalProperties)}
            icon={Building2}
            trend={`${occupiedRooms} occupied · ${availableRooms} vacant`}
            trendUp={occupiedRooms > 0}
            color="orange"
          />
          <StatCard
            title="Live Occupancy Rate"
            value={`${occupancyRate}%`}
            icon={TrendingUp}
            trend={`${maintenanceRooms} rooms offline (maintenance)`}
            trendUp={occupancyRate > 50}
            color="green"
          />
          <StatCard
            title="Global System Revenue"
            value={`$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={DollarSign}
            trend="Total settled payments"
            trendUp={totalRevenue > 0}
            color="green"
          />
        </div>
      </div>

      {/* 2. System Financial Overview */}
      <div className="bg-card rounded-3xl border border-foreground/10 p-6 shadow-sm">
        <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-1.5">
          <DollarSign className="w-4 h-4 text-primary" /> Invoice & Payment Telemetry
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="p-4 bg-muted/40 rounded-2xl border border-foreground/5">
            <p className="text-[10px] text-muted-foreground font-black uppercase">Total Invoices</p>
            <p className="text-2xl font-bold text-foreground mt-1">{totalInvoices}</p>
          </div>
          <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
            <p className="text-[10px] text-emerald-600 font-black uppercase">Paid Invoices</p>
            <p className="text-2xl font-bold text-emerald-700 mt-1">{paidInvoices}</p>
          </div>
          <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10">
            <p className="text-[10px] text-amber-600 font-black uppercase">Pending Invoices</p>
            <p className="text-2xl font-bold text-amber-700 mt-1">{pendingInvoices}</p>
          </div>
          <div className="p-4 bg-rose-500/5 rounded-2xl border border-rose-500/10">
            <p className="text-[10px] text-rose-600 font-black uppercase">Overdue Invoices</p>
            <p className="text-2xl font-bold text-rose-700 mt-1">{overdueInvoices}</p>
          </div>
          <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20 col-span-2 md:col-span-1">
            <p className="text-[10px] text-primary font-black uppercase">Gross System Revenue</p>
            <p className="text-xl font-black text-primary mt-1">${totalRevenue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* 3. Analytics charts simulation */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Occupancy Donut */}
        <div className="bg-card rounded-3xl border border-foreground/10 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground mb-4">Occupancy Pie Chart</h3>
            <div className="flex items-center justify-center py-4">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="50" fill="transparent" stroke="var(--muted)" strokeWidth="18" />
                <circle 
                  cx="64" 
                  cy="64" 
                  r="50" 
                  fill="transparent" 
                  stroke="var(--primary)" 
                  strokeWidth="18" 
                  strokeDasharray={`${2 * Math.PI * 50}`}
                  strokeDashoffset={`${2 * Math.PI * 50 * (1 - occupancyRate / 100)}`}
                />
              </svg>
            </div>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground pt-4 border-t border-foreground/5 mt-4">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-primary rounded-full" /> Occupied ({occupancyRate}%)</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-muted rounded-full" /> Vacant ({100 - occupancyRate}%)</span>
          </div>
        </div>

        {/* Monthly Revenue Bar Chart */}
        <div className="bg-card rounded-3xl border border-foreground/10 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground mb-4">Revenue Trend Chart</h3>
            <div className="flex items-end justify-between gap-2 h-32 pt-4">
              <div className="w-full bg-primary/20 rounded-t h-12 flex flex-col justify-end"><div className="bg-primary/50 w-full h-8 rounded-t" /></div>
              <div className="w-full bg-primary/20 rounded-t h-16 flex flex-col justify-end"><div className="bg-primary/60 w-full h-12 rounded-t" /></div>
              <div className="w-full bg-primary/20 rounded-t h-24 flex flex-col justify-end"><div className="bg-primary/70 w-full h-20 rounded-t" /></div>
              <div className="w-full bg-primary/20 rounded-t h-28 flex flex-col justify-end"><div className="bg-primary/80 w-full h-24 rounded-t" /></div>
              <div className="w-full bg-primary/20 rounded-t h-32 flex flex-col justify-end"><div className="bg-primary w-full h-28 rounded-t" /></div>
            </div>
          </div>
          <div className="flex justify-between text-[9px] text-muted-foreground pt-3 border-t border-foreground/5 mt-4">
            <span>Jan</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
          </div>
        </div>

        {/* Payment Status donut */}
        <div className="bg-card rounded-3xl border border-foreground/10 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground mb-4">Payment Status Chart</h3>
            <div className="flex items-center justify-center py-4">
              <svg className="w-32 h-32">
                <circle cx="64" cy="64" r="48" fill="transparent" stroke="var(--destructive)" strokeWidth="10" />
                <circle 
                  cx="64" 
                  cy="64" 
                  r="48" 
                  fill="transparent" 
                  stroke="var(--accent)" 
                  strokeWidth="12" 
                  strokeDasharray={`${2 * Math.PI * 48}`}
                  strokeDashoffset={`${2 * Math.PI * 48 * 0.3}`}
                />
                <circle 
                  cx="64" 
                  cy="64" 
                  r="48" 
                  fill="transparent" 
                  stroke="oklch(0.9 0.22 130)" 
                  strokeWidth="14" 
                  strokeDasharray={`${2 * Math.PI * 48}`}
                  strokeDashoffset={`${2 * Math.PI * 48 * 0.7}`}
                />
              </svg>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1 text-[9px] text-muted-foreground pt-4 border-t border-foreground/5 mt-4 text-center">
            <span className="flex items-center justify-center gap-1 truncate"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Paid</span>
            <span className="flex items-center justify-center gap-1 truncate"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Pending</span>
            <span className="flex items-center justify-center gap-1 truncate"><span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Overdue</span>
          </div>
        </div>

        {/* System Summary Box */}
        <div className="bg-card rounded-3xl border border-foreground/10 p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-8 -mt-8 pointer-events-none" />
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Database className="w-4 h-4 text-primary" /> System Summary Box
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Console Status:</span>
                <span className="text-green-600 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-ping" /> {systemSummary.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Database Engine:</span>
                <span className="font-semibold text-foreground">{systemSummary.database}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Global records:</span>
                <span className="font-mono font-bold text-foreground">{systemSummary.totalRecords} records</span>
              </div>
            </div>
          </div>
          <div className="pt-4 border-t border-foreground/5 mt-4 text-[10px] text-muted-foreground leading-normal flex items-start gap-1.5">
            <Info className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
            <span>Telemetry stats are calculated system-wide across all scoped landlord tenants.</span>
          </div>
        </div>
      </div>

      {/* 4. Activity Logs & Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Recent Activity Logs List */}
        <div className="lg:col-span-5 bg-card rounded-3xl border border-foreground/10 p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" /> Recent Activity Logs
              </h3>
              <Link to="/super-admin/activity-logs" className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5">
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-3.5">
              {recentLogs && recentLogs.length > 0 ? (
                recentLogs.map((log: any) => (
                  <div key={log.id} className="flex gap-3 text-xs leading-normal">
                    <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                    <div>
                      <p className="font-bold text-foreground">{log.description}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">By {log.user} · {log.createdAt}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground py-4">No recent activity logged.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right: Recent payments/invoices table */}
        <div className="lg:col-span-7 bg-card rounded-3xl border border-foreground/10 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-primary" /> Recent Payments & Invoices
            </h3>
            <Link to="/super-admin/invoices" className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-foreground/10">
                  <th className="pb-3 font-bold text-muted-foreground uppercase">Invoice ID</th>
                  <th className="pb-3 font-bold text-muted-foreground uppercase">Owner</th>
                  <th className="pb-3 font-bold text-muted-foreground uppercase">Tenant</th>
                  <th className="pb-3 font-bold text-muted-foreground uppercase">Amount</th>
                  <th className="pb-3 font-bold text-muted-foreground uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/5">
                {recentPayments && recentPayments.length > 0 ? (
                  recentPayments.map((p: any) => (
                    <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 font-mono font-bold text-foreground">{p.invoiceId}</td>
                      <td className="py-3 text-muted-foreground font-medium">{p.owner}</td>
                      <td className="py-3 text-foreground">{p.tenant}</td>
                      <td className="py-3 font-black text-foreground">${parseFloat(p.amount).toFixed(2)}</td>
                      <td className="py-3">
                        <Badge variant={p.status === "paid" ? "success" : p.status === "overdue" ? "danger" : "warning"}>
                          {p.status.toUpperCase()}
                        </Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-muted-foreground">
                      No invoices registered yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 5. Recent Owners Joined */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Owners Table */}
        <div className="bg-card rounded-3xl border border-foreground/10 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <Users className="w-4 h-4 text-primary" /> Recent Owners Joined
            </h3>
            <Link to="/super-admin/owners" className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-foreground/10">
                  <th className="pb-3 font-bold text-muted-foreground uppercase">Owner Name</th>
                  <th className="pb-3 font-bold text-muted-foreground uppercase">Email</th>
                  <th className="pb-3 font-bold text-muted-foreground uppercase">Rooms</th>
                  <th className="pb-3 font-bold text-muted-foreground uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/5">
                {recentOwners && recentOwners.length > 0 ? (
                  recentOwners.map((owner: any) => (
                    <tr key={owner.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 font-bold text-foreground">{owner.name}</td>
                      <td className="py-3 text-muted-foreground">{owner.email}</td>
                      <td className="py-3 font-bold text-foreground">{owner.propertiesCount}</td>
                      <td className="py-3">
                        <Badge variant={owner.isActive ? "success" : "danger"}>
                          {owner.isActive ? "Active" : "Deactivated"}
                        </Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-muted-foreground">
                      No owners registered yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Properties (Global Rooms list) */}
        <div className="bg-card rounded-3xl border border-foreground/10 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-primary" /> Recent Properties
            </h3>
            <Link to="/super-admin/properties" className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5">
              Browse All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-foreground/10">
                  <th className="pb-3 font-bold text-muted-foreground uppercase">Room</th>
                  <th className="pb-3 font-bold text-muted-foreground uppercase">Owner</th>
                  <th className="pb-3 font-bold text-muted-foreground uppercase">Monthly Rent</th>
                  <th className="pb-3 font-bold text-muted-foreground uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/5">
                {recentProperties && recentProperties.length > 0 ? (
                  recentProperties.map((prop: any) => (
                    <tr key={prop.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 font-bold text-foreground">Room {prop.roomNumber}</td>
                      <td className="py-3 text-muted-foreground font-medium">{prop.owner}</td>
                      <td className="py-3 font-bold text-foreground">${prop.rent}</td>
                      <td className="py-3">
                        <Badge variant={
                          prop.status === "occupied" ? "success" :
                          prop.status === "vacant" ? "default" : "warning"
                        }>
                          {prop.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-muted-foreground">
                      No properties registered.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
