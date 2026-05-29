import { useState, useEffect } from "react";
import { 
  Search, Filter, Receipt, ArrowRight, Eye, RefreshCw, X, ShieldCheck, Building2
} from "lucide-react";
import { Badge } from "../components/Badge";
import { api } from "../lib/api";

export function SuperAdminInvoices() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [owners, setOwners] = useState<any[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (status !== "all") params.status = status;
      if (ownerFilter !== "all") params.owner_id = ownerFilter;
      if (search) params.search = search;

      const res = await api.getSuperAdminInvoices(params);
      setInvoices(res.data.data || []);
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
    fetchInvoices();
    fetchOwners();
  }, [status, ownerFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">System Invoices</h1>
        <p className="text-muted-foreground mt-1">Cross-landlord system-wide invoice ledger</p>
      </div>

      <div className="bg-card rounded-3xl border border-foreground/10 p-6 shadow-sm space-y-4">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by Invoice ID or Tenant name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchInvoices()}
              className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm font-medium"
            />
          </div>

          <div className="flex gap-2 min-w-[320px]">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="flex-1 px-4 py-2 border border-border rounded-xl bg-background text-foreground text-xs font-semibold uppercase tracking-wider focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>

            <select
              value={ownerFilter}
              onChange={(e) => setOwnerFilter(e.target.value)}
              className="flex-1 px-4 py-2 border border-border rounded-xl bg-background text-foreground text-xs font-semibold uppercase tracking-wider focus:outline-none"
            >
              <option value="all">All Owners</option>
              {owners.map((owner) => (
                <option key={owner.id} value={owner.id}>{owner.name}</option>
              ))}
            </select>

            <button
              onClick={fetchInvoices}
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
                <th className="p-4">Amount</th>
                <th className="p-4">Due Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/5 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-muted-foreground font-semibold">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" /> Loading invoices...
                  </td>
                </tr>
              ) : invoices.length > 0 ? (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 pl-6 font-mono font-bold text-foreground">{inv.invoiceId}</td>
                    <td className="p-4 text-muted-foreground">{inv.owner}</td>
                    <td className="p-4 text-foreground">{inv.tenant}</td>
                    <td className="p-4 text-muted-foreground">Room {inv.room}</td>
                    <td className="p-4 text-muted-foreground">{inv.month}</td>
                    <td className="p-4 font-black text-foreground">${parseFloat(inv.total).toFixed(2)}</td>
                    <td className="p-4 font-bold text-rose-500/80">{inv.dueDate}</td>
                    <td className="p-4">
                      <Badge variant={inv.status === "paid" ? "success" : inv.status === "overdue" ? "danger" : "warning"}>
                        {inv.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-all border border-transparent hover:border-foreground/10"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-muted-foreground">
                    No system invoices found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-start justify-center z-50 p-4 md:p-6 overflow-y-auto">
          <div className="bg-card rounded-3xl border border-foreground/15 max-w-2xl w-full p-4 sm:p-6 md:p-8 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-150 border-t-8 border-t-primary my-auto">
            <button 
              onClick={() => setSelectedInvoice(null)} 
              className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 hover:bg-muted rounded-xl transition-all border border-foreground/5 text-muted-foreground hover:text-foreground z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 pb-6 border-b border-foreground/10 pr-10 sm:pr-0">
              <div className="bg-primary text-primary-foreground p-3 rounded-2xl shadow-brutal-sm border border-foreground shrink-0">
                <Receipt className="w-6 h-6 text-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-black text-foreground">Invoice #{selectedInvoice.invoiceId}</h3>
                <div className="text-[11px] text-muted-foreground font-semibold mt-1">
                  <span>Landlord: <strong className="text-foreground">{selectedInvoice.owner}</strong></span>
                  {selectedInvoice.property && (
                    <span className="block text-[10px] text-muted-foreground/80 mt-0.5 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-primary shrink-0" /> {selectedInvoice.property.name} &bull; {selectedInvoice.property.address}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="py-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-muted/20 p-4 rounded-xl border border-foreground/5">
                  <p className="font-extrabold text-muted-foreground uppercase text-[9px]">Billed Tenant</p>
                  <p className="font-bold text-foreground text-sm mt-1">{selectedInvoice.tenant}</p>
                  <p className="text-muted-foreground mt-0.5">Room {selectedInvoice.room} • <span className="font-semibold text-foreground/80">{selectedInvoice.roomType || "Standard Suite"}</span></p>
                </div>
                <div className="bg-muted/20 p-4 rounded-xl border border-foreground/5">
                  <p className="font-extrabold text-muted-foreground uppercase text-[9px]">Due Date</p>
                  <p className="font-bold text-rose-500 text-sm mt-1">{selectedInvoice.dueDate}</p>
                  <p className="text-muted-foreground mt-0.5">Cycle: {selectedInvoice.month}</p>
                </div>
              </div>

              <div className="p-4 bg-muted/10 rounded-xl border border-foreground/10 space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">Monthly Base Room Rent:</span>
                  <span className="text-foreground">${parseFloat(selectedInvoice.amount).toFixed(2)}</span>
                </div>
                {parseFloat(selectedInvoice.utilityAmount || 0) > 0 && (
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-muted-foreground">Utilities (Electricity & Water):</span>
                    <span className="text-foreground">${parseFloat(selectedInvoice.utilityAmount).toFixed(2)}</span>
                  </div>
                )}
                {parseFloat(selectedInvoice.lateFee || 0) > 0 && (
                  <div className="flex justify-between text-xs font-semibold text-rose-500">
                    <span className="text-rose-500 font-bold">Late Fee Applied:</span>
                    <span className="font-bold">${parseFloat(selectedInvoice.lateFee).toFixed(2)}</span>
                  </div>
                )}
                <div className="h-px bg-foreground/10 my-2" />
                <div className="flex justify-between items-baseline font-black">
                  <span className="text-xs text-foreground uppercase tracking-wider">Grand Total:</span>
                  <span className="text-lg text-primary font-mono">${parseFloat(selectedInvoice.total || selectedInvoice.amount).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-5 border-t border-foreground/10">
              <div className="text-[10px] text-muted-foreground flex items-center gap-1 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> RentFlow System Invoice Verified
              </div>
              <button 
                onClick={() => setSelectedInvoice(null)}
                className="px-6 py-2.5 bg-foreground text-background text-xs font-black uppercase rounded-xl border border-foreground shadow-sm hover:opacity-90 active:scale-95 transition-all"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
