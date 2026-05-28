import { useState, useEffect } from "react";
import { 
  Search, RefreshCw, Activity, Calendar
} from "lucide-react";
import { api } from "../lib/api";

export function SuperAdminActivityLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("all");

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (action !== "all") params.action = action;
      if (search) params.search = search;

      const res = await api.getSuperAdminActivityLogs(params);
      setLogs(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [action]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">System Activity Logs</h1>
        <p className="text-muted-foreground mt-1">Cross-landlord system-wide audit telemetry logs</p>
      </div>

      <div className="bg-card rounded-3xl border border-foreground/10 p-6 shadow-sm space-y-4">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search logs by description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchLogs()}
              className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm font-medium"
            />
          </div>

          <div className="flex gap-2 min-w-[200px]">
            <select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="flex-1 px-4 py-2 border border-border rounded-xl bg-background text-foreground text-xs font-semibold uppercase tracking-wider focus:outline-none"
            >
              <option value="all">All Actions</option>
              <option value="owner_created">Owner Created</option>
              <option value="owner_deleted">Owner Deleted</option>
              <option value="account_suspended">Account Suspended</option>
              <option value="account_activated">Account Activated</option>
              <option value="property_created">Property Created</option>
              <option value="property_updated">Property Updated</option>
              <option value="property_deleted">Property Deleted</option>
              <option value="invoice_generated">Invoice Generated</option>
              <option value="invoice_deleted">Invoice Deleted</option>
              <option value="payment_completed">Payment Completed</option>
              <option value="settings_updated">Settings Updated</option>
            </select>

            <button
              onClick={fetchLogs}
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
                <th className="p-4 pl-6">Timestamp</th>
                <th className="p-4">Action</th>
                <th className="p-4">Description</th>
                <th className="p-4">Triggered By</th>
                <th className="p-4 pr-6">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/5 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-muted-foreground font-semibold">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" /> Loading activity logs...
                  </td>
                </tr>
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 pl-6 text-muted-foreground font-mono text-xs flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {log.createdAt}</td>
                    <td className="p-4">
                      <span className="font-mono text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded uppercase tracking-wider">
                        {log.action.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-foreground font-semibold">{log.description}</td>
                    <td className="p-4 text-muted-foreground">{log.user}</td>
                    <td className="p-4 pr-6 text-muted-foreground font-mono text-xs">{log.ipAddress || "::1"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-muted-foreground">
                    No system activity logs found.
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
