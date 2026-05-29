import { useState, useEffect } from "react";
import { 
  Search, RefreshCw, CreditCard, Download, CheckCircle
} from "lucide-react";
import { Badge } from "../components/Badge";
import { api } from "../lib/api";

export function SuperAdminPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [owners, setOwners] = useState<any[]>([]);
  const [ownerFilter, setOwnerFilter] = useState("all");

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = { status: "paid" }; // Completed payments
      if (ownerFilter !== "all") params.owner_id = ownerFilter;
      if (search) params.search = search;

      const res = await api.getSuperAdminInvoices(params);
      setPayments(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOwners = async () => {
    try {
      const res = await api.getOwners({ limit: "50" });
      setOwners(res.data.data || []);
    } catch {}
  };

  useEffect(() => {
    fetchPayments();
    fetchOwners();
  }, [ownerFilter]);

  const exportPaymentsCSV = () => {
    const headers = ["Invoice ID", "Owner", "Tenant", "Room", "Billing Month", "Amount Paid", "Date Paid"];
    const rows = payments.map(p => [
      p.invoiceId, p.owner, p.tenant, `Room ${p.room}`, p.month, `$${parseFloat(p.total).toFixed(2)}`, p.paidDate || "N/A"
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `system_payments_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalSettledRevenue = payments.reduce((sum, p) => sum + parseFloat(p.total || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">System Payments</h1>
          <p className="text-muted-foreground mt-1">Cross-landlord system-wide payment transaction log</p>
        </div>
        <button
          onClick={exportPaymentsCSV}
          className="px-5 py-2.5 bg-foreground text-background font-black uppercase text-xs rounded-xl hover:opacity-90 active:scale-95 transition-all border border-foreground shadow-sm flex items-center gap-2 self-start md:self-auto"
        >
          <Download className="w-4 h-4" /> Export payments
        </button>
      </div>

      {/* Revenue telemetry bar */}
      <div className="bg-card rounded-3xl border border-foreground/10 p-6 shadow-sm flex items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-8 -mt-8 pointer-events-none" />
        <div className="bg-emerald-500/10 text-emerald-600 p-3.5 rounded-2xl border border-emerald-500/20 shrink-0">
          <CreditCard className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Total Settled Transactions</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">${totalSettledRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
      </div>

      <div className="bg-card rounded-3xl border border-foreground/10 p-6 shadow-sm space-y-4">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search settled payments by ID, Tenant..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchPayments()}
              className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm font-medium"
            />
          </div>

          <div className="flex gap-2 min-w-[200px]">
            <select
              value={ownerFilter}
              onChange={(e) => setOwnerFilter(e.target.value)}
              className="flex-1 px-4 py-2 border border-border rounded-xl bg-background text-foreground text-xs font-semibold uppercase tracking-wider focus:outline-none"
            >
              <option value="all">All Landlords</option>
              {owners.map((owner) => (
                <option key={owner.id} value={owner.id}>{owner.name}</option>
              ))}
            </select>

            <button
              onClick={fetchPayments}
              className="p-2.5 bg-primary text-primary-foreground rounded-xl hover:opacity-90 active:scale-95 transition-all border border-foreground shadow-sm"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-foreground/10 rounded-2xl">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-muted/40">
              <tr className="border-b border-foreground/10 text-xs font-black uppercase text-muted-foreground tracking-wider">
                <th className="p-4 pl-6">Invoice ID</th>
                <th className="p-4">Owner</th>
                <th className="p-4">Tenant</th>
                <th className="p-4">Room</th>
                <th className="p-4">Billing Month</th>
                <th className="p-4">Amount Paid</th>
                <th className="p-4">Payment Method</th>
                <th className="p-4 pr-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/5 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-muted-foreground font-semibold">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" /> Loading payments...
                  </td>
                </tr>
              ) : payments.length > 0 ? (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 pl-6 font-mono font-bold text-foreground">{p.invoiceId}</td>
                    <td className="p-4 text-muted-foreground">{p.owner}</td>
                    <td className="p-4 text-foreground">{p.tenant}</td>
                    <td className="p-4 text-muted-foreground">Room {p.room}</td>
                    <td className="p-4 text-muted-foreground">{p.month}</td>
                    <td className="p-4 font-black text-emerald-600">${parseFloat(p.total).toFixed(2)}</td>
                    <td className="p-4 text-muted-foreground uppercase text-xs font-mono">{p.paymentMethod || "QR CODE"}</td>
                    <td className="p-4 pr-6">
                      <Badge variant="success">
                        <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> SETTLED</span>
                      </Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-muted-foreground">
                    No system payments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
